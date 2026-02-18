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
import { TipoIncidenciaService } from './tipo-incidencia.service';
import { CreateTipoIncidenciaDto } from './dto/create-tipo-incidencia.dto';
import { UpdateTipoIncidenciaDto } from './dto/update-tipo-incidencia.dto';

@Controller('tipos-incidencias')
export class TipoIncidenciaController {
  constructor(private readonly tipoIncidenciaService: TipoIncidenciaService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTipoIncidenciaDto: CreateTipoIncidenciaDto) {
    return this.tipoIncidenciaService.create(createTipoIncidenciaDto);
  }

  @Get()
  findAll() {
    return this.tipoIncidenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoIncidenciaService.findOne(id);
  }

  @Get(':id/incidencias')
  findWithIncidencias(@Param('id', ParseIntPipe) id: number) {
    return this.tipoIncidenciaService.findWithIncidencias(id);
  }

  @Get(':id/count')
  countIncidencias(@Param('id', ParseIntPipe) id: number) {
    return this.tipoIncidenciaService.countIncidencias(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoIncidenciaDto: UpdateTipoIncidenciaDto
  ) {
    return this.tipoIncidenciaService.update(id, updateTipoIncidenciaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoIncidenciaService.remove(id);
  }
}