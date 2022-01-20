import argon2 from "argon2";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { getConnection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { COOKIE_NAME } from '../constants';
import { User } from '../entities/User';
import { MyContext } from "../type";
import { AuthCredentials } from '../utlis/AuthCredentials';
import { sendMail } from '../utlis/sendMail';
import { validateRegister } from '../utlis/validateRegister';
import { FORGOT_PASSWORD } from './../constants';

@ObjectType()
class ErrorField {
    @Field(() => String)
    field: string;

    @Field(() => String)
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [ErrorField], {nullable: true})
    errors?: ErrorField[]

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver()
    email(
        @Root() user: User,
        @Ctx() { req }: MyContext,
    ){
        if(req.session.userId === user.id){
            return user.email
        }
        return "";
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext,
    ) {
        if (!req.session.userId) {
            return null;
        }
        const user = await User.findOne({ id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: AuthCredentials,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {

        const errors = validateRegister(options)
        if(errors){
            return {errors}
        }
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword
                })
                .returning("*")
                .execute();
            user = result.raw[0];
        } catch (error) {
            if(error.code === '23505'){
                if(error.detail.includes('username')){
                    return {
                        errors: [{
                            field: "username ",
                            message: "Username already exists"
                        }],
                    }
                }else{
                    return {
                        errors: [{
                            field: "email ",
                            message: "email already exists"
                        }],
                    }
                }
            }
        }

        req.session.userId = user.id
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {
        const user = await User.findOne(usernameOrEmail.includes('@')
            ? {email : usernameOrEmail}
            : {username: usernameOrEmail}
        );

        if (!user) {
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "Username not found"
                }],
            }
        }
        const verifiedPassword = await argon2.verify(user.password, password);
        if(!verifiedPassword){
            return {
                errors: [{
                    field: "password",
                    message: "Password is incorrect"
                }],
            }
        }
        req.session.userId = user.id;
        return {user};
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ){
        return new Promise((resolve) => {
            req.session.destroy((err: any) => {
                res.clearCookie(COOKIE_NAME)
                if(err){
                    console.log(err)
                    return resolve(false)
                }else{
                    resolve(true)
                }
            })
        })
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext,
    ){
        const user = await User.findOne({email});
        if (!user) {
            return false
        }
        const token = uuidV4()
        const key = FORGOT_PASSWORD + token;
        await redis.set(key,`${user.id}`,"ex",1000 * 60 * 60 * 24);
        await sendMail(email, `
            <a href="http://localhost:3000/reset-password/${token}">
                Reset Password
            </a>
        `)
        return true;
    }

    @Mutation(() => UserResponse)
    async resetPassword(
        @Arg("newPassword") newPassword: string,
        @Arg("token") token: string,
        @Ctx(){ req, redis}: MyContext
    ): Promise<UserResponse>{
        const key = FORGOT_PASSWORD + token
        const res = await redis.get(key)

        if(!res){
            return {
                errors: [{
                    field: "token",
                    message: "Token expired"
                }]
            }
        }
        if (newPassword.length <=3){
            return {
                errors: [{
                    field: "password",
                    message: "Password must be at least 3 characters"
                }]
            }
        }
        const user = await User.findOne({id: parseInt(res + "")});
        if (!user) {
            return {
                errors: [{
                    field: "token",
                    message: "User not found"
                }]
            }
        }
        req.session.userId = user.id
        redis.del(key)
        const hashedPassword  = await argon2.hash(newPassword)
        await User.update(user.id, {password: hashedPassword })
        return {user}
    }
}
