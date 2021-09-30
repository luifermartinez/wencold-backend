import { EntryInvoiceProduct } from './EntryInvoiceProduct';
import { Movement } from './Movement';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Product } from './Product';

@Entity()
export class EntryInvoice extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true }) code: string;

    @OneToMany(type => EntryInvoiceProduct, eip => eip.entryInvoice)
    entryInvoiceProduct: EntryInvoiceProduct[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
