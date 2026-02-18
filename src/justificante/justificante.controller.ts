import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
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
import { JustificanteService } from './justificante.service';

@Controller('justificantes')
export class JustificanteController {
  constructor(private readonly justificanteService: JustificanteService) { }

  @Post('incidencia/:id_incidencia')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJustificante(
    @Param('id_incidencia', ParseIntPipe) id_incidencia: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    return await this.justificanteService.uploadJustificante(id_incidencia, file);
  }

  @Get()
  findAll() {
    return this.justificanteService.findAll();
  }

  @Get('incidencia/:id_incidencia')
  findByIncidencia(@Param('id_incidencia', ParseIntPipe) id_incidencia: number) {
    return this.justificanteService.findByIncidencia(id_incidencia);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.justificanteService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const { buffer, filename, mimetype } = await this.justificanteService.downloadFile(id);

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id/replace')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    return await this.justificanteService.replaceFile(id, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.justificanteService.remove(id);
  }
}
