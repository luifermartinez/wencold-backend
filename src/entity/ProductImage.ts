import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm"
import { Image } from "./Image"
import { Product } from "./Product"

@Entity()
export class ProductImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne((type) => Product, (product) => product.productImage)
  product: Product

  @OneToOne((type) => Image, { eager: true })
  @JoinColumn()
  image: Image
}
