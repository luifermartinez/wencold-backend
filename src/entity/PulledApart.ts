import { User } from './User';
import { Movement } from './Movement';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Product } from './Product';

@Entity()
export class PulledApart extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' }) quantity: number;

    @Column({ type: 'datetime' }) pulledApartDate: Date;

    @Column({ type: 'datetime' }) dueDate: Date;

    @ManyToOne(type => Product, product => product.pulledApart)
    product: Product;

    @ManyToOne(type => User, user => user.pulledApart)
    user: User;

    @OneToMany(type => Movement, movement => movement.stock)
    movement: Movement[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
