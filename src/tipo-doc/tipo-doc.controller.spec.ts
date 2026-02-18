import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocController } from './tipo-doc.controller';
import { TipoDocService } from './tipo-doc.service';

describe('TipoDocController', () => {
  let controller: TipoDocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoDocController],
      providers: [TipoDocService],
    }).compile();

    controller = module.get<TipoDocController>(TipoDocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
