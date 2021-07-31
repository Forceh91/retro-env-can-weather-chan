# Retro Environment Canada Weather Channel

This project is intended to be a loose recreation of the Environment Canada Weather Channel that was commonly found in Winnipeg in the 80s-90s. This is modeled after the 1995 version. I've tried to be as accurate as possible however there are still some tweaks that could be made to make them more true to life.

All data for the weather channel is sourced from [Environment Canada](https://weather.gc.ca/).

Once up and running the weather channel will be accessible from your browser.

![current-conditions](images/current-conditions.png)
![forecast](images/forecast.png)
![almanac](images/almanac-temps.png)
![observations](images/observations.png)

## Current Features

- Current conditions
- Forecast
- Almanac Data (Sunset/Rise, High/Low Temp Records)
- Latest Hourly Observation for various cities

## Missing Features

- Alerts
- Windchill
- Snowfall/Precipitation Amounts
- High/Low for the day

## Planned Features

- Customizable screen rotation
- Customizable playlists

## Requirements

To run this project you will need an internet connection and (at least) [Node v14.6.1](https://nodejs.org/en/download/).

NPM will be installed along with Node however I recommend using [Yarn](https://yarnpkg.com/) for this project.

Before continuing along with this guide make sure you run the following to install the project dependencies.

```
yarn install
```

## Server Configuration

Before you can start the server you will need to run the setup file to select which Canadian location to pull your weather info from. You will be presented with a list of every location available, or you can use the `--search <town/city>` option to narrow down the results.

```
node setup.js [--search town/city]
```

Now that the server is configured you can run the backend component and the frontend will connect to this to retrieve relevant info.

```
node backend.js
```

If sucessful you should see the following in your command prompt:

```
Loading retro-envcan with primary location of <location> - <province>
Listening on 8600...
Navigate to http://localhost:8600/ in your browser
```

## Accessing the channel

### End-users

If you don't intend on doing any development for the project you can just navigate to the channel in your [browser](http://localhost:8600/) as instructed by your terminal window.

The output will fill your browser however the actual screen area will be limited to 640x480.

### Developers

Whilst doing any development for the project you can build (and serve) the frontend using the below command.

```
yarn serve
```

This will give you access to a hot-reloadable version of the weather channel in your [browser](http://localhost:8080/).
