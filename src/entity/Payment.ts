import { Exchange } from "./Exchange"
import { paymentStatuses } from "./../helpers/paymentStatuses"
import { BillOut } from "./BillOut"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm"
import { Image } from "./Image"
import { PaymentMethod } from "./PaymentMethod"

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "double" })
  amount: number

  @Column({ nullable: true })
  reference: string

  @Column({
    type: "enum",
    enum: paymentStatuses,
    default: paymentStatuses.PENDING,
  })
  status: paymentStatuses

  @ManyToOne(() => Exchange, (exchange) => exchange.payments)
  exchange: Exchange

  @ManyToOne((type) => Image, (image) => image.payment, { eager: true })
  paymentProof: Image

  @ManyToOne((type) => PaymentMethod, (paymentMethod) => paymentMethod.payment)
  paymentMethod: PaymentMethod

  @ManyToOne((type) => BillOut, (billOut) => billOut.payment, { eager: true })
  billOut: BillOut

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
