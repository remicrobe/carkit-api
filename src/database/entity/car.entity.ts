import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany
} from "typeorm";
import {User} from "./user.entity";
import {Image} from "./image.entity";

@Entity()
export class Car {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    fabricant: string;

    @Column({ nullable: true })
    licencePlate: string;

    @Column({ nullable: true })
    type: number;

    @Column({ nullable: true })
    color: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    mileage: number;

    @Column({ nullable: true })
    year: number;

    @Column({ nullable: true })
    fuel: number;

    @Column({ nullable: true })
    unit: number;

    @Column({ nullable: true })
    purchasePrice: number;

    @Column({ nullable: true })
    purchaseDate: Date;

    @Column({ nullable: true })
    mileageAtPurchase: number;

    @DeleteDateColumn({ nullable: true })
    archivedAt: Date;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @Column({ nullable: true })
    note: string;

    @ManyToOne(() => User, (user) => user.cars)
    user: User;

    @OneToMany(() => Image, (photo) => photo.car, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    images: Image[]
}
