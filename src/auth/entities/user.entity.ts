import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    // 👇 Aquí agregarás tus roles cuando los definas
    // RRHH = 'rrhh',
    // SUPERVISOR = 'supervisor',
}

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 200, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;
    // 👆 Cuando agregues más roles, solo amplías el enum de arriba

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    fecha_creacion: Date;

    @UpdateDateColumn()
    fecha_actualizacion: Date;
}