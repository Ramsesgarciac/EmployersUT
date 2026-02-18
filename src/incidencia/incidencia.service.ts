import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Incidencia } from './entities/incidencia.entity';
import { Justificante } from '../justificante/entities/justificante.entity';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IncidenciaService {
  constructor(
    @InjectRepository(Incidencia)
    private incidenciaRepository: Repository<Incidencia>,
    @InjectRepository(Justificante)
    private justificanteRepository: Repository<Justificante>,
  ) { }

  async create(createIncidenciaDto: CreateIncidenciaDto): Promise<Incidencia> {
    const incidencia = this.incidenciaRepository.create(createIncidenciaDto);
    return await this.incidenciaRepository.save(incidencia);
  }

  async findAll(): Promise<Incidencia[]> {
    return await this.incidenciaRepository.find({
      relations: ['empleado', 'tipoIncidencia', 'justificantes'],
      order: { fecha_registro: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Incidencia> {
    const incidencia = await this.incidenciaRepository.findOne({
      where: { id_incidencia: id },
      relations: ['empleado', 'tipoIncidencia', 'justificantes']
    });

    if (!incidencia) {
      throw new NotFoundException(`Incidencia con ID ${id} no encontrada`);
    }

    return incidencia;
  }

  async findByEmpleado(id_empleado: number): Promise<Incidencia[]> {
    return await this.incidenciaRepository.find({
      where: { id_empleado },
      relations: ['tipoIncidencia', 'justificantes'],
      order: { fecha_inicio: 'DESC' }
    });
  }

  async findByDateRange(fecha_inicio: Date, fecha_fin: Date): Promise<Incidencia[]> {
    return await this.incidenciaRepository.find({
      where: {
        fecha_inicio: Between(fecha_inicio, fecha_fin)
      },
      relations: ['empleado', 'tipoIncidencia']
    });
  }

  async update(id: number, updateIncidenciaDto: UpdateIncidenciaDto): Promise<Incidencia> {
    const incidencia = await this.findOne(id);
    Object.assign(incidencia, updateIncidenciaDto);
    return await this.incidenciaRepository.save(incidencia);
  }

  async remove(id: number): Promise<void> {
    const incidencia = await this.findOne(id);

    // Eliminar justificantes físicos
    for (const justificante of incidencia.justificantes) {
      await this.deleteFile(justificante.ruta_archivo);
    }

    await this.incidenciaRepository.remove(incidencia);
  }

  async uploadJustificante(
    id_incidencia: number,
    file: Express.Multer.File
  ): Promise<Justificante> {
    const incidencia = await this.findOne(id_incidencia);

    const uploadPath = path.join('uploads', 'justificantes', String(id_incidencia));

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    const justificante = this.justificanteRepository.create({
      id_incidencia,
      nombre_archivo: file.originalname,
      ruta_archivo: filePath
    });

    return await this.justificanteRepository.save(justificante);
  }

  async deleteJustificante(id_justificante: number): Promise<void> {
    const justificante = await this.justificanteRepository.findOne({
      where: { id_justificante }
    });

    if (!justificante) {
      throw new NotFoundException(`Justificante con ID ${id_justificante} no encontrado`);
    }

    await this.deleteFile(justificante.ruta_archivo);
    await this.justificanteRepository.remove(justificante);
  }

  private async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}