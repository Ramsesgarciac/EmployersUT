import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity('adendum')
export class Adendum {
    @PrimaryGeneratedColumn()
    id_adendum: number;

    @Column()
    id_empleado: number;

    @Column({ type: 'varchar', length: 255 })
    nombre_archivo: string;

    @Column({ type: 'varchar', length: 500 })
    ruta_archivo: string;

    @Column({ type: 'date' })
    fecha_inicio: Date;

    @Column({ type: 'date' })
    fecha_fin: Date;

    @Column({ type: 'boolean', default: true })
    vigente: boolean;

    @CreateDateColumn()
    fecha_carga: Date;

    @Column({ type: 'int', default: 1 })
    version: number;

    @ManyToOne(() => Empleado, (empleado) => empleado.adendums)
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;
}
