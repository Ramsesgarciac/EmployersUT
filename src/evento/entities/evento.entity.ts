import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { HojaVida } from '../../hoja-vida/entities/hoja-vida.entity';
import { CatalogoEventos } from '../../catalogo-eventos/entities/catalogo-evento.entity';

@Entity('evento')
export class Evento {
    @PrimaryGeneratedColumn()
    id_evento: number;

    @Column()
    id_hoja_vida: number;

    @Column()
    id_tipo_evento: number;

    @Column({ type: 'date' })
    fecha_evento: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    cargo_anterior: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    cargo_nuevo: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salario_anterior: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salario_nuevo: number;

    @CreateDateColumn()
    fecha_registro: Date;

    @ManyToOne(() => HojaVida, (hoja) => hoja.eventos)
    @JoinColumn({ name: 'id_hoja_vida' })
    hojaVida: HojaVida;

    @ManyToOne(() => CatalogoEventos, (catalogo) => catalogo.eventos)
    @JoinColumn({ name: 'id_tipo_evento' })
    tipoEvento: CatalogoEventos;
}
