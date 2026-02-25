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
    const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return new Promise((resolve, reject) => {
      try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({
          margins: { top: 50, bottom: 50, left: 60, right: 60 },
          size: 'A4'
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Colores - Tema verde
        const colorPrimario = '#22543d';
        const colorSecundario = '#276749';
        const colorTexto = '#2d3748';
        const colorGris = '#718096';

        // ===== ENCABEZADO =====
        doc.fillColor(colorPrimario)
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('HOJA DE VIDA LABORAL', { align: 'center', y: 30 });

        doc.moveDown(1.5);

        doc.fillColor(colorGris)
          .fontSize(10)
          .font('Helvetica')
          .text(`${fechaGeneracion}`, { align: 'right' });

        doc.moveDown(2);

        // ===== SECCIÓN: DATOS DEL EMPLEADO =====
        doc.fillColor(colorPrimario)
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('DATOS DEL EMPLEADO', { underline: true });

        doc.moveDown(0.8);

        // Tabla de datos del empleado
        const datosEmpleado = [
          { label: 'Nombre', value: hojaVida.empleado.nombre },
          { label: 'Número de Empleado', value: hojaVida.empleado.numero_empleado.toString() },
          { label: 'CURP', value: hojaVida.empleado.curp },
          { label: 'RFC', value: hojaVida.empleado.rfc },
          { label: 'Puesto', value: hojaVida.empleado.puesto }
        ];

        datosEmpleado.forEach((dato, index) => {
          const yPos = doc.y;
          const labelWidth = 150;

          // Fondo alternado
          if (index % 2 === 0) {
            doc.rect(50, yPos - 2, doc.page.width - 100, 20).fill('#f7fafc');
          }

          doc.fillColor(colorSecundario)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(dato.label + ':', 60, yPos);

          doc.fillColor(colorTexto)
            .font('Helvetica')
            .text(dato.value, 60 + labelWidth, yPos);

          doc.y = yPos + 22;
        });

        doc.moveDown(1.5);

        // ===== SECCIÓN: HISTORIAL DE EVENTOS =====
        doc.fillColor(colorPrimario)
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('HISTORIAL DE EVENTOS', { underline: true });

        doc.moveDown(0.8);

        if (hojaVida.eventos && hojaVida.eventos.length > 0) {
          // Encabezado de tabla
          const tableTop = doc.y;
          const colWidths = [180, 100, 100, 100];
          const colPositions = [60, 240, 340, 440];

          // Fondo del encabezado
          doc.rect(50, tableTop, doc.page.width - 100, 25).fill(colorSecundario);

          doc.fillColor('#ffffff')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Tipo de Evento', colPositions[0], tableTop + 7)
            .text('Fecha', colPositions[1], tableTop + 7)
            .text('Salario Anterior', colPositions[2], tableTop + 7)
            .text('Salario Nuevo', colPositions[3], tableTop + 7);

          doc.y = tableTop + 30;

          // Filas de eventos
          hojaVida.eventos.forEach((evento, index) => {
            const rowY = doc.y;

            // Verificar si necesitamos una nueva página
            if (rowY > doc.page.height - 150) {
              doc.addPage();
              doc.y = 50;
            }

            // Fondo alternado
            if (index % 2 === 0) {
              doc.rect(50, rowY - 2, doc.page.width - 100, 22).fill('#f7fafc');
            }

            doc.fillColor(colorTexto)
              .fontSize(9)
              .font('Helvetica')
              .text(evento.tipoEvento?.nombre_evento || 'Sin tipo', colPositions[0], rowY, { width: colWidths[0] - 10 })
              .text(new Date(evento.fecha_evento).toLocaleDateString('es-MX'), colPositions[1], rowY)
              .text(
                evento.salario_anterior ? `$${Number(evento.salario_anterior).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-',
                colPositions[2], rowY
              )
              .text(
                evento.salario_nuevo ? `$${Number(evento.salario_nuevo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-',
                colPositions[3], rowY
              );

            doc.y = rowY + 24;
          });

        } else {
          doc.fillColor(colorGris)
            .fontSize(11)
            .font('Helvetica-Oblique')
            .text('No hay eventos registrados para este empleado.', { align: 'center' });
        }

        // ===== SECCIÓN DE FIRMAS =====
        doc.moveDown(2);

        // Línea separadora
        doc.moveTo(60, doc.y)
          .lineTo(doc.page.width - 60, doc.y)
          .strokeColor(colorPrimario)
          .lineWidth(1)
          .stroke();

        doc.moveDown(1.5);

        // Posiciones para las firmas
        const firmaY = doc.y;
        const firmaWidth = 220;
        const leftFirmaX = 60;
        const rightFirmaX = doc.page.width - 60 - firmaWidth;

        // ===== FIRMAS =====
        // Recursos Humanos (izquierda)
        doc.fillColor(colorPrimario)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('RECURSOS HUMANOS', leftFirmaX, firmaY, { width: firmaWidth, align: 'center' });

        // Línea horizontal para firma - Recursos Humanos (doble de espacio)
        doc.moveTo(leftFirmaX + 10, firmaY + 90)
          .lineTo(leftFirmaX + firmaWidth - 10, firmaY + 90)
          .strokeColor(colorPrimario)
          .lineWidth(0.5)
          .stroke();

        // Nombre y Firma centrados debajo de la línea - Recursos Humanos
        doc.fillColor(colorTexto)
          .fontSize(9)
          .font('Helvetica')
          .text('Nombre y Firma', leftFirmaX, firmaY + 95, { width: firmaWidth, align: 'center' });

        // Departamento de Finanzas (derecha)
        doc.fillColor(colorPrimario)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('DEPARTAMENTO DE FINANZAS', rightFirmaX, firmaY, { width: firmaWidth, align: 'center' });

        // Línea horizontal para firma - Finanzas (doble de espacio)
        doc.moveTo(rightFirmaX + 10, firmaY + 90)
          .lineTo(rightFirmaX + firmaWidth - 10, firmaY + 90)
          .strokeColor(colorPrimario)
          .lineWidth(0.5)
          .stroke();

        // Nombre y Firma centrados debajo de la línea - Finanzas
        doc.fillColor(colorTexto)
          .fontSize(9)
          .font('Helvetica')
          .text('Nombre y Firma', rightFirmaX, firmaY + 95, { width: firmaWidth, align: 'center' });

        // ===== PIE DE PÁGINA =====
        const footerY = doc.page.height - 40;
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

    // Mapear eventos con la información solicitada
    const eventosListado = hojaVida.eventos?.map(evento => ({
      nombre_tipo_evento: evento.tipoEvento?.nombre_evento || 'Sin tipo',
      fecha_evento: evento.fecha_evento,
      salario_anterior: evento.salario_anterior,
      salario_nuevo: evento.salario_nuevo
    })) || [];

    return {
      empleado: {
        id_empleado: hojaVida.empleado.id_empleado,
        nombre: hojaVida.empleado.nombre,
        numero_empleado: hojaVida.empleado.numero_empleado,
        curp: hojaVida.empleado.curp,
        rfc: hojaVida.empleado.rfc,
        puesto: hojaVida.empleado.puesto,
        activo: hojaVida.empleado.activo
      },
      eventos: eventosListado,
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