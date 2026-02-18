import { Injectable } from '@nestjs/common';
import { CreateCatActividadeDto } from './dto/create-cat-actividade.dto';
import { UpdateCatActividadeDto } from './dto/update-cat-actividade.dto';

@Injectable()
export class CatActividadesService {
  create(createCatActividadeDto: CreateCatActividadeDto) {
    return 'This action adds a new catActividade';
  }

  findAll() {
    return `This action returns all catActividades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} catActividade`;
  }

  update(id: number, updateCatActividadeDto: UpdateCatActividadeDto) {
    return `This action updates a #${id} catActividade`;
  }

  remove(id: number) {
    return `This action removes a #${id} catActividade`;
  }
}
