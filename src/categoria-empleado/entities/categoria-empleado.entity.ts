import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { CatActividades } from '../../cat-actividades/entities/cat-actividade.entity';

@Entity('categoria_empleado')
export class CategoriaEmpleado {
    @PrimaryGeneratedColumn()
    id_cat_empleado: number;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @OneToMany(() => Empleado, (empleado) => empleado.categoria)
    empleados: Empleado[];

    @OneToMany(() => CatActividades, (actividad) => actividad.categoria)
    actividades: CatActividades[];
}