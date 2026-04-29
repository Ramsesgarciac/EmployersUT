import { Test, TestingModule } from '@nestjs/testing';
import { FaltaAdministrativaController } from './falta-administrativa.controller';
import { FaltaAdministrativaService } from './falta-administrativa.service';

describe('FaltaAdministrativaController', () => {
  let controller: FaltaAdministrativaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaltaAdministrativaController],
      providers: [FaltaAdministrativaService],
    }).compile();

    controller = module.get<FaltaAdministrativaController>(FaltaAdministrativaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
