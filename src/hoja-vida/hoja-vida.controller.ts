import { Controller, Get, Param, ParseIntPipe, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { HojaVidaService } from './hoja-vida.service';

@Controller('hoja-vida')
export class HojaVidaController {
  constructor(private readonly hojaVidaService: HojaVidaService) { }

  @Get('empleado/:id_empleado')
  findByEmpleado(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.hojaVidaService.findByEmpleado(id_empleado);
  }

  @Get('resumen/:id_empleado')
  getResumen(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.hojaVidaService.getResumen(id_empleado);
  }

  @Get('pdf/:id_empleado')
  @Header('Content-Type', 'application/pdf')
  async generatePDF(
    @Param('id_empleado', ParseIntPipe) id_empleado: number,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.hojaVidaService.generatePDF(id_empleado);

    const empleado = await this.hojaVidaService.findByEmpleado(id_empleado);
    const filename = `HojaVida_${empleado.empleado.numero_empleado}_${Date.now()}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}