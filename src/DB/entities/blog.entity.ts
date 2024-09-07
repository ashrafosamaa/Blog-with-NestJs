import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity('blog_entry')
export class BlogEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    title: string;

    @Column({default: ''})
    desc: string;

    @Column({default: ''})
    body: string;

    @Column({default: 0 })
    likes: number;

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

    @ManyToOne(()=> UserEntity, user => user.blogEntries)
    author: UserEntity;

    @Column()
    authorId: number;

}
