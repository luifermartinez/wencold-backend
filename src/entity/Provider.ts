import { People } from './People';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Image } from './Image';
import { Product } from './Product';

@Entity()
export class Provider extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => People, { eager: true })
    @JoinColumn() people: People;

    @OneToMany(type => Product, product => product.provider)
    product: Product;

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
