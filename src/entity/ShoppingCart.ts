import { User } from './User';
import { Product } from './Product';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, Double, BaseEntity } from "typeorm";


@Entity()
export class ShoppingCart extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' }) quantity: number;

    @ManyToOne(type => Product, product => product.shoppingCart)
    product: Product;

    @OneToOne(type => User)
    user: User;

}