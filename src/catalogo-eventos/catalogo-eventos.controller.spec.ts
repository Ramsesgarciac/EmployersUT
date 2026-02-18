import { Test, TestingModule } from '@nestjs/testing';
import { CatalogoEventosController } from './catalogo-eventos.controller';
import { CatalogoEventosService } from './catalogo-eventos.service';

describe('CatalogoEventosController', () => {
  let controller: CatalogoEventosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogoEventosController],
      providers: [CatalogoEventosService],
    }).compile();

    controller = module.get<CatalogoEventosController>(CatalogoEventosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
