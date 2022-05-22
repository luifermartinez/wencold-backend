import { BillOutProduct } from "./BillOutProduct"
import { ShoppingCart } from "./ShoppingCart"
import { EntryInvoiceProduct } from "./EntryInvoiceProduct"
import { Stock } from "./Stock"
import { ProductType } from "./ProductType"
import { Provider } from "./Provider"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm"
import { ProductImage } from "./ProductImage"
import { PulledApart } from "./PulledApart"

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  code: string

  @Column()
  name: string

  @Column({ type: "datetime", nullable: true })
  warrantyUpTo: Date

  @Column()
  price: number

  @ManyToOne((type) => Provider, (provider) => provider.product, {
    eager: true,
  })
  provider: Provider

  @ManyToOne((type) => ProductType, (productType) => productType.product, {
    eager: true,
  })
  productType: ProductType

  @OneToMany((type) => ProductImage, (productImage) => productImage.product)
  productImage: ProductImage[]

  @OneToMany((type) => PulledApart, (pulledApart) => pulledApart.product)
  pulledApart: PulledApart[]

  @OneToOne((type) => Stock)
  stock: Stock

  @OneToMany(
    (type) => BillOutProduct,
    (billOutProduct) => billOutProduct.product
  )
  billoutProducts: BillOutProduct[]

  @OneToMany((type) => EntryInvoiceProduct, (eip) => eip.product)
  entryInvoiceProduct: EntryInvoiceProduct[]

  @OneToMany((type) => ShoppingCart, (shoppingCart) => shoppingCart.product)
  shoppingCart: ShoppingCart[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
