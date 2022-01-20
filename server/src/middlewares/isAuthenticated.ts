import { MyContext } from "src/type";
import { MiddlewareFn } from "type-graphql";

export const isAuthenticated: MiddlewareFn<MyContext> = ({ context}, next) => {
    if(!context.req.session.userId){
        throw new Error("not authenticated");
    }
    return next();
}
