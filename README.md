# Airdrop Basic Tool

This tool is used to send any ERC20 token to a predefined max number of receivers.
In this basic version, Max is currently set to 100 receivers. You can use CDE and POA nodes on the ML BPaaS platform to explore and run this tool.

For the detailed steps of how to use ML BPaaS for dApp development and testing, please refer to the platform document:

https://docs.morpheuslabs.io

The steps below run in a terminal of CDE on the platform.

## Installation 

`yarn`

## Configuration

The configuration is specified in file `.env`.

```
To run/deploy the app on your created workspace, please ensure that the `PORT` is `8080`
```

## Run Application

### Production environment

  - build: `yarn build`

  - start in background: `pm2 start pm2/script_airdrop.sh`

### Local development environment

  - build: `yarn build`

  - start in foreground: `yarn start`

## Access the running app

This is a web app running and listenning at port `8080`.

To determine its URL, have a look at the `Machines` small panel and then right-click on (for example) `truffle/dev-machine` to select `Servers`. This will show up a view where the web-app `https` link can be seen at the
row `http-server`. Please note that, all the ports displayed in this view meant to be reserved for external access.

## Smart contract

  - For this Airdrop dApp, there is only 1 simple smart contract `contracts/Airdrop.sol` with its built JSON file located in `src/artifacts/Airdrop.json`.

  - To re-compile and re-deploy, it's possible to use the online Remix tool [https://remix.ethereum.org/] that interacts with `Metamask`. 

  - Upon re-compiling for new modification of the smart contract, fetch the JSON file from the online Remix tool to replace existing the JSON file.

  - Upon re-deployment, the `REACT_APP_AIRDROP_CONTRACT_RINKEBY` value in `.env` file must be updated.

