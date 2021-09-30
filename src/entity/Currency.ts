import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { PaymentMethod } from "./PaymentMethod";
import { Product } from "./Product";

@Entity()
export class Currency extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() name: string;

    @Column() symbol: string;

    @Column({ type: 'double' }) bsEquivalence: number;

    @OneToMany(type => Product, product => product.currency)
    product: Product[];

    @OneToMany(type => PaymentMethod, paymentMethod => paymentMethod.currency)
    paymentMethod: PaymentMethod[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
