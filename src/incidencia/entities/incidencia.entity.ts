import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { TipoIncidencia } from '../../tipo-incidencia/entities/tipo-incidencia.entity';
import { Justificante } from '../../justificante/entities/justificante.entity';

@Entity('incidencia')
export class Incidencia {
    @PrimaryGeneratedColumn()
    id_incidencia: number;

    @Column()
    id_empleado: number;

    @Column()
    id_tipo_incidencia: number;

    @Column({ type: 'date' })
    fecha_inicio: Date;

    @Column({ type: 'date' })
    fecha_fin: Date;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    fecha_registro: Date;

    @ManyToOne(() => Empleado, (empleado) => empleado.incidencias)
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;

    @ManyToOne(() => TipoIncidencia, (tipo) => tipo.incidencias)
    @JoinColumn({ name: 'id_tipo_incidencia' })
    tipoIncidencia: TipoIncidencia;

    @OneToMany(() => Justificante, (justificante) => justificante.incidencia)
    justificantes: Justificante[];
}