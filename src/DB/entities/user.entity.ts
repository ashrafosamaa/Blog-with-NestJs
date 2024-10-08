import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";


@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: false, length: 255 })
    name: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    username: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar', nullable: false })
    password: string;

    @Column({type: 'enum', enum: ["USER", "ADMIN"], default: "USER"})
    role: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    accountActivateCode: string;

    @Column({ type: 'boolean', default: false })
    accountActivated: boolean;

    @Column({ type: 'varchar', nullable: true })
    passwordResetCode: string;

    @Column({ type: 'boolean', default: false })
    passwordResetVerified: boolean;

    @Column({ type: 'varchar', nullable: true })
    url: string;

    @Column({ type: 'varchar', nullable: true })
    public_id: string;

    @Column({ type: 'varchar', nullable: true })
    folderId: string;

    @Column({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;
    
    @Column({type: 'timestamp', default: () => "CURRENT_TIMESTAMP", onUpdate: 'CURRENT_TIMESTAMP',})
    updatedAt: Date;

    @OneToMany(() => BlogEntity, blogEntity => blogEntity.author)
    blogEntries: BlogEntity[];

}
