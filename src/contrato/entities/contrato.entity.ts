import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity('contrato')
export class Contrato {
    @PrimaryGeneratedColumn()
    id_contrato: number;

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

    @CreateDateColumn()
    fecha_carga: Date;

    @ManyToOne(() => Empleado, (empleado) => empleado.contratos)
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;
}