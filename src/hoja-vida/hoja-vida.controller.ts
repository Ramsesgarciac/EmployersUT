import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HojaVidaService } from './hoja-vida.service';
import { CreateHojaVidaDto } from './dto/create-hoja-vida.dto';
import { UpdateHojaVidaDto } from './dto/update-hoja-vida.dto';

@Controller('hoja-vida')
export class HojaVidaController {
  constructor(private readonly hojaVidaService: HojaVidaService) {}

  @Post()
  create(@Body() createHojaVidaDto: CreateHojaVidaDto) {
    return this.hojaVidaService.create(createHojaVidaDto);
  }

  @Get()
  findAll() {
    return this.hojaVidaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hojaVidaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHojaVidaDto: UpdateHojaVidaDto) {
    return this.hojaVidaService.update(+id, updateHojaVidaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hojaVidaService.remove(+id);
  }
}
