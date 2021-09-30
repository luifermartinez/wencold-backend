import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Image } from "./Image";
import { Product } from "./Product";

@Entity()
export class ProductImage extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Product, product => product.productImage)
    product: Product;

    @OneToOne(type => Image)
    @JoinColumn()
    image: Image;

}
