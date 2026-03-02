import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TipoContratoService } from './tipo-contrato.service';
import { CreateTipoContratoDto } from './dto/create-tipo-contrato.dto';
import { UpdateTipoContratoDto } from './dto/update-tipo-contrato.dto';

@Controller('tipos-contratos')
export class TipoContratoController {
  constructor(private readonly tipoContratoService: TipoContratoService) { }

  @Post()
  create(@Body() createDto: CreateTipoContratoDto) {
    return this.tipoContratoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.tipoContratoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoContratoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTipoContratoDto) {
    return this.tipoContratoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoContratoService.remove(id);
  }
}
