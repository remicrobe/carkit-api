import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm';
import { Car } from './car.entity';
import { SpendingEntry } from './spending-entry.entity';
import { AutoDocEntity } from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class Part {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    status: string;

    @Column({ nullable: true })
    advicedRevision: string;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deletedAt: string;

    @ManyToOne(() => Car, car => car.parts)
    @JoinColumn({ name: 'carId' })
    car: Car;

    @Column()
    carId: number;

    @OneToMany(() => SpendingEntry, spending => spending.vehiclePart)
    spendings: SpendingEntry[];
}