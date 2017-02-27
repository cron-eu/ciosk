var fs = require('fs')
var path = require('path')
var yargs = require('yargs')
var express = require('express')
var md = require('markdown-it')()
var emoji = require('markdown-it-emoji')
var parseString = require('xml2js').parseString
var SwaggerAuth = require('swagger-client').ApiKeyAuthorization

md.use(emoji)

module.exports = function (leitstand) {
  var opts = yargs
    .default('config', './config.json')
    .argv

  var config = path.resolve(opts.config)

  if (fs.existsSync(config)) {
    leitstand.logger.info('Loading config from "%s"', config)
    config = require(config)
    opts = Object.assign(config, opts)
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
    .plugin('github', {
      settings: {
        auth: {
          type: 'token',
          token: opts['github-token']
        }
      }
    })
    .plugin('forecast', {
      settings: {
        service: 'darksky',
        key: opts['darksky-key'],
        units: 'celcius',
        lang: 'en'
      }
    })
    .plugin('slack', {
      settings: {
        botToken: opts['slack-bot-token']
      }
    })
    .plugin('mopidy', {
      settings: {
        webSocketUrl: opts['mopidy-url'] || 'ws://localhost:6680/mopidy/ws/'
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
    .widget('open-jira-issues', {
      methods: {
        name: 'search.search',
        plugin: 'jira',
        opts: {
          jql: 'status in (Open, "In Progress")',
          maxResults: 0
        }
      },
      filter: function (values) {
        return {
          count: values.total
        }
      }
    })
    .widget('gitlab-projects', {
      plugin: 'swagger',
      settings: {
        spec: require('./swagger/gitlab.json'),
        usePromise: true,
        authorizations: {
          privateTokenHeader: new SwaggerAuth('PRIVATE-TOKEN', opts['gitlab-token'], 'header')
        }
      },
      methods: {
        name: 'projects.listProjects',
        key: 'projects',
        opts: {
          per_page: 1000
        },
        schedule: '0 * * * *',
        // this is necessary because the GitLab API does not provide an endpoint for fetching all issues / merge_requests globally
        // those resources can only be requested per project
        // see: https://docs.gitlab.com/ee/api/README.html
        filter: function (values) {
          var projects = this.widget.get().projects

          const holder = values.obj.reduce(function (obj, project) {
            obj[project.path_with_namespace] = projects && projects[project.path_with_namespace] || {id: project.id}
            return obj
          }, {})

          if (!projects || Object.keys(projects).length !== values.obj.length) {
            var methods = [Object.assign(this.instance, {immediately: false})]

            values.obj.forEach(function (project) {
              methods = methods.concat([
                {
                  name: 'projects.listIssues',
                  key: 'projects.' + project.path_with_namespace + '.open_issues'
                },
                {
                  name: 'projects.listMergeRequests',
                  key: 'projects.' + project.path_with_namespace + '.open_merge_requests'
                }
              ].map(function (method) {
                return Object.assign(method, {
                  opts: {
                    id: project.id,
                    state: 'opened'
                  },
                  schedule: '*/10 * * * *',
                  filter: function (values) {
                    return values && parseInt(values.headers['x-total']) || 0
                  }
                })
              }))
            })

            this.widget.methods = methods
            this.widget.work()
          }

          return holder
        }
      }
    })
    .widget('open-github-issues', {
      plugin: 'github',
      methods: {
        name: 'issues.getForOrg',
        opts: {
          org: 'cron-eu',
          per_page: 1000
        },
        key: 'count',
        schedule: '*/10 * * * *',
        filter: function (values) {
          return values.data.length || 0
        }
      }
    })
    .widget('github-repos', {
      plugin: 'github',
      methods: {
        name: 'orgs.getTeamRepos',
        opts: {
          org: 'cron-eu',
          // cron-dev
          id: '1247039',
          per_page: 1000
        },
        key: 'repos',
        schedule: '0 * * * *',
        filter: function (values) {
          var repos = this.widget.get().repos

          const holder = values.data.reduce(function (obj, repo) {
            obj[repo.full_name] = repos && repos[repo.full_name] || {id: repo.id}
            return obj
          }, {})

          if (!repos || Object.keys(repos).length !== values.data.length) {
            var methods = [Object.assign(this.instance, {immediately: false})]

            values.data.forEach(function (repo) {
              methods = methods.concat([
                {
                  name: 'pullRequests.getAll',
                  key: 'repos.' + repo.full_name + '.open_pull_requests'
                }
              ].map(function (method) {
                return Object.assign(method, {
                  opts: {
                    owner: repo.owner.login,
                    repo: repo.name,
                    per_page: 1000,
                    state: 'open'
                  },
                  schedule: '*/10 * * * *',
                  filter: function (values) {
                    return values && values.data.length || 0
                  }
                })
              }))
            })

            this.widget.methods = methods
            this.widget.work()
          }

          return holder
        }
      }
    })
    .widget('github-feed', {
      plugin: 'request',
      methods: {
        name: 'get',
        opts: {
          uri: 'https://github.com/organizations/cron-eu/100hz.private.atom',
          qs: {
            token: opts['github-feed-token']
          }
        },
        callback: function (error, response, body) {
          if (error) {
            return
          }

          parseString(body, function (err, result) {
            if (err) {
              this.logger.warn('Could not convert GitHub feed to JSON')
            }

            var entries = result.feed.entry.slice(0, 3).map(function(entry) {
              return {
                author: entry.author[0].name[0],
                avatar: entry['media:thumbnail'][0]['$'].url + '0',
                title: entry.title[0]._,
                time: entry.updated[0]
              }
            })

            this.widget.set(entries, 'entries')
          }.bind(this))
        }
      }
    })
    .widget('forecast', {
      plugin: 'forecast',
      methods: {
        name: 'get',
        opts: [
          // Stuttgart, Paulinenstraße 21, see: http://www.latlong.net/
          [48.771371, 9.172061]
        ],
        key: 'forecast',
        schedule: '*/10 * * * *',
        filter: function (values) {
          var base = {
            location: 'Stuttgart, Paulinenstraße 21'
          }

          if (!values) {
            return base
          }

          return Object.assign(base, values.currently, {
            day: {
              summary: values.hourly.summary,
              icon: values.hourly.icon
            },
            week: {
              summary: values.daily.summary,
              icon: values.daily.icon
            }
          })
        }
      }
    })
    .widget('slack', {
      values: {
        welcome: 'Post a message like "<strong>@leitstand:welcome</strong> **Hello World**" (Markdown filtered)'
      },
      plugin: 'slack',
      events: [
        {
          // see https://github.com/slackapi/node-slack-sdk/blob/master/lib/clients/events/rtm.js
          name: 'message',
          filter: function (message) {
            var matches
            if (!message.text || !(matches = /@leitstand:(welcome|twitter)(.*)/g.exec(message.text))) {
              return this.widget.get()
            }

            matches[2] = matches[2].trim()

            if (matches[1] === 'welcome') {
              matches[2] = md.render(matches[2])
            } else if (matches[1] === 'twitter') {
              var methods = leitstand.widgets['twitter'].methods
              var search = methods[0].instance
              search.opts[1].q = matches[2]
              leitstand.widgets['twitter'].methods = search
              leitstand.widgets['twitter'].work()
            }

            var result = {}
            result[matches[1]] = matches[2]
            return result
          }
        }
      ]
    })
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
          key: 'track',
          filter: function (tlTrack) {
            return tlTrack && tlTrack.track
          }
        },
        {
          name: 'playback.getState',
          key: 'state'
        }
      ],
      events: [
        {
          name: 'event:volumeChanged',
          key: 'volume',
          filter: function (event) {
            return event.volume
          }
        },
        {
          name: 'event:trackPlaybackStarted',
          key: 'track',
          filter: function (event) {
            return event.tl_track && event.tl_track.track
          }
        },
        {
          name: 'event:playbackStateChanged',
          key: 'state',
          filter: function (event) {
            return event.new_state
          }
        }
      ]
    })
    .widget('twitter-feed', {
      methods: {
        plugin: 'twitter',
        name: 'get',
        opts: [
          'search/tweets',
          {
            q: 'from:heisedc',
            count: 3
          }
        ]
      },
      callback: function (error, response) {
        if (error) {
          return
        }

        var entries = response.statuses.slice(0, 3).map(function(entry) {
          return {
            author: entry.user.screen_name,
            avatar: entry.user.profile_image_url,
            title: entry.text,
            time: entry.created_at
          }
        })

        this.widget.set(entries, 'entries')
      }
    })
    .widget('gitlab-feed', {
      plugin: 'request',
      methods: {
        name: 'get',
        opts: {
          uri: 'https://gitlab.cron.eu/dashboard/projects.atom',
          qs: {
            private_token: opts['gitlab-feed-token']
          }
        },
        callback: function (error, response, body) {
          if (error) {
            return
          }

          parseString(body, function (err, result) {
            if (err) {
              this.logger.warn('Could not convert GitLab feed to JSON')
            }

            var entries = result.feed.entry.slice(0, 3).map(function(entry) {
              return {
                author: entry.author[0].name[0],
                avatar: entry['media:thumbnail'][0]['$'].url,
                title: entry.title[0],
                time: entry.updated[0]
              }
            })

            this.widget.set(entries, 'entries')
          }.bind(this))
        }
      }
    })
    .dashboard('default', {
      widgets: '.*'
    })

  leitstand.app.use(express.static('dist'))
}
