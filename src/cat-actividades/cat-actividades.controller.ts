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
import { CatActividadesService } from './cat-actividades.service';
import { CreateCatActividadeDto } from './dto/create-cat-actividade.dto';
import { UpdateCatActividadeDto } from './dto/update-cat-actividade.dto';

@Controller('cat-actividades')
export class CatActividadesController {
  constructor(private readonly catActividadesService: CatActividadesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCatActividadeDto) {
    return this.catActividadesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.catActividadesService.findAll();
  }

  @Get('activas')
  findActivas() {
    return this.catActividadesService.findActivas();
  }

  @Get('categoria/:id_cat_empleado')
  findByCategoria(@Param('id_cat_empleado', ParseIntPipe) id_cat_empleado: number) {
    return this.catActividadesService.findByCategoria(id_cat_empleado);
  }

  @Get('categoria/:id_cat_empleado/activas')
  findActivasByCategoria(@Param('id_cat_empleado', ParseIntPipe) id_cat_empleado: number) {
    return this.catActividadesService.findActivasByCategoria(id_cat_empleado);
  }

  @Get('categoria/:id_cat_empleado/contar')
  contarPorCategoria(@Param('id_cat_empleado', ParseIntPipe) id_cat_empleado: number) {
    return this.catActividadesService.contarPorCategoria(id_cat_empleado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catActividadesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCatActividadeDto
  ) {
    return this.catActividadesService.update(id, updateDto);
  }

  @Patch(':id/desactivar')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.catActividadesService.desactivar(id);
  }

  @Patch(':id/activar')
  activar(@Param('id', ParseIntPipe) id: number) {
    return this.catActividadesService.activar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.catActividadesService.remove(id);
  }
}