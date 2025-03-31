
import {ColumnImageTransformer} from "../transformer/ColumnImageTransformer";
import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Car} from "./car.entity";
import {AutoDocEntity} from "../../decorators/auto-doc-entity";

@Entity()
@AutoDocEntity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Column({select: false})
    password: string;

    @CreateDateColumn({type: "timestamp", select: false})
    createdAt: Date;

    @Column({default: null, nullable: true})
    provider: string;

    @Column({default: false})
    isGuest: boolean;

    @Column({nullable: true, transformer: new ColumnImageTransformer()})
    imageLink: string;

    @Column({default: false, select: false})
    isDeleted: boolean;

    @Column({default: null, select: false, nullable: true})
    deletedAt: Date;

    @Column({default: false, select: false})
    isAnonymise: boolean;

    @OneToMany(() => Car, (car) => car.user)
    cars: Car[];
}