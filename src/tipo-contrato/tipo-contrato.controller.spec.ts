import { Test, TestingModule } from '@nestjs/testing';
import { TipoContratoController } from './tipo-contrato.controller';
import { TipoContratoService } from './tipo-contrato.service';

describe('TipoContratoController', () => {
  let controller: TipoContratoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoContratoController],
      providers: [TipoContratoService],
    }).compile();

    controller = module.get<TipoContratoController>(TipoContratoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
