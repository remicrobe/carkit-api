import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { Part } from './part.entity';
import { SpendingEntry } from './spending-entry.entity';
import {AutoDocEntity} from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: string;

    @Column({ type: 'bigint' })
    mileage: number;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deletedAt: string;

    @ManyToOne(() => Part, part => part.services)
    @JoinColumn({ name: 'partId' })
    part: Part;

    @Column()
    partId: number;

    @OneToOne(() => SpendingEntry, spending => spending.service, {
        nullable: true
    })
    spending: SpendingEntry;
}
