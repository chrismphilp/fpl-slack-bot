# Fantasy Premier League (FPL) Slack Bot

This repository contains a number of examples of different functions 
that can be deployed to interact with Slack, to exhibit data based on
the FPL API.

I personally host these as GCloud functions as they can be deployed for
[free](https://cloud.google.com/functions/pricing) for very large hit-rates.

## Deploying on GCloud

To complete these steps you will need an active [GCloud account](https://cloud.google.com/sdk/gcloud/reference/auth/login) 
and a created [Slack bot](https://api.slack.com/apps?new_app=1).

1) Fork the repository.
2) Setup secrets for the following fields in Github Actions:
   1) `GCP_SA_KEY` - 
   2) `GCP_PROJECT` -
3) Update the `league-rankings-deploy.yaml` and `player-history-deploy.yaml` configuration
properties to match your desired build (found in `.github/workflows/`).
4) Run the Github actions
5) With your now deployed GCloud functions, you can enter the provided URL with
your choice of slack commands.

## Notes

You will need to give your GCloud Functions `gcloud function invoker` permissions
to be able to call them from Slack.

## League Rankings

Found in *league-rankings.js*.

### Parameters 

__`channel_id: <string>`__ The identity of a channel, DM, MPDM, or group.

__`text: <string>`__ The identity of the FPL league.

### Example Message

```
Team Name            Player Name    ID       T/P T/GW/P League Rank
-------------------- -------------- -------- --- ------ -----------
ITS DONDE            Don Donde      44856177 741     41           1
DANCING ROSE PARAMBA Jay Kishan     32113716 740     54           2
Welcome home         Faiz Sharif    21045290 740     54           3
```

## Player History

Found in *player-history.js*.

### Parameters

__`channel_id: <string>`__ The identity of a channel, DM, MPDM, or group.

__`text: <string>`__ The identity of the FPL league.

__`count: <number> | default = 10`__ The number of players from the league
to include in the output.

### Example Message

```
Team Name     First Name Last Name ID  T/P Μ/GW/P  σ/GW/P  Global Rank
------------- ---------- --------- --- --- ------- ------- -----------
Hasselhoff XV Chaz (AZ)  Phillips  500 635 70.56   20.22         41684
Heine         Heine      Brakstad  50  604 67.11   19.01        237667
```

## Gameweek Fixtures

Found in *gameweek-fixtures.js*.

### Parameters

__`channel_id: <string>`__ The identity of a channel, DM, MPDM, or group.

### Example Message

```
Home           Away        Kickoff                       
-------------- ----------- ------------------------------
Southampton    Aston Villa 20:00 Friday 5 November 2021  
Man Utd        Man City    12:30 Saturday 6 November 2021
Brentford      Norwich     15:00 Saturday 6 November 2021
Chelsea        Burnley     15:00 Saturday 6 November 2021
Crystal Palace Wolves      15:00 Saturday 6 November 2021
```
