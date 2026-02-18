import { Test, TestingModule } from '@nestjs/testing';
import { JustificanteController } from './justificante.controller';
import { JustificanteService } from './justificante.service';

describe('JustificanteController', () => {
  let controller: JustificanteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JustificanteController],
      providers: [JustificanteService],
    }).compile();

    controller = module.get<JustificanteController>(JustificanteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
