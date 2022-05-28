import { Tax } from "./Tax"
import { People } from "./People"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm"
import { BillOutProduct } from "./BillOutProduct"
import { Payment } from "./Payment"

export enum billOutStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REFUSED = "refused",
}

@Entity()
export class BillOut extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  code: string

  @Column({ type: "datetime" })
  billOutDate: Date

  @Column({ type: "enum", enum: billOutStatus, default: billOutStatus.PENDING })
  status: billOutStatus

  @ManyToOne(() => People, (people) => people.billouts, { eager: true })
  people: People

  @OneToMany(
    (type) => BillOutProduct,
    (billOutProduct) => billOutProduct.billOut
  )
  billOutProducts: BillOutProduct[]

  @ManyToOne((type) => Tax, (tax) => tax.billOut, { eager: true })
  tax: Tax

  @OneToMany((type) => Payment, (payment) => payment.billOut)
  payment: Payment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
