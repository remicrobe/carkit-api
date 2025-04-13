import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Car } from './car.entity';
import { Part } from './part.entity';
import { AutoDocEntity } from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class SpendingEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('double precision')
    amount: number;

    @Column()
    date: string;

    @Column({ nullable: true })
    recurrence: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    quantity: number;

    @Column({ nullable: true })
    unit: string;

    @Column({ nullable: true })
    name: string;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deletedAt: string;

    @ManyToOne(() => Car, car => car.spendings)
    @JoinColumn({ name: 'carId' })
    car: Car;

    @Column()
    carId: number;

    @ManyToOne(() => Part, part => part.spendings, {
        nullable: true
    })
    @JoinColumn({ name: 'partId' })
    vehiclePart: Part;

    @Column({ nullable: true })
    partId: number;

    @Column({ nullable: true })
    serviceId: number;
}