import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogoEventos } from './entities/catalogo-evento.entity';
import { CreateCatalogoEventoDto } from './dto/create-catalogo-evento.dto';
import { UpdateCatalogoEventoDto } from './dto/update-catalogo-evento.dto';

@Injectable()
export class CatalogoEventosService {
  constructor(
    @InjectRepository(CatalogoEventos)
    private catalogoRepository: Repository<CatalogoEventos>,
  ) { }

  async create(createDto: CreateCatalogoEventoDto): Promise<CatalogoEventos> {
    const catalogo = this.catalogoRepository.create(createDto);
    return await this.catalogoRepository.save(catalogo);
  }

  async findAll(): Promise<CatalogoEventos[]> {
    return await this.catalogoRepository.find({
      order: { nombre_evento: 'ASC' }
    });
  }

  async findOne(id: number): Promise<CatalogoEventos> {
    const catalogo = await this.catalogoRepository.findOne({
      where: { id_tipo_evento: id }
    });

    if (!catalogo) {
      throw new NotFoundException(`Tipo de evento con ID ${id} no encontrado`);
    }

    return catalogo;
  }

  async update(id: number, updateDto: UpdateCatalogoEventoDto): Promise<CatalogoEventos> {
    const catalogo = await this.findOne(id);
    Object.assign(catalogo, updateDto);
    return await this.catalogoRepository.save(catalogo);
  }

  async remove(id: number): Promise<void> {
    const catalogo = await this.catalogoRepository.findOne({
      where: { id_tipo_evento: id },
      relations: ['eventos']
    });

    if (!catalogo) {
      throw new NotFoundException(`Tipo de evento con ID ${id} no encontrado`);
    }

    if (catalogo.eventos && catalogo.eventos.length > 0) {
      throw new ConflictException(
        `No se puede eliminar porque hay ${catalogo.eventos.length} evento(s) asociado(s)`
      );
    }

    await this.catalogoRepository.remove(catalogo);
  }
}