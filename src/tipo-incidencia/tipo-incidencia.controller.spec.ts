import { Test, TestingModule } from '@nestjs/testing';
import { TipoIncidenciaController } from './tipo-incidencia.controller';
import { TipoIncidenciaService } from './tipo-incidencia.service';

describe('TipoIncidenciaController', () => {
  let controller: TipoIncidenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoIncidenciaController],
      providers: [TipoIncidenciaService],
    }).compile();

    controller = module.get<TipoIncidenciaController>(TipoIncidenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
