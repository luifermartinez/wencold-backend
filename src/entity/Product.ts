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

  @ManyToOne(() => Provider, (provider) => provider.product, {
    eager: true,
  })
  provider: Provider

  @ManyToOne(() => ProductType, (productType) => productType.product, {
    eager: true,
  })
  productType: ProductType

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    eager: true,
  })
  productImage: ProductImage[]


  @OneToOne(() => Stock)
  stock: Stock

  @OneToMany(() => BillOutProduct, (billOutProduct) => billOutProduct.product)
  billoutProducts: BillOutProduct[]

  @OneToMany(() => EntryInvoiceProduct, (eip) => eip.product)
  entryInvoiceProduct: EntryInvoiceProduct[]

  @OneToMany(() => ShoppingCart, (shoppingCart) => shoppingCart.product)
  shoppingCart: ShoppingCart[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
