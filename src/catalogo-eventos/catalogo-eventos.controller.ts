import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CatalogoEventosService } from './catalogo-eventos.service';
import { CreateCatalogoEventoDto } from './dto/create-catalogo-evento.dto';
import { UpdateCatalogoEventoDto } from './dto/update-catalogo-evento.dto';

@Controller('catalogo-eventos')
export class CatalogoEventosController {
  constructor(private readonly catalogoService: CatalogoEventosService) { }

  @Post()
  create(@Body() createDto: CreateCatalogoEventoDto) {
    return this.catalogoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.catalogoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateCatalogoEventoDto) {
    return this.catalogoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.remove(id);
  }
}