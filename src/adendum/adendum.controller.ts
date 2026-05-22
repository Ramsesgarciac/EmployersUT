import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AdendumService } from './adendum.service';
import { UpdateAdendumDto } from './dto/update-adendum.dto';

@Controller('adendums')
export class AdendumController {
  constructor(private readonly adendumService: AdendumService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdendum(
    @Body('id_empleado') id_empleado: string,
    @Body('fecha_inicio') fecha_inicio: string,
    @Body('fecha_fin') fecha_fin: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    const empleadoId = parseInt(id_empleado);

    if (isNaN(empleadoId)) {
      throw new BadRequestException('El ID del empleado debe ser un numero valido');
    }

    return await this.adendumService.uploadAdendum(
      empleadoId,
      fecha_inicio,
      fecha_fin,
      file,
    );
  }

  @Get()
  findAll() {
    return this.adendumService.findAll();
  }

  @Get('empleado/:id_empleado')
  findByEmpleado(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.adendumService.findByEmpleado(id_empleado);
  }

  @Get('vigentes/:id_empleado')
  findVigentes(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.adendumService.findVigentes(id_empleado);
  }

  @Get('vigente-actual/:id_empleado')
  findAdendumVigenteActual(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.adendumService.findAdendumVigenteActual(id_empleado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adendumService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.adendumService.downloadFile(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdendumDto: UpdateAdendumDto,
  ) {
    return this.adendumService.update(id, updateAdendumDto);
  }

  @Patch(':id/replace')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    return await this.adendumService.replaceFile(id, file);
  }

  @Patch(':id/activar')
  activarVersion(@Param('id', ParseIntPipe) id: number) {
    return this.adendumService.activarVersion(id);
  }

  @Patch(':id/no-vigente')
  marcarComoNoVigente(@Param('id', ParseIntPipe) id: number) {
    return this.adendumService.marcarComoNoVigente(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adendumService.remove(id);
  }
}
