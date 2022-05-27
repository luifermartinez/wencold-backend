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

@Entity()
export class Stock extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "int", default: 0 }) existence: number

  @Column({ type: "int", default: 0 }) available: number

  @OneToOne((type) => Product, { eager: true })
  @JoinColumn()
  product: Product

  @OneToMany((type) => Movement, (movement) => movement.stock)
  movement: Movement[]

  @CreateDateColumn() createdAt: Date

  @UpdateDateColumn() updatedAt: Date
}
