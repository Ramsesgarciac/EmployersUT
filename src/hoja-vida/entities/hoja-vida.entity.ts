import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Evento } from '../../evento/entities/evento.entity';

@Entity('hoja_vida')
export class HojaVida {
    @PrimaryGeneratedColumn()
    id_hoja_vida: number;

    @Column({ unique: true })
    id_empleado: number;

    @OneToOne(() => Empleado, (empleado) => empleado.hojaVida)
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;

    @OneToMany(() => Evento, (evento) => evento.hojaVida)
    eventos: Evento[];
}
