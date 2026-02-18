import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DocEmpleado } from '../../doc-empleado/entities/doc-empleado.entity';

@Entity('tipo_doc')
export class TipoDoc {
    @PrimaryGeneratedColumn()
    id_tipo_doc: number;

    @Column({ type: 'varchar', length: 150 })
    nombre_doc: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ default: true })
    obligatorio: boolean;

    @Column()
    orden: number;

    @Column({ default: true })
    activo: boolean;

    @OneToMany(() => DocEmpleado, (doc) => doc.tipoDoc)
    documentos: DocEmpleado[];
}