import { ReturnProductBillOut } from './ReturnProductBillOut';
import { BillOut } from './BillOut';
import { People } from './People';
import { ReturnProduct } from './ReturnProduct';
import { Movement } from './Movement';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Product } from './Product';
import { EntryInvoice } from './EntryInvoice';

@Entity()
export class BillOutProduct extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' }) quantity: number;

    @Column({ type: 'datetime' }) billOutDate: Date;

    @ManyToOne(type => BillOut, billOut => billOut.billOutProducts, { eager: true })
    billOut: BillOut;

    @OneToOne(type => ReturnProductBillOut, { eager: true })
    @JoinColumn()
    returnProduct: ReturnProductBillOut;

}
