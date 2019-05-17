# Airdrop Basic Tool

Send any ERC20 tokens to a predefined max number of receivers.
Max is currently set to 100 receivers.

## Installation 

`yarn`

## Configuration

The configuration is specified in file `.env`.

```
To run/deploy the app on your created workspace, please ensure that the `PORT` is `8080`
```

## System start

### Production

  - build: `yarn build`

  - start in background: `pm2 start pm2/script_airdrop.sh`

### Local development

  - build: `yarn build`

  - start in foreground: `yarn start`

## Access the running app

This is a web app running and listenning at port `8080`.
To determine its URL, have a look at the `Machines` small panel and then right-click on (for example) `truffle/dev-machine` to select `Servers`. This will show up a view where the web-app `https` link can be seen at the
row `http-server`. Please be noted that, all the ports displayed in this view mean to be reserved for external access.

