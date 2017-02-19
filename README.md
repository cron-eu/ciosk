# ciosk
> The cron IT dashboard

## Installation

First, install [leitstand-cli](https://npmjs.org/package/leitstand-cli) using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)). Then:

```bash
git clone git@github.com:cron-eu/ciosk.git && cd ciosk
npm install
npm run build
```

## Usage

```bash
// NOTE: you can also store your credentials in config.json and run leistand start OR leistand start --config ~/my-other-config.json
leitstand start \
--twitter-consumer-key <KEY> \
--twitter-consumer-secret <SECRET> \
--twitter-access-token-key <KEY> \
--twitter-access-token-secret <SECRET> \
--slack-bot-token <TOKEN> \
--gitlab-token <TOKEN> \
--jira-username <USERNAME> \
--jira-password <PASSWORD>
```

You can now visit the [default dashboard](http://localhost:9000/dashboards/default)
