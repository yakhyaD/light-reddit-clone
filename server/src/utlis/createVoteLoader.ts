import DataLoader from 'dataloader'
import { Vote } from "../entities/Vote"

//parameter id[]: [1,2,3]
//return User[]: [{id:1, name: 'name1'}, {id:2, name: 'name2'}, {id:3, name: 'name3'}]

export const createVoteLoader = () =>
    new DataLoader<{postId: number, userId: number}, Vote | null>( async (keys) => {
        const votes = await Vote.findByIds(keys as any)
        const votesIdsToVotes: Record<string, Vote> = {}
        votes.forEach(vote => {
            votesIdsToVotes[`${vote.postId}|${vote.userId}`] = vote
        })
        return keys.map((key) => votesIdsToVotes[`${key.postId}|${key.userId}`])
    })
