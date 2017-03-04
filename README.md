# ciosk
> The cron IT dashboard

## Installation

First, install [leitstand-cli](https://npmjs.org/package/leitstand-cli) using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)). Then:

```bash
git clone git@github.com:cron-eu/ciosk.git && cd ciosk
npm install
```


## Usage

Create the configuration file `config.json` by copying `config.example.json` or pass the credentials as CLI parameters.

```bash
leitstand start
```

You can now visit the [default dashboard](http://localhost:9000/dashboards/default)

## Development

Assuming the **ciosk** project folder is located on the same level as one or more plugins, you can link them and / or **leitstand** itself like this:

```bash
npm link ../leitstand*
```

To bundle frontend stuff:

```bash
npm run build
```

To debug / inspect the app:

```bash
node --inspect-brk $(which leitstand) start
```
