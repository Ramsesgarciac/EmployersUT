import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatActividadesService } from './cat-actividades.service';
import { CreateCatActividadeDto } from './dto/create-cat-actividade.dto';
import { UpdateCatActividadeDto } from './dto/update-cat-actividade.dto';

@Controller('cat-actividades')
export class CatActividadesController {
  constructor(private readonly catActividadesService: CatActividadesService) {}

  @Post()
  create(@Body() createCatActividadeDto: CreateCatActividadeDto) {
    return this.catActividadesService.create(createCatActividadeDto);
  }

  @Get()
  findAll() {
    return this.catActividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catActividadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatActividadeDto: UpdateCatActividadeDto) {
    return this.catActividadesService.update(+id, updateCatActividadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catActividadesService.remove(+id);
  }
}
