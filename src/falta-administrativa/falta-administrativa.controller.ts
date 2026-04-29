import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';

import { FaltaAdministrativaService } from './falta-administrativa.service';

import { CreateFaltaAdministrativaDto } from './dto/create-falta-administrativa.dto';
import { UpdateFaltaAdministrativaDto } from './dto/update-falta-administrativa.dto';

@Controller('faltas-administrativas')
export class FaltaAdministrativaController {

  constructor(
    private readonly faltaService: FaltaAdministrativaService
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDto: CreateFaltaAdministrativaDto
  ) {
    return this.faltaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.faltaService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.faltaService.findOne(id);
  }

  @Get('empleado/:id')
  findByEmpleado(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.faltaService.findByEmpleado(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFaltaAdministrativaDto
  ) {
    return this.faltaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.faltaService.remove(id);
  }
}
