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
  Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DocEmpleadoService } from './doc-empleado.service';

@Controller('documentos-empleados')
export class DocEmpleadoController {
  constructor(private readonly docEmpleadoService: DocEmpleadoService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumento(
    @Body('id_empleado', ParseIntPipe) id_empleado: number,
    @Body('id_tipo_doc', ParseIntPipe) id_tipo_doc: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo');
    }

    return await this.docEmpleadoService.uploadDocumento(
      id_empleado,
      id_tipo_doc,
      file
    );
  }

  @Get('listado/:id_empleado')
  getListadoDocumentos(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.docEmpleadoService.getListadoDocumentos(id_empleado);
  }

  @Get('historial/:id_empleado/:id_tipo_doc')
  getHistorialDocumento(
    @Param('id_empleado', ParseIntPipe) id_empleado: number,
    @Param('id_tipo_doc', ParseIntPipe) id_tipo_doc: number
  ) {
    return this.docEmpleadoService.getHistorialDocumento(id_empleado, id_tipo_doc);
  }

  @Get('empleado/:id_empleado')
  findByEmpleado(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
    return this.docEmpleadoService.findByEmpleado(id_empleado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.docEmpleadoService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const { buffer, filename, mimetype } = await this.docEmpleadoService.downloadFile(id);

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id/activar')
  activarVersion(@Param('id', ParseIntPipe) id: number) {
    return this.docEmpleadoService.activarVersion(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docEmpleadoService.remove(id);
  }
}
