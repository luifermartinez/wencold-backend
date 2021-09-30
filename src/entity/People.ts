import { BillOut } from './BillOut';
import { User } from './User';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, OneToMany } from "typeorm";

@Entity()
export class People extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() dni: string;

    @Column() firstname: string;

    @Column() lastname: string;

    @Column() phone: string;

    @Column({ nullable: true }) address: string;

    @OneToOne(type => User)
    user: User;

    @OneToMany(type => BillOut, billOut => billOut.people)
    billouts: BillOut[];

}
