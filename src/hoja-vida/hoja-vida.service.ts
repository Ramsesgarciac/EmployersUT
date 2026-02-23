import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HojaVida } from './entities/hoja-vida.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
// import PDFDocument from 'pdfkit';
const PDFDocument = require('pdfkit');

@Injectable()
export class HojaVidaService {
  constructor(
    @InjectRepository(HojaVida)
    private hojaVidaRepository: Repository<HojaVida>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
  ) { }

  async findByEmpleado(id_empleado: number): Promise<HojaVida> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado }
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    let hojaVida = await this.hojaVidaRepository.findOne({
      where: { id_empleado },
      relations: ['empleado', 'eventos', 'eventos.tipoEvento']
    });

    // Si no existe hoja de vida, crearla
    if (!hojaVida) {
      hojaVida = this.hojaVidaRepository.create({ id_empleado });
      hojaVida = await this.hojaVidaRepository.save(hojaVida);
      hojaVida.empleado = empleado;
      hojaVida.eventos = [];
    }

    // Ordenar eventos por fecha
    if (hojaVida.eventos) {
      hojaVida.eventos.sort((a, b) =>
        new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
      );
    }

    return hojaVida;
  }

  async generatePDF(id_empleado: number): Promise<Buffer> {
    const hojaVida = await this.findByEmpleado(id_empleado);

    return new Promise((resolve, reject) => {
      try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Contenido simple
        doc.fontSize(20).text('HOJA DE VIDA LABORAL', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Empleado: ${hojaVida.empleado.nombre}`);
        doc.text(`Número: ${hojaVida.empleado.numero_empleado}`);
        doc.moveDown();
        doc.text(`Total de eventos: ${hojaVida.eventos?.length || 0}`);

        doc.end();
      } catch (error) {
        console.error('Error generando PDF:', error);
        reject(error);
      }
    });
  }

  async getResumen(id_empleado: number) {
    const hojaVida = await this.findByEmpleado(id_empleado);

    const totalEventos = hojaVida.eventos?.length || 0;
    const eventosPorTipo = {};

    hojaVida.eventos?.forEach(evento => {
      const tipo = evento.tipoEvento.nombre_evento;
      eventosPorTipo[tipo] = (eventosPorTipo[tipo] || 0) + 1;
    });

    const ultimoEvento = hojaVida.eventos?.[0] || null;

    return {
      empleado: {
        id_empleado: hojaVida.empleado.id_empleado,
        nombre: hojaVida.empleado.nombre,
        numero_empleado: hojaVida.empleado.numero_empleado,
        puesto: hojaVida.empleado.puesto,
        activo: hojaVida.empleado.activo
      },
      estadisticas: {
        total_eventos: totalEventos,
        eventos_por_tipo: eventosPorTipo,
        ultimo_evento: ultimoEvento ? {
          tipo: ultimoEvento.tipoEvento.nombre_evento,
          fecha: ultimoEvento.fecha_evento
        } : null
      }
    };
  }
}