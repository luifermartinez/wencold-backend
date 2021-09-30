import { LoginHistory } from './LoginHistory';
import { ShoppingCart } from './ShoppingCart';
import { People } from './People';
import { userRoles } from './../helpers/userRoles';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Image } from './Image';
import { PulledApart } from './PulledApart';

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() email: string;

    @Column({ select: false }) password: string;

    @Column({ type: 'enum', enum: userRoles, default: userRoles.CUSTOMER }) role: userRoles;

    @Column({ select: false, nullable: true }) recoverToken: string;

    @Column({ type: 'datetime', nullable: true }) expiresToken: Date;

    @OneToOne(type => Image, { eager: true })
    @JoinColumn() image: Image;

    @OneToOne(type => People, { eager: true })
    @JoinColumn() people: People;

    @OneToOne(type => ShoppingCart)
    @JoinColumn()
    shoppingCart: ShoppingCart;

    @OneToMany(type => LoginHistory, loginHistory => loginHistory.user)
    loginHistory: LoginHistory[];

    @OneToMany(type => PulledApart, pulledApart => pulledApart.user)
    pulledApart: PulledApart[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
