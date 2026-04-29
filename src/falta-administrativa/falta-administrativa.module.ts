import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FaltaAdministrativaService } from './falta-administrativa.service';
import { FaltaAdministrativaController } from './falta-administrativa.controller';

import { FaltaAdministrativa } from './entities/falta-administrativa.entity';

import { EmpleadoModule } from '../empleado/empleado.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FaltaAdministrativa
    ]),
    EmpleadoModule
  ],

  controllers: [
    FaltaAdministrativaController
  ],

  providers: [
    FaltaAdministrativaService
  ],

  exports: [
    FaltaAdministrativaService
  ]
})
export class FaltaAdministrativaModule { }
