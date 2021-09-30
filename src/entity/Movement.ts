import { Stock } from './Stock';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Product } from './Product';

@Entity()
export class Movement extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() description: string;

    @Column({ type: 'int' }) quantity: number;

    @Column({ type: 'datetime' }) movementDate: Date;

    @ManyToOne(type => Stock, stock => stock.movement)
    stock: Stock;

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
