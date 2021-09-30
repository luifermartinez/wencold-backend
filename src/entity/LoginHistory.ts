import { User } from './User';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class LoginHistory extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() token: string;

    @Column() ip: string;

    @Column() location: string;

    @Column() device: string;

    @ManyToOne(type => User, user => user.loginHistory)
    user: User;

}