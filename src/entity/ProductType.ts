import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Product } from './Product';

@Entity()
export class ProductType extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() name: string;

    @Column() description: string;

    @OneToMany(type => Product, product => product.productType)
    product: Product[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
