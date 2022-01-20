import path from 'path';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Vote } from './entities/Vote';

export const typeOrmConfig: any = {
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "postgres",
    password: "passer123",
    database: "reddit-clone2",
    logging: true,
    synchronize: true,
    entities: [User, Post, Vote],
    migrations: [path.join(__dirname, './migrations/*')],
};
