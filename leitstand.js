var fs = require('fs');
var path = require('path');
var yargs = require('yargs');

module.exports = function (leitstand) {

  var opts = yargs
              .default('config', './config.json')
              .argv;

  var config = path.resolve(opts.config);

  if (fs.existsSync(config)) {
    leitstand.logger.info('Loading config from "%s"', config);
    config = require(config);
    opts = Object.assign(config, opts);
  }

  leitstand
    .plugin('socket.io', {
      settings: {
        uri: 'http://localhost:9000/leitstand',
        opts: {
          query: 'dashboard=default'
        }
      }
    })
    .plugin('twitter', {
      settings: {
        consumer_key: opts['twitter-consumer-key'],
        consumer_secret: opts['twitter-consumer-secret'],
        access_token_key: opts['twitter-access-token-key'],
        access_token_secret: opts['twitter-access-token-secret']
      }
    })
    .plugin('slack', {
      settings: {
        botToken: opts['slack-bot-token']
      }
    })
    .plugin('mopidy', {
      settings: {
        webSocketUrl: 'ws://192.168.36.217:6680/mopidy/ws/'
      }
    })
    .plugin('gitlab', {
      settings: {
        api: 'https://gitlab.cron.eu/api/v3',
        privateToken: opts['gitlab-token']
      }
    })
    .plugin('jira', {
      settings: {
        host: 'cron-eu.atlassian.net',
        basic_auth: {
          username: opts['jira-username'],
          password: opts['jira-password']
        }
      }
    })
    .plugin('faker', {
      settings: {
        locale: 'de'
      }
    })
    .widget('request-demo', {
      plugin: 'request',
      methods: {
        name: 'head',
        opts: 'http://cron.eu'
      },
      filter: function (values) {
        return values;
      }
    })
    .widget('twitter-demo', {
      methods: [
      {
        plugin: 'twitter',
        name: 'get',
        opts: ['statuses/user_timeline', {screen_name: 'cron_eu'}]
      }]
    })
    .widget('slack-demo', {
      // see https://github.com/slackapi/node-slack-sdk/blob/master/lib/clients/events/rtm.js
      plugin: 'slack',
      events: 'message'
    })
    /*
    .widget('mopidy', {
      schedule: false,
      plugin: 'mopidy',
      methods: [
      {
        name: 'mixer.getVolume',
        key: 'volume'
      },
      {
        name: 'playback.getCurrentTlTrack',
        key: 'track'
      }],
      events: 'event:volumeChanged'
    })
    */
    .widget('gitlab-projects', {
      plugin: 'gitlab',
      methods: 'projects.list'
    })
    .widget('github-events', {
      plugin: 'github',
      methods: [
      {
        name: 'activity.getEventsForOrg',
        opts: {
          org: 'cron-eu'
        },
        key: 'cron'
      },
      {
        name: 'activity.getEventsForOrg',
        opts: {
          org: 'leitstandjs'
        },
        key: 'leitstand'
      }]
    })
    .widget('open-jira-issues', {
      methods: {
        name: 'search.search',
        plugin: 'jira',
        opts: {
          jql: 'status in (Open, "In Progress")',
          maxResults: 0
        }
      },
      filter: function(values) {
        return {
          open: values.total
        };
      }
    })
    .widget('faker-widget', {
      schedule: false,
      methods: {
        name: 'fake',
        plugin: 'faker',
        opts: {
          name: '{{name.lastName}}, {{name.firstName}} {{name.suffix}}',
          company: '{{company.companyName}}, {{address.country}}',
          motto: '{{hacker.phrase}}'
        }
      }
    })
    .dashboard('default', {
      widgets: '.*'
    });
};
