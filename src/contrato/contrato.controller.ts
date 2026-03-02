// src/contrato/contrato.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  HttpCode,
  HttpStatus,
  Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ContratoService } from './contrato.service';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Controller('contratos')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadContrato(
    @Body('id_empleado') id_empleado: string,
    @Body('id_tipo_contrato') id_tipo_contrato: string,
    @Body('fecha_inicio') fecha_inicio: string,
    @Body('fecha_fin') fecha_fin: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    const empleadoId = parseInt(id_empleado);
    const tipoContratoId = parseInt(id_tipo_contrato);

    if (isNaN(empleadoId) || isNaN(tipoContratoId)) {
      throw new BadRequestException('Los IDs deben ser números válidos');
    }

    return await this.contratoService.uploadContrato(
      empleadoId,
      tipoContratoId,
      new Date(fecha_inicio),
      new Date(fecha_fin),
      file
    );
  }

  @Get()
  findAll() {
    return this.contratoService.findAll();
  }

  @Get('empleado/:id_empleado')
  findByEmpleado(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.contratoService.findByEmpleado(id_empleado);
  }

  @Get('vigentes/:id_empleado')
  findVigentes(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.contratoService.findVigentes(id_empleado);
  }

  // ✅ NUEVO: Ver el contrato vigente actual del empleado
  @Get('vigente-actual/:id_empleado')
  findContratoVigenteActual(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.contratoService.findContratoVigenteActual(id_empleado);
  }

  // ✅ NUEVO: Verificar manualmente contratos vencidos
  @Post('verificar-vencidos')
  verificarContratosVencidos() {
    return this.contratoService.verificarYActualizarContratosVencidos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contratoService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const { buffer, filename } = await this.contratoService.downloadFile(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContratoDto: UpdateContratoDto) {
    return this.contratoService.update(id, updateContratoDto);
  }

  @Patch(':id/replace')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    return await this.contratoService.replaceFile(id, file);
  }

  @Patch(':id/no-vigente')
  marcarComoNoVigente(@Param('id', ParseIntPipe) id: number) {
    return this.contratoService.marcarComoNoVigente(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contratoService.remove(id);
  }
}