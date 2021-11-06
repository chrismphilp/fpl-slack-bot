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
3) Update the `*-deploy.yaml` configuration properties to match your 
desired build (found in `.github/workflows/`).
4) Run the Github actions
5) With your now deployed GCloud functions, you can enter the provided URL with
your choice of slack commands.

## Notes

You will need to give your GCloud Functions `gcloud function invoker` permissions
to be able to call them from Slack.

## League Rankings

**Provides a list of statistics related to teams within the given FPL league**

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

**Provides a list of statistics related to the provided FPL player ID's**

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

**Provides a list of fixture date and times for the current gameweek** 

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

## Gameweek Dream Team

**Provides the top 11 player dream team from the current gameweek** 

Found in *gameweek-dream-team.js*.

### Parameters

__`channel_id: <string>`__ The identity of a channel, DM, MPDM, or group.

### Example Message

```
First Name        Last Name                 Team           Points No. Transfers In No. Transfers Out
----------------- ------------------------- -------------- ------ ---------------- -----------------
Joao Pedro Cavaco Cancelo                   Man City           11          2030235            539115
Alex              McCarthy                  Southampton         9           226779             97219
Adam              Armstrong                 Southampton         9           526200            455303
Jan               Bednarek                  Southampton         8            39241             62217
Conor             Gallagher                 Crystal Palace      8          1356374            458001
Wilfried          Zaha                      Crystal Palace      8           584900            584738
Rico              Henry                     Brentford           7           143024             93397
Bernardo Mota     Veiga de Carvalho e Silva Man City            7           555885            209203
Kai               Havertz                   Chelsea             7           664481            980487
Cheikhou          Kouyate                   Crystal Palace      6            56096             49301
James             McArthur                  Crystal Palace      6           481186            249189
```

## Gameweek Statistics

**Provides a breakdown of statistics for the past 5 Gameweeks**

Found in *gameweek-stats.js*.

### Parameters

__`channel_id: <string>`__ The identity of a channel, DM, MPDM, or group.

### Example Message

```
Name        Deadline         Avg Pts Max Pts Most Sel. Most Capt.   Most VC      Most Trns. In Total Trns.
----------- ---------------- ------- ------- --------- ------------ ------------ ------------- -----------
Gameweek 7  Sat 02 Oct 10:00      38     102 M Salah   C dos Santos M Salah      A Rudiger        12625013
Gameweek 8  Sat 16 Oct 10:00      49     122 M Salah   M Salah      C dos Santos J Cancelo        12142633
Gameweek 9  Fri 22 Oct 17:30      64     165 M Salah   M Salah      M Salah      J Vardy          11147906
Gameweek 10 Sat 30 Oct 10:00      42     116 M Salah   M Salah      J Vardy      M Mount          12690241
Gameweek 11 Fri 05 Nov 18:30       9      65 M Salah   M Salah      C dos Santos R James           9011081
```
