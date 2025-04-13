import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { Part } from './part.entity';
import { MileageEntry } from './mileage-entry.entity';
import { SpendingEntry } from './spending-entry.entity';
import { ColumnImageTransformer } from "../transformer/ColumnImageTransformer";
import { User } from "./user.entity";
import { AutoDocEntity } from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class Car {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column()
    brand: string;

    @Column()
    model: string;

    @Column({ nullable: true, transformer: new ColumnImageTransformer() })
    imageUrl: string;

    @Column({ type: 'bigint' })
    mileageAtStart: number;

    @Column({ type: 'bigint' })
    year: number;

    @Column()
    type: string;

    @Column()
    createdAt: string;

    @Column({ nullable: true })
    updatedAt: string;

    @Column({ nullable: true })
    deletedAt: string;

    @OneToMany(() => Part, part => part.car, {
        cascade: true
    })
    parts: Part[];

    @OneToMany(() => MileageEntry, mileage => mileage.car, {
        cascade: true
    })
    mileages: MileageEntry[];

    @OneToMany(() => SpendingEntry, spending => spending.car, {
        cascade: true
    })
    spendings: SpendingEntry[];

    @ManyToOne(() => User, (user) => user.cars)
    user: User;
}