import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Contrato } from '../../contrato/entities/contrato.entity';

@Entity('tipo_contrato')
export class TipoContrato {
    @PrimaryGeneratedColumn()
    id_tipo_contrato: number;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @OneToMany(() => Contrato, (contrato) => contrato.tipoContrato)
    contratos: Contrato[];
}