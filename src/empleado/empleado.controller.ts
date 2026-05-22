import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Controller('empleados')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadoService.create(createEmpleadoDto);
  }

  @Get()
  findAll() {
    return this.empleadoService.findAll();
  }

  @Get('activos')
  findActive() {
    return this.empleadoService.findActive();
  }

  @Get('inactivos')
  findDisactive() {
    return this.empleadoService.findDisctive();
  }

  @Get('exportar/excel')
  async exportAllExcel(@Res() res: Response) {
    const buffer = await this.empleadoService.exportAllToExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="empleados.xlsx"',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get(':id/exportar/excel')
  async exportOneExcel(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.empleadoService.exportOneToExcel(id);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="empleado_${id}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.findOne(id);
  }

  @Get('numero/:numero')
  findByNumero(@Param('numero', ParseIntPipe) numero: number) {
    return this.empleadoService.findByNumeroEmpleado(numero);
  }

  @Get('categoria/:id')
  findByCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.findByCategoria(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    return this.empleadoService.update(id, updateEmpleadoDto);
  }

  @Patch(':id/desactivar')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.deactivate(id);
  }

  @Patch(':id/activar')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.activate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.remove(id);
  }
}
