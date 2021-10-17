# Fantasy Premier League (FPL) Slack Bot

This repository contains a number of examples of different functions 
that can be deployed to interact with Slack, to exhibit data based on
the FPL API.

I personally host these as GCloud functions as they can be deployed for
[free](https://cloud.google.com/functions/pricing) for very large hit-rates.

## Deploying on GCloud

To complete these steps you will need an active GCloud account.

## League Rankings

Found in *league-rankings.js*.

### Parameters 


**chatId**: The identity of the FPL league.

**leagueId**: The identity of a channel, DM, MPDM, or group.

**count**: The number of players from the league to include in the output. 
