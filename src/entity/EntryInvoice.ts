import { EntryInvoiceProduct } from "./EntryInvoiceProduct"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm"

@Entity()
export class EntryInvoice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  code: string

  @OneToMany((type) => EntryInvoiceProduct, (eip) => eip.entryInvoice)
  entryInvoiceProduct: EntryInvoiceProduct[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
