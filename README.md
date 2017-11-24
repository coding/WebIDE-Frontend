# Coding WebIDE Frontend
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://github.com/Coding/WebIDE/blob/master/LICENSE) [![Build Status](https://travis-ci.org/Coding/WebIDE-Frontend.svg?branch=master)](https://travis-ci.org/Coding/WebIDE-Frontend) [![Docker Stars](https://img.shields.io/docker/stars/webide/frontend.svg)](https://hub.docker.com/r/webide/frontend 'DockerHub') [![Docker Pulls](https://img.shields.io/docker/pulls/webide/frontend.svg)](https://hub.docker.com/r/webide/frontend 'DockerHub')

This repo contains frontend code of the Coding WebIDE Community Edition. Please refer to the [WebIDE](https://github.com/Coding/WebIDE) repo for instruction on running the whole project.

## Requirement

The repo is written in ES2015, to avoid complications once and for all, please make sure your environment have the right version of node. We use:

- node **v6.x**
- yarn

We strongly recommend `yarn` as your package manager, it will certainly save you from lots of npm induced headache ;-) If you don't have `yarn` installed yet, install it globally by running.
```
npm install yarn -g
```
To learn more about `yarn`, check out their [official site](https://yarnpkg.com/).

By design a "WebIDE" is supposed to run on a _server_ and accessed by web, thus a unix-like environment is strongly recommended. Support for Windows platform will come eventually, but presumably it'll always be lagging behind.

## Development

To start development on this repo, 
first set task.yaml: cp from task.yaml.tpl

Set .env

run:
```
yarn
npm -g i pm2
yarn pm2
```

If you insist that you don't want yarn, well, you can still run:
```
npm install
npm -g i pm2
npm run pm2
```

If ever encountered any problem, double check to ensure your node version is at v6.x with `node -v`, and re-run `yarn`(`npm install`) to update dependencies before you report any issue.


## Configuration

By default the backend host that this frontend connects to is `http://localhost:8080`, this can be changed in `app/config.js`. `webpack-dev-server` by default serves on port 8060, which is specified in `package.json` scripts section.
