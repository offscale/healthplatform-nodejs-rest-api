import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from 'typeorm';

import { Artifact } from '../artifact/models';
import { CategoryEnum } from '../category_enum/models';


@Entity('categorise_tbl')
@Unique('UQ_CAT_NAMES', ['artifactLocation', 'categoryEnumName', 'username'])
export class Categorise {
    static _omit: string[] = [];

    /*@Column()
    @Generated('uuid')*/
    @PrimaryGeneratedColumn()
    public id!: number;


    @/*Primary*/Column({ type: 'varchar' })
    @ManyToOne(type => Artifact)
    @JoinColumn({ name: 'artifactLocation', referencedColumnName: 'location' })
    public artifactLocation!: Artifact['location'];

    @/*Primary*/Column({ type: 'varchar' })
    @ManyToOne(type => CategoryEnum)
    @JoinColumn({ name: 'categoryEnumName', referencedColumnName: 'name' })
    public categoryEnumName!: CategoryEnum['name'];

    @Column('varchar', { nullable: false })
    public category!: string;

    @PrimaryColumn({ type: 'varchar', nullable: false })
    public username!: string;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}
