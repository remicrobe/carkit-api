import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Car } from './car.entity';
import {AutoDocEntity} from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class FullTankEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('double precision')
    quantity: number;

    @Column()
    unit: string;

    @Column('double precision')
    cost: number;

    @Column({ type: 'bigint' })
    mileage: number;

    @Column()
    date: string;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deleteAt: string;

    @ManyToOne(() => Car, car => car.fullTanks)
    @JoinColumn({ name: 'carId' })
    car: Car;

    @Column()
    carId: number;
}
