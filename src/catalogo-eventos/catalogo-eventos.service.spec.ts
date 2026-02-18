import { Test, TestingModule } from '@nestjs/testing';
import { CatalogoEventosService } from './catalogo-eventos.service';

describe('CatalogoEventosService', () => {
  let service: CatalogoEventosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogoEventosService],
    }).compile();

    service = module.get<CatalogoEventosService>(CatalogoEventosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
