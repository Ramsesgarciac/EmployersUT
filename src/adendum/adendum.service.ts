import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Adendum } from './entities/adendum.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { UpdateAdendumDto } from './dto/update-adendum.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdendumService {
  constructor(
    @InjectRepository(Adendum)
    private adendumRepository: Repository<Adendum>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
  ) { }

  private parsearFechaLocal(fechaStr: string): Date {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  private validarArchivo(file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe exceder 10MB');
    }
  }

  private validarRangoFechas(fecha_inicio: string | Date, fecha_fin: string | Date) {
    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      throw new BadRequestException('La fecha de inicio debe ser menor a la fecha fin');
    }
  }

  async uploadAdendum(
    id_empleado: number,
    fecha_inicio: string,
    fecha_fin: string,
    file: Express.Multer.File,
  ): Promise<Adendum> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    this.validarArchivo(file);
    this.validarRangoFechas(fecha_inicio, fecha_fin);

    const adendumVigente = await this.adendumRepository.findOne({
      where: {
        id_empleado,
        vigente: true,
      },
      order: { version: 'DESC' },
    });

    let nuevaVersion = 1;

    if (adendumVigente) {
      adendumVigente.vigente = false;
      await this.adendumRepository.save(adendumVigente);
      nuevaVersion = adendumVigente.version + 1;
    }

    const uploadPath = path.join('uploads', 'adendums', String(id_empleado));
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `adendum_v${nuevaVersion}_${timestamp}.pdf`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const adendum = this.adendumRepository.create({
      id_empleado,
      nombre_archivo: file.originalname,
      ruta_archivo: filePath,
      fecha_inicio: this.parsearFechaLocal(fecha_inicio),
      fecha_fin: this.parsearFechaLocal(fecha_fin),
      vigente: true,
      version: nuevaVersion,
    });

    return await this.adendumRepository.save(adendum);
  }

  async findAll(): Promise<Adendum[]> {
    return await this.adendumRepository.find({
      relations: ['empleado'],
      order: { fecha_carga: 'DESC' },
    });
  }

  async findByEmpleado(id_empleado: number): Promise<Adendum[]> {
    return await this.adendumRepository.find({
      where: { id_empleado },
      order: { version: 'DESC' },
    });
  }

  async findVigentes(id_empleado: number): Promise<Adendum[]> {
    return await this.adendumRepository.find({
      where: { id_empleado, vigente: true },
      order: { version: 'DESC' },
    });
  }

  async findAdendumVigenteActual(id_empleado: number): Promise<Adendum | null> {
    const adendum = await this.adendumRepository.findOne({
      where: { id_empleado, vigente: true },
      relations: ['empleado'],
      order: { version: 'DESC' },
    });

    return adendum || null;
  }

  async findOne(id: number): Promise<Adendum> {
    const adendum = await this.adendumRepository.findOne({
      where: { id_adendum: id },
      relations: ['empleado'],
    });

    if (!adendum) {
      throw new NotFoundException(`Adendum con ID ${id} no encontrado`);
    }

    return adendum;
  }

  async downloadFile(id: number): Promise<{ buffer: Buffer; filename: string }> {
    const adendum = await this.findOne(id);

    if (!fs.existsSync(adendum.ruta_archivo)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    return {
      buffer: fs.readFileSync(adendum.ruta_archivo),
      filename: adendum.nombre_archivo,
    };
  }

  async update(id: number, updateAdendumDto: UpdateAdendumDto): Promise<Adendum> {
    const adendum = await this.findOne(id);

    const fechaInicio = updateAdendumDto.fecha_inicio
      ? this.parsearFechaLocal(updateAdendumDto.fecha_inicio)
      : adendum.fecha_inicio;

    const fechaFin = updateAdendumDto.fecha_fin
      ? this.parsearFechaLocal(updateAdendumDto.fecha_fin)
      : adendum.fecha_fin;

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException('La fecha de inicio debe ser menor a la fecha fin');
    }

    if (updateAdendumDto.fecha_inicio !== undefined) {
      adendum.fecha_inicio = fechaInicio;
    }

    if (updateAdendumDto.fecha_fin !== undefined) {
      adendum.fecha_fin = fechaFin;
    }

    if (updateAdendumDto.vigente !== undefined) {
      adendum.vigente = updateAdendumDto.vigente;

      if (updateAdendumDto.vigente) {
        await this.adendumRepository.update(
          { id_empleado: adendum.id_empleado, vigente: true },
          { vigente: false },
        );
      }
    }

    return await this.adendumRepository.save(adendum);
  }

  async replaceFile(id: number, file: Express.Multer.File): Promise<Adendum> {
    const adendum = await this.findOne(id);

    this.validarArchivo(file);

    if (fs.existsSync(adendum.ruta_archivo)) {
      fs.unlinkSync(adendum.ruta_archivo);
    }

    const uploadPath = path.dirname(adendum.ruta_archivo);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `adendum_v${adendum.version}_${timestamp}.pdf`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    adendum.nombre_archivo = file.originalname;
    adendum.ruta_archivo = filePath;

    return await this.adendumRepository.save(adendum);
  }

  async activarVersion(id: number): Promise<Adendum> {
    const adendum = await this.findOne(id);

    await this.adendumRepository.update(
      { id_empleado: adendum.id_empleado, vigente: true },
      { vigente: false },
    );

    adendum.vigente = true;
    return await this.adendumRepository.save(adendum);
  }

  async marcarComoNoVigente(id: number): Promise<Adendum> {
    const adendum = await this.findOne(id);
    adendum.vigente = false;
    return await this.adendumRepository.save(adendum);
  }

  async remove(id: number): Promise<void> {
    const adendum = await this.findOne(id);

    if (fs.existsSync(adendum.ruta_archivo)) {
      fs.unlinkSync(adendum.ruta_archivo);
    }

    await this.adendumRepository.remove(adendum);
  }
}
