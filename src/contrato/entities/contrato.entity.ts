import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { TipoContrato } from '../../tipo-contrato/entities/tipo-contrato.entity';

@Entity('contrato')
export class Contrato {
    @PrimaryGeneratedColumn()
    id_contrato: number;

    @Column()
    id_empleado: number;

    @Column()
    id_tipo_contrato: number;

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

    @Column({ type: 'boolean', default: true })
    vigente: boolean;

    @ManyToOne(() => Empleado, (empleado) => empleado.contratos)
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;

    @ManyToOne(() => TipoContrato, (tipo) => tipo.contratos)
    @JoinColumn({ name: 'id_tipo_contrato' })
    tipoContrato: TipoContrato;
}