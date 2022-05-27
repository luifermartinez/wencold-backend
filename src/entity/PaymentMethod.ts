import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  DeleteDateColumn,
} from "typeorm"
import { Payment } from "./Payment"

@Entity()
export class PaymentMethod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  ownerName: string

  @Column({ nullable: true })
  dni: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  phoneNumber: string

  @Column({ nullable: true })
  bankName: string

  @Column({ nullable: true })
  accountNumber: string

  @OneToMany((type) => Payment, (payment) => payment.paymentMethod)
  payment: Payment[]

  @DeleteDateColumn()
  deletedAt: Date
}
