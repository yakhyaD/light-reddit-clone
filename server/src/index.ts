import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { PostResolver } from './resolvers/PostResolver';
import { UserResolver } from './resolvers/UserResolver';
import { typeOrmConfig } from './typeorm.config';
import { createUserLoader } from './utlis/createUserLoader';
import { createVoteLoader } from './utlis/createVoteLoader';

const main = async () => {
    await createConnection(typeOrmConfig);

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.use(cors({
        origin: ["https://studio.apollographql.com", "http://localhost:3000"],
        credentials: true
    }))
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                secure: __prod__,
            },
            saveUninitialized: false,
            secret: 'fwriubgwrkglhwo',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            voteLoader: createVoteLoader(),
        })
    })

    await apolloServer.start();

    apolloServer.applyMiddleware({
        app,
        cors: {
            origin: ["https://studio.apollographql.com", "http://localhost:3000"]
        }
    })
    app.listen(4000, () => {
        console.log("server listening on port 4000")
    })
}


main().catch(err => console.error(err));
