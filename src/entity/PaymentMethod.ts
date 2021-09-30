import { Currency } from './Currency';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, Double, BaseEntity } from "typeorm";
import { Payment } from "./Payment";


@Entity()
export class PaymentMethod extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    ownerName: string;

    @Column({ nullable: true })
    dni: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    bankName: string;

    @OneToMany(type => Payment, payment => payment.paymentMethod)
    payment: Payment[];

    @ManyToOne(type => Currency, currency => currency.paymentMethod)
    currency: Currency;

}
