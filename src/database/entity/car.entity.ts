import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany, ManyToOne
} from 'typeorm';
import { MileageEntry } from './mileage-entry.entity';
import { FullTankEntry } from './full-tank-entry.entity';
import { SpendingEntry } from './spending-entry.entity';
import { Part } from './part.entity';
import {ColumnImageTransformer} from "../transformer/ColumnImageTransformer";
import {User} from "./user.entity";
import {AutoDocEntity} from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class Car {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column()
    fabricant: string;

    @Column()
    model: string;

    @Column({ nullable: true, transformer: new ColumnImageTransformer() })
    imageLink: string;

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

    @OneToMany(() => MileageEntry, mileage => mileage.car, {
        cascade: true
    })
    mileages: MileageEntry[];

    @OneToMany(() => FullTankEntry, fullTank => fullTank.car, {
        cascade: true
    })
    fullTanks: FullTankEntry[];

    @OneToMany(() => SpendingEntry, spending => spending.car, {
        cascade: true
    })
    spendings: SpendingEntry[];

    @OneToMany(() => Part, part => part.car, {
        cascade: true
    })
    parts: Part[];

    @ManyToOne(() => User, (user) => user.cars)
    user: User;
}
