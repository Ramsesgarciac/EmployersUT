import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatalogoEventosService } from './catalogo-eventos.service';
import { CreateCatalogoEventoDto } from './dto/create-catalogo-evento.dto';
import { UpdateCatalogoEventoDto } from './dto/update-catalogo-evento.dto';

@Controller('catalogo-eventos')
export class CatalogoEventosController {
  constructor(private readonly catalogoEventosService: CatalogoEventosService) {}

  @Post()
  create(@Body() createCatalogoEventoDto: CreateCatalogoEventoDto) {
    return this.catalogoEventosService.create(createCatalogoEventoDto);
  }

  @Get()
  findAll() {
    return this.catalogoEventosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogoEventosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatalogoEventoDto: UpdateCatalogoEventoDto) {
    return this.catalogoEventosService.update(+id, updateCatalogoEventoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogoEventosService.remove(+id);
  }
}
