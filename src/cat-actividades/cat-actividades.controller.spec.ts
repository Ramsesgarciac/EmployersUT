import { Test, TestingModule } from '@nestjs/testing';
import { CatActividadesController } from './cat-actividades.controller';
import { CatActividadesService } from './cat-actividades.service';

describe('CatActividadesController', () => {
  let controller: CatActividadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatActividadesController],
      providers: [CatActividadesService],
    }).compile();

    controller = module.get<CatActividadesController>(CatActividadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
