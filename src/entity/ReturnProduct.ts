import { EntryInvoiceProduct } from './EntryInvoiceProduct';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class ReturnProduct extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() description: string;

    @CreateDateColumn() returnDate: Date;

    @OneToOne(type => EntryInvoiceProduct)
    entryInvoiceProduct: EntryInvoiceProduct;

}
