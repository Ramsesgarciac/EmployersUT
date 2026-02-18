import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Incidencia } from '../../incidencia/entities/incidencia.entity';

@Entity('justificante')
export class Justificante {
    @PrimaryGeneratedColumn()
    id_justificante: number;

    @Column()
    id_incidencia: number;

    @Column({ type: 'varchar', length: 255 })
    nombre_archivo: string;

    @Column({ type: 'varchar', length: 500 })
    ruta_archivo: string;

    @CreateDateColumn()
    fecha_subida: Date;

    @ManyToOne(() => Incidencia, (incidencia) => incidencia.justificantes)
    @JoinColumn({ name: 'id_incidencia' })
    incidencia: Incidencia;
}