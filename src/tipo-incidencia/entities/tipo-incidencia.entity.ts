import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Incidencia } from '../../incidencia/entities/incidencia.entity';

@Entity('tipo_incidencia')
export class TipoIncidencia {
    @PrimaryGeneratedColumn()
    id_tipo_incidencia: number;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @OneToMany(() => Incidencia, (incidencia) => incidencia.tipoIncidencia)
    incidencias: Incidencia[];
}