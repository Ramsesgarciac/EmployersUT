import { Test, TestingModule } from '@nestjs/testing';
import { HojaVidaController } from './hoja-vida.controller';
import { HojaVidaService } from './hoja-vida.service';

describe('HojaVidaController', () => {
  let controller: HojaVidaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HojaVidaController],
      providers: [HojaVidaService],
    }).compile();

    controller = module.get<HojaVidaController>(HojaVidaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
