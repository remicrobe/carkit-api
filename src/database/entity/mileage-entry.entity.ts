import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Car } from './car.entity';
import { AutoDocEntity } from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class MileageEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint' })
    mileage: number;

    @Column()
    date: string;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deletedAt: string;

    @ManyToOne(() => Car, car => car.mileages)
    @JoinColumn({ name: 'carId' })
    car: Car;

    @Column()
    carId: number;
}