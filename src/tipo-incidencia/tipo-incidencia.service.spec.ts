import { Test, TestingModule } from '@nestjs/testing';
import { TipoIncidenciaService } from './tipo-incidencia.service';

describe('TipoIncidenciaService', () => {
  let service: TipoIncidenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoIncidenciaService],
    }).compile();

    service = module.get<TipoIncidenciaService>(TipoIncidenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
