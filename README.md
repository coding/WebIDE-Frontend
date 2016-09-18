# Coding WebIDE Frontend

This repo contains frontend code of the Coding WebIDE Community Edition. Please refer to the [WebIDE](https://github.com/Coding/WebIDE) repo for instruction on running the whole project.

## Requirement

The repo is written in ES2015, to avoid complications once and for all, please make sure your environment have the right version of node. We use:

- node **v6.x**
- npm **v3.x**

By design a "WebIDE" is supposed to run on a _server_ and accessed by web, thus a unix-like environment is strongly recommended. 

Support for Windows platform will come eventually, but presumably it'll always be lagging behind.

## Development

To start development on this repo, run:
```
npm install
npm start
```

If ever encountered any problem, double check your node version with `node -v` and re-run `npm install` to update dependencies before you report any issue.


## Configuration

By default the backend host is set to `http://localhost:8080` and can be changed from `app/config.js`. `webpack-dev-server` serves on port 8060, which is specified in `package.json`.
