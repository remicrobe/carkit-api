import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Car } from './car.entity';
import { Service } from './service.entity';
import {AutoDocEntity} from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class SpendingEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column('double precision')
    cost: number;

    @Column()
    date: string;

    @Column()
    type: string;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deleteAt: string;

    @ManyToOne(() => Car, car => car.spendings)
    @JoinColumn({ name: 'carId' })
    car: Car;

    @Column()
    carId: number;

    @ManyToOne(() => Service, service => service.spending, {
        nullable: true
    })
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @Column({ nullable: true })
    serviceId: number;
}
