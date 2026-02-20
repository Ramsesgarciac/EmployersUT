import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { TipoDoc } from '../../tipo-doc/entities/tipo-doc.entity';

@Entity('doc_empleado')
export class DocEmpleado {
    @PrimaryGeneratedColumn()
    id_doc_empleado: number;

    @Column()
    id_empleado: number;

    @Column()
    id_tipo_doc: number;

    @Column({ type: 'varchar', length: 255 })
    nombre_archivo: string;

    @Column({ type: 'varchar', length: 500 })
    ruta_archivo: string;

    @CreateDateColumn()
    fecha_carga: Date;

    @Column({ type: 'boolean', default: true })
    activo: boolean;  // true = versión actual, false = versión antigua (historial)

    @UpdateDateColumn()
    fecha_actualizacion: Date;

    @Column({ type: 'int', default: 1 })
    version: number;  // Número de versión del documento

    @ManyToOne(() => Empleado, (empleado) => empleado.documentos)
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;

    @ManyToOne(() => TipoDoc, (tipo) => tipo.documentos)
    @JoinColumn({ name: 'id_tipo_doc' })
    tipoDoc: TipoDoc;
}