import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn, ManyToOne,
} from "typeorm";
import {Car} from "./car.entity";

@Entity()
export class Entry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    type: number;

    @Column({ nullable: true })
    part: number;

    @Column({ nullable: true })
    spendingType: number;

    @Column("double", { nullable: true })
    price: number;

    @Column("double", { nullable: true })
    quantity: number;

    @CreateDateColumn()
    date: Date;

    @Column({ nullable: true })
    mileage: number;

    @Column({ nullable: true })
    notes: string;

    @ManyToOne(() => Car, (car) => car.images)
    car: Car
}
