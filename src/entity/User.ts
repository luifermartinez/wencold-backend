import { Movement } from "./Movement"
import { userStatuses } from "./../helpers/userStatuses"
import { LoginHistory } from "./LoginHistory"
import { ShoppingCart } from "./ShoppingCart"
import { People } from "./People"
import { userRoles } from "./../helpers/userRoles"
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
} from "typeorm"
import { Image } from "./Image"

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column({ select: false })
  password: string

  @Column({ type: "enum", enum: userRoles, default: userRoles.CUSTOMER })
  role: userRoles

  @Column({ type: "enum", enum: userStatuses, default: userStatuses.ACTIVE })
  status: userStatuses

  @Column({ nullable: true })
  bannedReason: string

  @Column({ select: false, nullable: true })
  recoverToken: string

  @Column({ type: "datetime", nullable: true })
  expiresToken: Date

  @OneToOne((type) => Image, { eager: true })
  @JoinColumn()
  image: Image

  @OneToOne((type) => People, { eager: true })
  @JoinColumn()
  people: People

  @OneToMany((type) => ShoppingCart, (shoppingCart) => shoppingCart.user)
  shoppingCart: ShoppingCart[]

  @OneToMany((type) => LoginHistory, (loginHistory) => loginHistory.user)
  loginHistory: LoginHistory[]

  @OneToMany(() => Movement, (movement) => movement.user)
  movement: Movement[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
