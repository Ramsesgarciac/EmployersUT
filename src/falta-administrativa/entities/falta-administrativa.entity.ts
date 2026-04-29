import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from 'typeorm';

import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity('faltas_administrativas')
export class FaltaAdministrativa {

    @PrimaryGeneratedColumn()
    id_falta_administrativa: number;

    @Column({ type: 'varchar', length: 200 })
    nombre: string;

    @Column({
        type: 'date',
        transformer: {
            to: (value: string) => value,
            from: (value: string) => value,
        }
    })
    fecha: string;

    @Column({ type: 'text' })
    motivo: string;

    @Column({ type: 'text', nullable: true })
    sancion?: string;

    @Column()
    id_empleado: number;

    @CreateDateColumn()
    fecha_creacion: Date;

    @ManyToOne(
        () => Empleado,
        (empleado) => empleado.faltasAdministrativas
    )
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;
}
