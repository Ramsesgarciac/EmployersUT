import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { CategoriaEmpleado } from '../../categoria-empleado/entities/categoria-empleado.entity';
import { Incidencia } from '../../incidencia/entities/incidencia.entity';
import { DocEmpleado } from '../../doc-empleado/entities/doc-empleado.entity';
import { HojaVida } from '../../hoja-vida/entities/hoja-vida.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@Entity('empleado')
export class Empleado {
    @PrimaryGeneratedColumn()
    id_empleado: number;

    @Column({ type: 'varchar', length: 200 })
    nombre: string;

    @Column({ type: 'varchar', length: 18, unique: true })
    curp: string;

    @Column({ type: 'varchar', length: 13, unique: true })
    rfc: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    discapacidad: string;

    @Column({ type: 'varchar', length: 100 })
    puesto: string;

    @Column({ type: 'varchar', length: 100 })
    area_asignada: string;

    @Column({ unique: true })
    numero_empleado: number;

    @Column({ default: true })
    activo: boolean;

    @Column()
    id_categoria: number;

    @CreateDateColumn()
    fecha_creacion: Date;

    @ManyToOne(() => CategoriaEmpleado, (categoria) => categoria.empleados)
    @JoinColumn({ name: 'id_categoria' })
    categoria: CategoriaEmpleado;

    @OneToMany(() => Incidencia, (incidencia) => incidencia.empleado)
    incidencias: Incidencia[];

    @OneToMany(() => DocEmpleado, (doc) => doc.empleado)
    documentos: DocEmpleado[];

    @OneToOne(() => HojaVida, (hoja) => hoja.empleado)
    hojaVida: HojaVida;

    @OneToMany(() => Contrato, (contrato) => contrato.empleado)
    contratos: Contrato[];
}