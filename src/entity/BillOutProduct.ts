import { BillOut } from "./BillOut"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm"
import { Product } from "./Product"

@Entity()
export class BillOutProduct extends BaseEntity {
  @PrimaryGeneratedColumn() id: number

  @Column({ type: "int" }) quantity: number

  @Column({ type: "datetime" }) billOutDate: Date

  @ManyToOne((type) => BillOut, (billOut) => billOut.billOutProducts, {
    eager: true,
  })
  billOut: BillOut

  @ManyToOne((type) => Product, (product) => product.billoutProducts, {
    eager: true,
  })
  product: Product

}
