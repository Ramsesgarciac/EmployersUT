import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Justificante } from './entities/justificante.entity';
import { Incidencia } from '../incidencia/entities/incidencia.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JustificanteService {
  constructor(
    @InjectRepository(Justificante)
    private justificanteRepository: Repository<Justificante>,
    @InjectRepository(Incidencia)
    private incidenciaRepository: Repository<Incidencia>,
  ) { }

  /**
   * Normaliza el nombre del empleado para usarlo como prefijo de archivo
   * Convierte a minúsculas, reemplaza espacios por guiones bajos y elimina caracteres especiales
   */
  private normalizeEmployeeName(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales excepto espacios
      .trim()
      .replace(/\s+/g, '_'); // Reemplazar espacios por guiones bajos
  }

  async uploadJustificante(
    id_incidencia: number,
    file: Express.Multer.File
  ): Promise<Justificante> {
    // Verificar que la incidencia existe y obtener la relación con el empleado
    const incidencia = await this.incidenciaRepository.findOne({
      where: { id_incidencia },
      relations: ['empleado']
    });

    if (!incidencia) {
      throw new NotFoundException(`Incidencia con ID ${id_incidencia} no encontrada`);
    }

    // Validar que sea PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe exceder 5MB');
    }

    // Crear directorio si no existe
    const uploadPath = path.join('uploads', 'justificantes', String(id_incidencia));
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar prefijo con el nombre del empleado
    const employeePrefix = this.normalizeEmployeeName(incidencia.empleado.nombre);

    // Generar nombre único para el archivo con prefijo del empleado
    const timestamp = Date.now();
    const fileName = `${employeePrefix}_justificante_${timestamp}_${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    // Crear registro en base de datos
    const justificante = this.justificanteRepository.create({
      id_incidencia,
      nombre_archivo: fileName,
      ruta_archivo: filePath
    });

    return await this.justificanteRepository.save(justificante);
  }

  async findAll(): Promise<Justificante[]> {
    return await this.justificanteRepository.find({
      relations: ['incidencia', 'incidencia.empleado', 'incidencia.tipoIncidencia'],
      order: { fecha_subida: 'DESC' }
    });
  }

  async findByIncidencia(id_incidencia: number): Promise<Justificante[]> {
    return await this.justificanteRepository.find({
      where: { id_incidencia },
      order: { fecha_subida: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Justificante> {
    const justificante = await this.justificanteRepository.findOne({
      where: { id_justificante: id },
      relations: ['incidencia']
    });

    if (!justificante) {
      throw new NotFoundException(`Justificante con ID ${id} no encontrado`);
    }

    return justificante;
  }

  async downloadFile(id: number): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const justificante = await this.findOne(id);

    if (!fs.existsSync(justificante.ruta_archivo)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    const buffer = fs.readFileSync(justificante.ruta_archivo);

    return {
      buffer,
      filename: justificante.nombre_archivo,
      mimetype: 'application/pdf'
    };
  }

  async remove(id: number): Promise<void> {
    const justificante = await this.findOne(id);

    // Eliminar archivo físico
    if (fs.existsSync(justificante.ruta_archivo)) {
      fs.unlinkSync(justificante.ruta_archivo);
    }

    // Eliminar registro de base de datos
    await this.justificanteRepository.remove(justificante);
  }

  async replaceFile(
    id: number,
    file: Express.Multer.File
  ): Promise<Justificante> {
    const justificante = await this.justificanteRepository.findOne({
      where: { id_justificante: id },
      relations: ['incidencia', 'incidencia.empleado']
    });

    if (!justificante) {
      throw new NotFoundException(`Justificante con ID ${id} no encontrado`);
    }

    // Validar que sea PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    // Validar tamaño
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe exceder 5MB');
    }

    // Eliminar archivo anterior
    if (fs.existsSync(justificante.ruta_archivo)) {
      fs.unlinkSync(justificante.ruta_archivo);
    }

    // Generar prefijo con el nombre del empleado
    const employeePrefix = this.normalizeEmployeeName(justificante.incidencia.empleado.nombre);

    // Crear nuevo archivo
    const uploadPath = path.dirname(justificante.ruta_archivo);
    const timestamp = Date.now();
    const fileName = `${employeePrefix}_justificante_${timestamp}_${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    // Actualizar registro
    justificante.nombre_archivo = fileName;
    justificante.ruta_archivo = filePath;

    return await this.justificanteRepository.save(justificante);
  }
}
