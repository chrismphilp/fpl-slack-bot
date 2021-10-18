# Fantasy Premier League (FPL) Slack Bot

This repository contains a number of examples of different functions 
that can be deployed to interact with Slack, to exhibit data based on
the FPL API.

I personally host these as GCloud functions as they can be deployed for
[free](https://cloud.google.com/functions/pricing) for very large hit-rates.

## Deploying on GCloud

To complete these steps you will need an active [GCloud account](https://cloud.google.com/sdk/gcloud/reference/auth/login) 
and a created [Slack bot](https://api.slack.com/apps?new_app=1).

## League Rankings

Found in *league-rankings.js*.

### Parameters 

__`chatId: <string>`__ The identity of the FPL league.

__`leagueId: <string>`__ The identity of a channel, DM, MPDM, or group.

__`count: <number> | default = 10`__ The number of players from the league 
to include in the output.

## Player History

Found in *player-history.js*.
