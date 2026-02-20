import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TipoDocService } from './tipo-doc.service';
import { CreateTipoDocDto } from './dto/create-tipo-doc.dto';
import { UpdateTipoDocDto } from './dto/update-tipo-doc.dto';

@Controller('tipos-documentos')
export class TipoDocController {
  constructor(private readonly tipoDocService: TipoDocService) { }

  @Post()
  create(@Body() createTipoDocDto: CreateTipoDocDto) {
    return this.tipoDocService.create(createTipoDocDto);
  }

  @Get()
  findAll() {
    return this.tipoDocService.findAll();
  }

  @Get('activos')
  findActive() {
    return this.tipoDocService.findActive();
  }

  @Get('obligatorios')
  findObligatorios() {
    return this.tipoDocService.findObligatorios();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDocService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTipoDocDto: UpdateTipoDocDto) {
    return this.tipoDocService.update(id, updateTipoDocDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDocService.remove(id);
  }
}