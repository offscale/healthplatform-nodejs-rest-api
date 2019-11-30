import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from 'typeorm';

import { Artifact } from '../artifact/models';
import { CategoryEnum } from '../category_enum/models';


@Entity('categorise_tbl')
@Unique('UQ_CAT_NAMES', ['artifact', 'category', 'username'])
export class Categorise {
    static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @ManyToOne(type => Artifact)
    @JoinColumn({ name: 'artifact_location' })
    public artifact!: Artifact;

    @Column()
    public artifact_location!: Artifact['location'];

    @ManyToOne(type => CategoryEnum)
    @JoinColumn({ name: 'category_enum_name' })
    public categoryEnum!: CategoryEnum;

    @Column()
    public category_enum_name!: CategoryEnum['name'];

    @Column('varchar', { nullable: false })
    public category!: string;

    @Column({ type: 'varchar', nullable: false })
    public username!: string;


    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}
