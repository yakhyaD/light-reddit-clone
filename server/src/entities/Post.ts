import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Vote } from "./Vote";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({type: "int", default: 0})
    points!: number;

    @Field()
    @Column()
    authorId: number;

    @Field(() => Int, {nullable: true})
    voteStatus: number;

    @Field()
    @ManyToOne(() => User, user => user.posts)
    author: User;

    @OneToMany(() => Vote, votes => votes.post)
    votes: Vote[];

    @Field()
    @CreateDateColumn ()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;


}
