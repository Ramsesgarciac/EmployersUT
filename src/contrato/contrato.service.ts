// src/contrato/contrato.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { TipoContrato } from '../tipo-contrato/entities/tipo-contrato.entity';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
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
    private configService: ConfigService,
  ) { }

  private getMailTransporter(): Transporter | null {
    const host = this.configService.get<string>('MAIL_HOST');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (!host || !user || !pass) {
      console.warn('No se enviaron alertas de contratos: faltan MAIL_HOST, MAIL_USER o MAIL_PASSWORD en .env');
      return null;
    }

    return nodemailer.createTransport({
      host,
      port: Number(this.configService.get('MAIL_PORT', 587)),
      secure: this.configService.get('MAIL_SECURE', 'false') === 'true',
      auth: {
        user,
        pass,
      },
    });
  }

  private parsearFechaLocal(fechaStr: string): Date {
    // Evita el desfase de zona horaria parseando la fecha como local
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // mediodía para evitar desfases
  }

  private getFechaObjetivo(diasRestantes: number): { inicio: Date; fin: Date } {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() + diasRestantes);

    const fin = new Date(inicio);
    fin.setHours(23, 59, 59, 999);

    return { inicio, fin };
  }

  private formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(fecha));
  }

  private async enviarCorreoAlertaContrato(contrato: Contrato, diasRestantes: number): Promise<void> {
    const transporter = this.getMailTransporter();
    const to = this.configService.get<string>('MAIL_TO');

    if (!transporter || !to) {
      console.warn('No se envio alerta de contrato: falta MAIL_TO en .env');
      return;
    }

    const mailFrom = this.configService.get<string>('MAIL_FROM');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const from = mailFrom || mailUser || to;
    const empleado = contrato.empleado?.nombre ?? `Empleado ID ${contrato.id_empleado}`;
    const tipoContrato = contrato.tipoContrato?.nombre ?? `Tipo ID ${contrato.id_tipo_contrato}`;
    const fechaFin = this.formatearFecha(contrato.fecha_fin);
    const asuntoTiempo = diasRestantes === 1 ? 'manana' : `en ${diasRestantes} dias`;

    await transporter.sendMail({
      from,
      to,
      subject: `Contrato por vencer ${asuntoTiempo}: ${empleado}`,
      text: [
        `El contrato de ${empleado} esta por vencer ${asuntoTiempo}.`,
        '',
        `Empleado: ${empleado}`,
        `Numero de empleado: ${contrato.empleado?.numero_empleado ?? 'No disponible'}`,
        `Tipo de contrato: ${tipoContrato}`,
        `Fecha de fin: ${fechaFin}`,
        `Dias restantes: ${diasRestantes}`,
      ].join('\n'),
      html: `
        <p>El contrato de <strong>${empleado}</strong> esta por vencer ${asuntoTiempo}.</p>
        <ul>
          <li><strong>Empleado:</strong> ${empleado}</li>
          <li><strong>Numero de empleado:</strong> ${contrato.empleado?.numero_empleado ?? 'No disponible'}</li>
          <li><strong>Tipo de contrato:</strong> ${tipoContrato}</li>
          <li><strong>Fecha de fin:</strong> ${fechaFin}</li>
          <li><strong>Dias restantes:</strong> ${diasRestantes}</li>
        </ul>
      `,
    });
  }

  async enviarCorreoPrueba(correoDestino?: string): Promise<{ mensaje: string; destinatario: string }> {
    const transporter = this.getMailTransporter();
    const to = correoDestino || this.configService.get<string>('MAIL_TO');

    if (!transporter) {
      throw new BadRequestException('Faltan MAIL_HOST, MAIL_USER o MAIL_PASSWORD en .env');
    }

    if (!to) {
      throw new BadRequestException('Debes enviar un correo destino o configurar MAIL_TO en .env');
    }

    const mailFrom = this.configService.get<string>('MAIL_FROM');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const from = mailFrom || mailUser || to;

    await transporter.sendMail({
      from,
      to,
      subject: 'Correo de prueba - GestionEM',
      text: 'Este es un correo de prueba enviado desde el backend de GestionEM.',
      html: '<p>Este es un correo de prueba enviado desde el backend de <strong>GestionEM</strong>.</p>',
    });

    return {
      mensaje: 'Correo de prueba enviado correctamente',
      destinatario: to,
    };
  }

  async uploadContrato(
    id_empleado: number,
    id_tipo_contrato: number,
    fecha_inicio: string,
    fecha_fin: string,
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

  @Cron('0 8 * * *', { timeZone: 'America/Mexico_City' })
  async enviarAlertasContratosPorVencer(): Promise<{
    total_alertas: number;
    detalle: Array<{ dias_restantes: number; contratos_encontrados: number; correos_enviados: number }>;
  }> {
    const alertas = [30, 7, 1];
    const detalle: Array<{ dias_restantes: number; contratos_encontrados: number; correos_enviados: number }> = [];
    let totalAlertas = 0;

    for (const diasRestantes of alertas) {
      const { inicio, fin } = this.getFechaObjetivo(diasRestantes);
      const contratos = await this.contratoRepository.find({
        where: {
          vigente: true,
          fecha_fin: Between(inicio, fin),
        },
        relations: ['empleado', 'tipoContrato'],
      });

      let correosEnviados = 0;

      for (const contrato of contratos) {
        try {
          await this.enviarCorreoAlertaContrato(contrato, diasRestantes);
          correosEnviados++;
          totalAlertas++;
        } catch (error) {
          console.error(`Error al enviar alerta del contrato ${contrato.id_contrato}:`, error);
        }
      }

      detalle.push({
        dias_restantes: diasRestantes,
        contratos_encontrados: contratos.length,
        correos_enviados: correosEnviados,
      });
    }

    return {
      total_alertas: totalAlertas,
      detalle,
    };
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

    // ✅ Validar tipo de contrato si viene en el request
    if (updateContratoDto.id_tipo_contrato !== undefined) {

      const tipoContrato = await this.tipoContratoRepository.findOne({
        where: {
          id_tipo_contrato: updateContratoDto.id_tipo_contrato
        }
      });

      if (!tipoContrato) {
        throw new NotFoundException(
          `Tipo de contrato con ID ${updateContratoDto.id_tipo_contrato} no encontrado`
        );
      }
    }

    const fechaInicio = updateContratoDto.fecha_inicio
      ? this.parsearFechaLocal(updateContratoDto.fecha_inicio)
      : contrato.fecha_inicio;

    const fechaFin = updateContratoDto.fecha_fin
      ? this.parsearFechaLocal(updateContratoDto.fecha_fin)
      : contrato.fecha_fin;

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha fin'
      );
    }

    const updateData: Partial<Contrato> = {};

    // ✅ Actualizar fecha inicio
    if (updateContratoDto.fecha_inicio !== undefined) {
      updateData.fecha_inicio = this.parsearFechaLocal(
        updateContratoDto.fecha_inicio
      );
    }

    // ✅ Actualizar fecha fin
    if (updateContratoDto.fecha_fin !== undefined) {
      updateData.fecha_fin = this.parsearFechaLocal(
        updateContratoDto.fecha_fin
      );
    }

    // ✅ Actualizar vigente
    if (updateContratoDto.vigente !== undefined) {
      updateData.vigente = updateContratoDto.vigente;
    }

    // ✅ Actualizar tipo contrato
    if (updateContratoDto.id_tipo_contrato !== undefined) {
      updateData.id_tipo_contrato =
        updateContratoDto.id_tipo_contrato;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'No se proporcionaron campos para actualizar'
      );
    }

    await this.contratoRepository.update(id, updateData);

    return await this.findOne(id);
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
