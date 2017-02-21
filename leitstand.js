var fs = require('fs');
var path = require('path');
var yargs = require('yargs');
var express = require('express');

module.exports = function(leitstand) {

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
    .plugin('jira', {
      settings: {
        host: 'cron-eu.atlassian.net',
        basic_auth: {
          username: opts['jira-username'],
          password: opts['jira-password']
        }
      }
    })
    .plugin('gitlab', {
      settings: {
        api: 'https://gitlab.cron.eu/api/v3',
        privateToken: opts['gitlab-token']
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
    .plugin('faker', {
      settings: {
        locale: 'de'
      }
    })
    .widget('gitlab-projects', {
      plugin: 'gitlab',
      methods: {
        name: 'projects.list',
        opts: {
          per_page: 1000,
          simple: true
        },
        key: 'projects',
        schedule: '0 * * * *',
        // this is necessary because the GitLab API does not provide an endpoint for fetching all issues / merge_requests globally
        // those resources can only be requested per project
        // see: https://docs.gitlab.com/ee/api/README.html
        filter: function(values) {
          var projects = this.widget.get().projects;

          const holder = values.reduce(function(obj, project) {
            obj[project.id] = project;
            return obj;
          }, {});

          if (projects && Object.keys(projects).length !== values.length) {
            var methods = [Object.assign(this.instance, {immediately: false})];

            values.forEach(function(project) {
              methods = methods.concat([
                {
                  name: 'issues.list',
                  key: 'projects.' + project.id + '.open_issues'
                },
                {
                  name: 'merge_requests.list',
                  key: 'projects.' + project.id + '.open_merge_requests'
                },
              ].map(function(method) {
                return Object.assign(method, {
                  opts: {
                    id: project.id,
                    per_page: 1000,
                    state: 'opened'
                  },
                  schedule: '*/10 * * * *'
                });
              }));
            });

            this.widget.methods = methods;
            this.widget.work();
          }

          return holder;
        }
      }
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
          count: values.total
        };
      }
    })
    .widget('request-demo', {
      plugin: 'request',
      methods: {
        name: 'head',
        opts: 'http://cron.eu'
      },
      filter: function(values) {
        return true;
      }
    })
    .widget('twitter-demo', {
      methods: [{
        plugin: 'twitter',
        name: 'get',
        opts: ['statuses/user_timeline', {
          screen_name: 'cron_eu'
        }]
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
    .widget('github-events', {
      plugin: 'github',
      schedule: '*/10 * * * *',
      settings: {
        authenticate: {
          type: 'token',
          token: opts['github-token']
        }
      },
      methods: [{
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
        }
      ]
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

  leitstand.app.use(express.static('dist'));
};
