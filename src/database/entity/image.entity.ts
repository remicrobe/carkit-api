import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ColumnImageTransformer} from "../transformer/ColumnImageTransformer";
import {Car} from "./car.entity";

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true, transformer: new ColumnImageTransformer()})
    link: string;

    // @ManyToOne(() => Car, (car) => car.images)
    // car: Car
}