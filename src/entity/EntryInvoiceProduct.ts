import { ReturnProduct } from "./ReturnProduct"
import { Movement } from "./Movement"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm"
import { Product } from "./Product"
import { EntryInvoice } from "./EntryInvoice"

@Entity()
export class EntryInvoiceProduct extends BaseEntity {
  @PrimaryGeneratedColumn() id: number

  @Column({ type: "int" }) quantity: number

  @ManyToOne(
    (type) => EntryInvoice,
    (entryInvoice) => entryInvoice.entryInvoiceProduct,
    {
      eager: true,
    }
  )
  entryInvoice: EntryInvoice

  @ManyToOne((type) => Product, (product) => product.entryInvoiceProduct, {
    eager: true,
  })
  product: Product

  @OneToOne((type) => ReturnProduct, { eager: true })
  @JoinColumn()
  returnProduct: ReturnProduct
}
