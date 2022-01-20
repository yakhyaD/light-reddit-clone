import { Request, Response } from "express";
import { RedisClient } from "redis";
import { createUserLoader } from "./utlis/createUserLoader";
import { createVoteLoader } from "./utlis/createVoteLoader";

export type MyContext = {
    req: Request & {session: any};
    res: Response;
    redis: RedisClient;
    userLoader: ReturnType<typeof createUserLoader>;
    voteLoader: ReturnType<typeof createVoteLoader>;
}
