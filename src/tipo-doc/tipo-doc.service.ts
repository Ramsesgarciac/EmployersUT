import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDoc } from './entities/tipo-doc.entity';
import { CreateTipoDocDto } from './dto/create-tipo-doc.dto';
import { UpdateTipoDocDto } from './dto/update-tipo-doc.dto';

@Injectable()
export class TipoDocService {
  constructor(
    @InjectRepository(TipoDoc)
    private tipoDocRepository: Repository<TipoDoc>,
  ) { }

  async create(createTipoDocDto: CreateTipoDocDto): Promise<TipoDoc> {
    const tipoDoc = this.tipoDocRepository.create(createTipoDocDto);
    return await this.tipoDocRepository.save(tipoDoc);
  }

  async findAll(): Promise<TipoDoc[]> {
    return await this.tipoDocRepository.find({
      order: { orden: 'ASC' }
    });
  }

  async findActive(): Promise<TipoDoc[]> {
    return await this.tipoDocRepository.find({
      where: { activo: true },
      order: { orden: 'ASC' }
    });
  }

  async findObligatorios(): Promise<TipoDoc[]> {
    return await this.tipoDocRepository.find({
      where: { obligatorio: true, activo: true },
      order: { orden: 'ASC' }
    });
  }

  async findOne(id: number): Promise<TipoDoc> {
    const tipoDoc = await this.tipoDocRepository.findOne({
      where: { id_tipo_doc: id }
    });

    if (!tipoDoc) {
      throw new NotFoundException(`Tipo de documento con ID ${id} no encontrado`);
    }

    return tipoDoc;
  }

  async update(id: number, updateTipoDocDto: UpdateTipoDocDto): Promise<TipoDoc> {
    const tipoDoc = await this.findOne(id);
    Object.assign(tipoDoc, updateTipoDocDto);
    return await this.tipoDocRepository.save(tipoDoc);
  }

  async remove(id: number): Promise<void> {
    const tipoDoc = await this.tipoDocRepository.findOne({
      where: { id_tipo_doc: id },
      relations: ['documentos']
    });

    if (!tipoDoc) {
      throw new NotFoundException(`Tipo de documento con ID ${id} no encontrado`);
    }

    if (tipoDoc.documentos && tipoDoc.documentos.length > 0) {
      throw new ConflictException(
        `No se puede eliminar porque hay ${tipoDoc.documentos.length} documento(s) asociado(s)`
      );
    }

    await this.tipoDocRepository.remove(tipoDoc);
  }
}