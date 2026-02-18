import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importar AppController y AppService
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { EmpleadoModule } from './empleado/empleado.module';
import { IncidenciaModule } from './incidencia/incidencia.module';
import { CategoriaEmpleadoModule } from './categoria-empleado/categoria-empleado.module';
import { TipoDocModule } from './tipo-doc/tipo-doc.module';
import { DocEmpleadoModule } from './doc-empleado/doc-empleado.module';

import { Empleado } from './empleado/entities/empleado.entity';
import { CategoriaEmpleado } from './categoria-empleado/entities/categoria-empleado.entity';
import { CatActividades } from './cat-actividades/entities/cat-actividade.entity';
import { Incidencia } from './incidencia/entities/incidencia.entity';
import { TipoIncidencia } from './tipo-incidencia/entities/tipo-incidencia.entity';
import { Justificante } from './justificante/entities/justificante.entity';
import { Contrato } from './contrato/entities/contrato.entity';
import { HojaVida } from './hoja-vida/entities/hoja-vida.entity';
import { Evento } from './evento/entities/evento.entity';
import { CatalogoEventos } from './catalogo-eventos/entities/catalogo-evento.entity';
import { TipoDoc } from './tipo-doc/entities/tipo-doc.entity';
import { DocEmpleado } from './doc-empleado/entities/doc-empleado.entity';
import { TipoIncidenciaModule } from './tipo-incidencia/tipo-incidencia.module';
import { JustificanteModule } from './justificante/justificante.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, TipoIncidenciaModule, JustificanteModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'CercaTrova4'),
        database: configService.get('DB_DATABASE', 'gestiones'),
        entities: [
          Empleado,
          CategoriaEmpleado,
          CatActividades,
          Incidencia,
          TipoIncidencia,
          Justificante,
          Contrato,
          HojaVida,
          Evento,
          CatalogoEventos,
          TipoDoc,
          DocEmpleado,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        extra: {
          authPlugins: {
            mysql_clear_password: () => () => Buffer.from(configService.get('DB_PASSWORD') + '\0')
          }
        }
      }),
      inject: [ConfigService],
    }),
    EmpleadoModule,
    IncidenciaModule,
    CategoriaEmpleadoModule,
    TipoDocModule,
    DocEmpleadoModule,
  ],
  controllers: [AppController], // AGREGAR ESTO
  providers: [AppService],      // AGREGAR ESTO
})
export class AppModule { }