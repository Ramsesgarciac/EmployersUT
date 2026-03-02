// src/contrato/contrato.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { TipoContrato } from '../tipo-contrato/entities/tipo-contrato.entity';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContratoService {
  constructor(
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(TipoContrato)
    private tipoContratoRepository: Repository<TipoContrato>,
  ) { }

  async uploadContrato(
    id_empleado: number,
    id_tipo_contrato: number,
    fecha_inicio: Date,
    fecha_fin: Date,
    file: Express.Multer.File
  ): Promise<Contrato> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado }
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    const tipoContrato = await this.tipoContratoRepository.findOne({
      where: { id_tipo_contrato }
    });

    if (!tipoContrato) {
      throw new NotFoundException(`Tipo de contrato con ID ${id_tipo_contrato} no encontrado`);
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe exceder 10MB');
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      throw new BadRequestException('La fecha de inicio debe ser menor a la fecha fin');
    }

    // ✅ DESACTIVAR TODOS LOS CONTRATOS ANTERIORES DEL EMPLEADO
    await this.contratoRepository.update(
      { id_empleado, vigente: true },
      { vigente: false }
    );

    const uploadPath = path.join('uploads', 'contratos', String(id_empleado));
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `contrato_${id_tipo_contrato}_${timestamp}.pdf`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const contrato = this.contratoRepository.create({
      id_empleado,
      id_tipo_contrato,
      nombre_archivo: file.originalname,
      ruta_archivo: filePath,
      fecha_inicio,
      fecha_fin,
      vigente: true  // ✅ El nuevo contrato es el único vigente
    });

    return await this.contratoRepository.save(contrato);
  }

  // ✅ CRON JOB: Se ejecuta todos los días a medianoche para verificar contratos vencidos
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async verificarContratosVencidos() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar contratos vigentes cuya fecha_fin ya pasó
    const contratosVencidos = await this.contratoRepository.find({
      where: {
        vigente: true,
        fecha_fin: LessThanOrEqual(hoy)
      },
      relations: ['empleado']
    });

    if (contratosVencidos.length > 0) {
      console.log(`📋 Contratos vencidos encontrados: ${contratosVencidos.length}`);

      for (const contrato of contratosVencidos) {
        contrato.vigente = false;
        await this.contratoRepository.save(contrato);
        console.log(`❌ Contrato ID ${contrato.id_contrato} del empleado ${contrato.empleado.nombre} marcado como no vigente`);
      }
    }
  }

  // ✅ MÉTODO MANUAL: Para verificar contratos vencidos bajo demanda
  // src/contrato/contrato.service.ts

  async verificarYActualizarContratosVencidos(): Promise<{
    total_verificados: number;
    total_desactivados: number;
    contratos_desactivados: any[];
  }> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const contratosVencidos = await this.contratoRepository.find({
      where: {
        vigente: true,
        fecha_fin: LessThanOrEqual(hoy)
      },
      relations: ['empleado', 'tipoContrato']
    });

    //DEFINE EL TIPO EXPLÍCITAMENTE
    const contratosDesactivados: Array<{
      id_contrato: number;
      empleado: string;
      tipo_contrato: string;
      fecha_fin: Date;
    }> = [];

    for (const contrato of contratosVencidos) {
      contrato.vigente = false;
      await this.contratoRepository.save(contrato);

      contratosDesactivados.push({
        id_contrato: contrato.id_contrato,
        empleado: contrato.empleado.nombre,
        tipo_contrato: contrato.tipoContrato.nombre,
        fecha_fin: contrato.fecha_fin
      });
    }

    const totalContratos = await this.contratoRepository.count();

    return {
      total_verificados: totalContratos,
      total_desactivados: contratosDesactivados.length,
      contratos_desactivados: contratosDesactivados
    };
  }

  async findAll(): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      relations: ['empleado', 'tipoContrato'],
      order: { fecha_carga: 'DESC' }
    });
  }

  async findByEmpleado(id_empleado: number): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { id_empleado },
      relations: ['tipoContrato'],
      order: { fecha_inicio: 'DESC' }
    });
  }

  async findVigentes(id_empleado: number): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { id_empleado, vigente: true },
      relations: ['tipoContrato'],
      order: { fecha_inicio: 'DESC' }
    });
  }

  async findContratoVigenteActual(id_empleado: number): Promise<Contrato | null> {
    const contrato = await this.contratoRepository.findOne({
      where: { id_empleado, vigente: true },
      relations: ['tipoContrato', 'empleado'],
      order: { fecha_inicio: 'DESC' }
    });

    return contrato || null;
  }

  async findOne(id: number): Promise<Contrato> {
    const contrato = await this.contratoRepository.findOne({
      where: { id_contrato: id },
      relations: ['empleado', 'tipoContrato']
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }

    return contrato;
  }

  async downloadFile(id: number): Promise<{ buffer: Buffer; filename: string }> {
    const contrato = await this.findOne(id);

    if (!fs.existsSync(contrato.ruta_archivo)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    const buffer = fs.readFileSync(contrato.ruta_archivo);

    return {
      buffer,
      filename: contrato.nombre_archivo
    };
  }

  async update(id: number, updateContratoDto: UpdateContratoDto): Promise<Contrato> {
    const contrato = await this.findOne(id);

    if (updateContratoDto.fecha_inicio && updateContratoDto.fecha_fin) {
      if (new Date(updateContratoDto.fecha_inicio) >= new Date(updateContratoDto.fecha_fin)) {
        throw new BadRequestException('La fecha de inicio debe ser menor a la fecha fin');
      }
    }

    Object.assign(contrato, updateContratoDto);
    return await this.contratoRepository.save(contrato);
  }

  async replaceFile(id: number, file: Express.Multer.File): Promise<Contrato> {
    const contrato = await this.findOne(id);

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe exceder 10MB');
    }

    if (fs.existsSync(contrato.ruta_archivo)) {
      fs.unlinkSync(contrato.ruta_archivo);
    }

    const uploadPath = path.dirname(contrato.ruta_archivo);
    const timestamp = Date.now();
    const fileName = `contrato_${contrato.id_tipo_contrato}_${timestamp}.pdf`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    contrato.nombre_archivo = file.originalname;
    contrato.ruta_archivo = filePath;

    return await this.contratoRepository.save(contrato);
  }

  async marcarComoNoVigente(id: number): Promise<Contrato> {
    const contrato = await this.findOne(id);
    contrato.vigente = false;
    return await this.contratoRepository.save(contrato);
  }

  async remove(id: number): Promise<void> {
    const contrato = await this.findOne(id);

    if (fs.existsSync(contrato.ruta_archivo)) {
      fs.unlinkSync(contrato.ruta_archivo);
    }

    await this.contratoRepository.remove(contrato);
  }
}