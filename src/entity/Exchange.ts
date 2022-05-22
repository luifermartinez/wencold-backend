import { Payment } from "./Payment"
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
export class Exchange extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "double" })
  bsEquivalence: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Payment, (payment) => payment.exchange)
  payments: Payment[]
}
