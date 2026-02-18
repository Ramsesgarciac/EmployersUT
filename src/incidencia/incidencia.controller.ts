import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IncidenciaService } from './incidencia.service';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';

@Controller('incidencias')
export class IncidenciaController {
  constructor(private readonly incidenciaService: IncidenciaService) { }

  @Post()
  create(@Body() createIncidenciaDto: CreateIncidenciaDto) {
    return this.incidenciaService.create(createIncidenciaDto);
  }

  @Get()
  findAll() {
    return this.incidenciaService.findAll();
  }

  @Get('buscar')
  findByDateRange(
    @Query('fecha_inicio') fecha_inicio: string,
    @Query('fecha_fin') fecha_fin: string
  ) {
    if (!fecha_inicio || !fecha_fin) {
      throw new BadRequestException('Debe proporcionar fecha_inicio y fecha_fin');
    }
    return this.incidenciaService.findByDateRange(
      new Date(fecha_inicio),
      new Date(fecha_fin)
    );
  }

  @Get('empleado/:id')
  findByEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciaService.findByEmpleado(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIncidenciaDto: UpdateIncidenciaDto
  ) {
    return this.incidenciaService.update(id, updateIncidenciaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciaService.remove(id);
  }

  @Post(':id/justificante')
  @UseInterceptors(FileInterceptor('file'))
  uploadJustificante(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo');
    }
    return this.incidenciaService.uploadJustificante(id, file);
  }

  @Delete('justificante/:id')
  deleteJustificante(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciaService.deleteJustificante(id);
  }
}