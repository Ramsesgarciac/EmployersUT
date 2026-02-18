import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocEmpleadoService } from './doc-empleado.service';
import { CreateDocEmpleadoDto } from './dto/create-doc-empleado.dto';
import { UpdateDocEmpleadoDto } from './dto/update-doc-empleado.dto';

@Controller('doc-empleado')
export class DocEmpleadoController {
  constructor(private readonly docEmpleadoService: DocEmpleadoService) {}

  @Post()
  create(@Body() createDocEmpleadoDto: CreateDocEmpleadoDto) {
    return this.docEmpleadoService.create(createDocEmpleadoDto);
  }

  @Get()
  findAll() {
    return this.docEmpleadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docEmpleadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocEmpleadoDto: UpdateDocEmpleadoDto) {
    return this.docEmpleadoService.update(+id, updateDocEmpleadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docEmpleadoService.remove(+id);
  }
}
