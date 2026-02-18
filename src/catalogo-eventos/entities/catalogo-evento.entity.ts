import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Evento } from '../../evento/entities/evento.entity';

@Entity('catalogo_eventos')
export class CatalogoEventos {
    @PrimaryGeneratedColumn()
    id_tipo_evento: number;

    @Column({ type: 'varchar', length: 100 })
    nombre_evento: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @OneToMany(() => Evento, (evento) => evento.tipoEvento)
    eventos: Evento[];
}