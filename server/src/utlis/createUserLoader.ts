import { User } from "../entities/User"
import DataLoader from 'dataloader'

//parameter id[]: [1,2,3]
//return User[]: [{id:1, name: 'name1'}, {id:2, name: 'name2'}, {id:3, name: 'name3'}]

export const createUserLoader = () =>
    new DataLoader<number, User>( async (userIds) => {
        const users = await User.findByIds(userIds as number[])
        const usersIdsToUsers: Record<number, User> = {}
        users.forEach(user => {
            usersIdsToUsers[user.id] = user
        })
        return userIds.map((userId) => usersIdsToUsers[userId])
    })
