import { ProductImage } from './ProductImage';
import { User } from './User';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Payment } from './Payment';

@Entity()
export class Image extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() path: string;

    @OneToOne(type => User)
    user: User;

    @OneToOne(type => ProductImage)
    productImage: ProductImage;

    @OneToMany(type => Payment, payment => payment.paymentProof)
    payment: Payment[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
