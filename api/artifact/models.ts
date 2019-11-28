import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity('artifact_tbl')
export class Artifact {
    static _omit: string[] = [];

    @PrimaryColumn({ type: 'varchar', nullable: false, unique: true })
    public location!: string;

    @Column({ type: 'varchar', nullable: true })
    public meta?: string;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt?: Date;
}
