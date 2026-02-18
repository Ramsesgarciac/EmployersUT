import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CategoriaEmpleado } from '../../categoria-empleado/entities/categoria-empleado.entity';

@Entity('cat_actividades')
export class CatActividades {
    @PrimaryGeneratedColumn()
    id_cat_actividad: number;

    @Column()
    id_cat_empleado: number;

    @Column({ type: 'varchar', length: 150 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @ManyToOne(() => CategoriaEmpleado, (categoria) => categoria.actividades)
    @JoinColumn({ name: 'id_cat_empleado' })
    categoria: CategoriaEmpleado;
}