import { Test, TestingModule } from '@nestjs/testing';
import { TipoContratoService } from './tipo-contrato.service';

describe('TipoContratoService', () => {
  let service: TipoContratoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoContratoService],
    }).compile();

    service = module.get<TipoContratoService>(TipoContratoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
