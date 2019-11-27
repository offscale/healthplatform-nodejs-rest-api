import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity('category_enum_tbl')
export class CategoryEnum {
    static _omit: string[] = [];

    @PrimaryColumn({ type: 'varchar', nullable: false, unique: true })
    public name!: string;

    @Column('simple-array', { nullable: false })
    public enumeration!: string[];

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}
