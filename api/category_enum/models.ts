import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity('categorise_tbl')
export class CategoryEnum {
    @PrimaryColumn({ type: 'varchar', name: 'name', nullable: false, unique: true })
    public name!: string;

    @Column('simple-array', { nullable: false })
    public enum!: string[];

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}
