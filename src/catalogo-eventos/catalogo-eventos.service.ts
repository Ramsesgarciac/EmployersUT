import { Injectable } from '@nestjs/common';
import { CreateCatalogoEventoDto } from './dto/create-catalogo-evento.dto';
import { UpdateCatalogoEventoDto } from './dto/update-catalogo-evento.dto';

@Injectable()
export class CatalogoEventosService {
  create(createCatalogoEventoDto: CreateCatalogoEventoDto) {
    return 'This action adds a new catalogoEvento';
  }

  findAll() {
    return `This action returns all catalogoEventos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} catalogoEvento`;
  }

  update(id: number, updateCatalogoEventoDto: UpdateCatalogoEventoDto) {
    return `This action updates a #${id} catalogoEvento`;
  }

  remove(id: number) {
    return `This action removes a #${id} catalogoEvento`;
  }
}
