import { BillOut } from './BillOut';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class Tax extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column() description: string;

    @Column({ type: 'double', precision: 5, scale: 2 }) tax: number;

    @OneToMany(type => BillOut, billout => billout.tax)
    billOut: BillOut[];

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;

}
