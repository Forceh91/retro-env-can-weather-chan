# Retro Envrionment Canada Weather Channel

This project is a simulator of the Environemnt Canada Weather Channel that Winnipeg broadcast via cable from the 80s to the early 2000s. This project aims to recreate the mid-90s version of the channel.

## Features

This project includes all of the features from the original weather channel such as:

- Weather alerts/warnings/watches issued by ECCC (based off weather station lat/long)
- Current conditions and forecast
- 5 day outlook
- Temperature records for last year, normal, and all-time
- Air Quality Health Index readings and warnings
- Province temperature and precipitation tracking
- Conditions across Canada (MB, West, East)
- Conditions across the US
- Sunspot forecats
- Stats for the current day (sunrise/set, Canada hot/cold spots) and total precipitation for the current season
- Stats for last month
- Windchill (in the old watts per square metre format)
- Flavours

Some of the above features are season/time of month specific and will automatically come and go as required

## Project Setup

### Dependencies

This project has a few dependencies that need downloading and installing before you can use it

- Internet connection
- [Node v18 or above](https://nodejs.org/en)
- [Yarn package manager](https://yarnpkg.com/)

### Installation

Once you have download (and extracted) either the repository or the latest release you need to open your terminal window and navigate to the folder this project is based in and install the required Node modules

```
yarn install
```

## Running the simulator

### End-users

If you have download the project from the releases page then all you need to do is run the following command in your terminal window.

```
yarn start
```

If successful you should see something similar to below in your terminal window

```
yarn run v1.22.10
$ tsx src/server.ts
[2023-10-14 13:34:52] [CONFIG] Loading config file (./cfg/rwc-config.json) ...
[2023-10-14 13:34:52] [CONFIG] Loaded weather channel. Location: Toronto, ON (s0000458)
[2023-10-14 13:34:52] [CONFIG] Checking available flavours from cfg/flavours
[2023-10-14 13:34:52] [CONFIG] Loading flavour (screen rotation) stats
[2023-10-14 13:34:52] [FLAVOUR_LOADER] Successfully loaded flavour Stats
[2023-10-14 13:34:52] [CONFIG] Loading crawler messages from ./cfg/crawler.txt
[2023-10-14 13:34:52] [CONFIG] Loaded 4 crawler messages
[2023-10-14 13:34:52] [CONFIG] Loading playlist from music
[2023-10-14 13:34:52] [HISTORICAL_TEMP_PRECIP] Initializing historical data for station ID: 51459
[2023-10-14 13:34:52] [CLIMATE_NORMALS] Initializing climate normals for station ID: 5051
[2023-10-14 13:34:52] [CONDITIONS] Started AMQP conditions listener
[2023-10-14 13:34:53] [PROVINCETRACKING] Loading province tracking from db/province_tracking.json
[2023-10-14 13:34:53] [PROVINCETRACKING] Loaded province tracking from json
[2023-10-14 13:34:53] [PROVINCETRACKING] Tracking 6 locations across the province
[2023-10-14 13:34:53] [PROVINCETRACKING] Switching over tracking and setting display value
[2023-10-14 13:34:53] [PROVINCETRACKING] Updating data for stations
[2023-10-14 13:34:53] [ALERT_MONITOR] Started AMQP alerts listener
[2023-10-14 13:34:53] [ALERT_MONITOR] Loading stored CAP files
[2023-10-14 13:34:53] [CANADA_HOT_COLD_SPOTS] Updating canada/provincial hot/cold spots
[2023-10-14 13:34:53] [USA] Fetching latest observations
[2023-10-14 13:34:53] [AQHI] Air quality will be tracked
[2023-10-14 13:34:53] [AQHI] Fetching latest AQHI observation
[2023-10-14 13:34:53] [SERVER] Starting RWC...
[2023-10-14 13:34:53] [STORAGE] Validating directory structure
[2023-10-14 13:34:53] [STORAGE] Validated directory structure
[2023-10-14 13:34:53] [SERVER] Started RWC
```

#### Using Docker

Clone the repo locally, then run:

```bash
docker-compose up -d
```

This will use the provided `Dockerfile` to build the container and run the app.

The configuration (cfg) will, by default, be stored within a docker volume. You may update the `docker-compose.yml` file to instead store it in a bind mount (in the host's file system) so that the config is more portable. It is also possible to pass a music directory into the container using the same method. The `docker-compose.yml` file has examples of each.

It is recommended to store these (cfg, music) outside of the cloned respository.

### Developers

For those of you wishing to do development work there is hot-reload available for the simulator. You will need multiple terminal windows open for this.

Backend work:

```
yarn dev
```

Display work:

```
yarn display
```

### Port configuration

By default the simulator will run on port 8600, however if you find it is already in use you can pass the `--port <port number>` flag when doing either `yarn start` or `yarn dev`.

## Channel Configuration

By default no configuration is required and the simulator will automatically point to Winnipeg as the main weather channel. However if you want to change the main station or go more in-depth and fully utilize the simulator you should navigate to the [configuration screen](http://localhost:8600/config).

This will allow you to setup extra features such as custom screen rotation (flavours), Air Quality readings, rejecting in-hour condition updates, alternative temperature record source, crawler messages, and more.

### Automatic reload

When your config is saved the updated changes should reflect on the display no more than 5 minutes later (including playlist changes).

### Setting up a playlist

When the simulator runs for the first time you will notice that a `music` directory is created for you. If you wish to update your playlist simply add/remove files to the `music` directory add then scroll to "Playlist" in the "Display" tab on the [configuration screen](http://localhost:8600/config). Once there you will see a "Regenerate playlist" button. Depending on the size of your playlist this may take a few seconds.

## Viewing the channel

The output of the simulator can be accessed via [the browser](http://localhost:8600) and for the best experience you should set your browser window to a resolution of 640x480. The simulator will always render at a resolution of 640x480 regardless of browser window size.

## Thanks/Props/Credits

- **Environment and Climate Change Canada** ([Website](https://www.canada.ca/en/services/environment/weather.html)): API, AMQP, and documentation
- **@wpgne** ([Mastodon](https://mastodon.social/@wpgne), [YouTube](https://www.youtube.com/@wpgne)): Source material and input throughout the development of the project
- **@drdevlin** ([GitHub](https://github.com/drdevlin)): [ec-weather-js](https://github.com/drdevlin/ec-weather-js) project
- **@djrrb** ([GitHub](https://github.com/djrrb)): [retro-env-can-weather-chan-fonts](https://github.com/djrrb/retro-env-can-weather-chan-fonts). David created both the main and secondary fonts from scratch based off original source material! You can read more about Slight Chance (the main font) on his [Font of the Month writeup](https://djr.com/notes/slight-chance-font-of-the-month)

## Support the project

- [@matthdn91](https://threads.net/@matthdn91) on Threads
- Follow us on on Mastodon: [@ecweatherchannel](https://thecanadian.social/@ecweatherchannel), [@forceh91](https://techhub.social/@forceh91)
- Donations via [ko-fi](https://ko-fi.com/forceh)
- 24/7 livestreams for Winnipeg on [YouTube](https://www.youtube.com/@Forceh91/streams)
