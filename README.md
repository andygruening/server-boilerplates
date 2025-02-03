# Daily Rewards Server Boilerplate

## Why?
Games want to integrate Daily Rewards to push players to enter the game everyday. Use case for any kind of game genre.
Players will be rewarded for consecutive days. Like: "If I play the game for 7 days in a row, I get a really powerful sword for free!" 
This project aims to provide our partners a quick and easy solution to get this feature integrated.

## Technical Details:
- GetIdToken() from the Unity SDK as the Authorization header to verify the user's wallet address
- Use Cloudflare's D1 database to keep track of the player's reward status
- Define a list of rewards for each day within this code (ERC20 & ERC1155 contracts)
- Sequence.JS to mint token rewards to the verified player
- Indexer in Unity to access token image and name for the UI 

## Next Steps:
- Get this repository code to a repo on the 0xsequence-demos GitHub org
- Release the boilerplate inside the Unity SDK repo
- Write a guide on how to get this going using the Unity SDK
- Share this with all partners who use our Unity SDK

## Rough Guide:
- Create the token contracts on `Sequence's Builder`
- Define your rewards inside `dailyRewards.ts`
- Duplicate `example.wrangler.toml` and name it `wrangler.toml`
- Create DB: `pnpm wrangler d1 create <NAME>`
- Put `uuid` and `name` inside `wrangler.toml` from: `pnpm wrangler d1 list`
- Deploy updates: `pnpm wrangler pages deploy`
- Put the API url inside the Daily Rewards prefab in Unity
