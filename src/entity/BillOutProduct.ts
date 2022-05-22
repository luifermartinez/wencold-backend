import { ReturnProductBillOut } from './ReturnProductBillOut';
import { BillOut } from './BillOut';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { Product } from './Product';

@Entity()
export class BillOutProduct extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;

    @Column({ type: 'int' }) quantity: number;

    @Column({ type: 'datetime' }) billOutDate: Date;

    @ManyToOne((type) => BillOut, (billOut) => billOut.billOutProducts, {
        eager: true,
    })
    billOut: BillOut;

    @ManyToOne((type) => Product, (product) => product.billoutProducts)
    product: Product;

    @OneToOne((type) => ReturnProductBillOut, { eager: true })
    @JoinColumn()
    returnProduct: ReturnProductBillOut;
}
