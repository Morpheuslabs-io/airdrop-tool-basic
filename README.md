# Airdrop Basic Tool

Send any ERC20 tokens to a predefined max number of receivers.
Max is currently set to 100 receivers.

## Installation 

`yarn`

## Configuration

The configuration is specified in file `.env`.
Please change the `PORT` accordingly.

## System start

### Production

  - build: `yarn build`

  - start: `pm2 start pm2/script_airdrop.sh`

### Local development

  - build: `yarn build`

  - start: `yarn start`

Listenning port: specified in file `.env` at `PORT`

