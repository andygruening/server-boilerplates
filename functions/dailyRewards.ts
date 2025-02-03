import {Response} from "node-fetch";
import {AuthHandler} from "../src/authHandler";
import {MintHandler} from "../src/mintHandler";
import {getCurrentTimestamp} from "../src/timeUtils";
import {UserDb} from "../src/userDb";
import {RewardData} from "../src/rewardModel";

const rewardsConfig: RewardData[][] = [
    [{type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 3, amount: 1}],
    [{type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 3, amount: 5}],
    [{type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 1, amount: 3}],
    [{type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 2, amount: 3}],
    [{type: 'ERC1155', contractAddress: '0xd2926e2ee243e8df781ab907b48f77ec5d7a8be1', tokenId: 4, amount: 1}],
]

const timeDelay = 15;

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        let curTime = getCurrentTimestamp();
        const userDb = new UserDb();

        switch (context.request.method) {
            case "OPTIONS":
                return new Response(`Pass-through for CORS requests`);
            case "GET":
                const getWalletAddress = await AuthHandler.verifyRequest(context);
                const getUserStatus = await userDb.getUserStatus(context, getWalletAddress, timeDelay);

                return new Response(JSON.stringify({
                    nextClaimTime: getUserStatus.lastClaimTime + timeDelay,
                    userStatus: getUserStatus,
                    rewards: rewardsConfig
                }));
            case "POST":
                const postWalletAddress = await AuthHandler.verifyRequest(context);
                const postUserStatus = await userDb.getUserStatus(context, postWalletAddress, timeDelay);
                const timePassed = curTime - postUserStatus.lastClaimTime;
                if (timePassed < timeDelay) {
                    throw new Error('Cannot claim reward yet.');
                }

                const rewards = rewardsConfig[postUserStatus.progress];
                const minter = new MintHandler(context.env);
                await minter.mintToUser(postWalletAddress, rewards);

                let newProgress = postUserStatus.progress + 1;
                if (newProgress >= rewardsConfig.length) {
                    newProgress = 0;
                }

                curTime = getCurrentTimestamp();
                const newUserStatus = {
                    id: postWalletAddress,
                    progress: newProgress,
                    lastClaimTime: curTime
                };

                await userDb.setUserStatus(context, newUserStatus);

                return new Response(JSON.stringify({
                    nextClaimTime: curTime + timeDelay,
                    userStatus: newUserStatus,
                    rewards: rewardsConfig
                }));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        const response = new Response(`${e.message} (${e.stack})`);
        response.ok = false;
        response.status = 401;
        return response;
    }
};
