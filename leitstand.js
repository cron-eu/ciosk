module.exports = function (leitstand) {

  var argv = require('yargs').argv;

  leitstand
    .plugin('mopidy', {
      settings: {
        webSocketUrl: 'ws://192.168.36.217:6680/mopidy/ws/'
      }
    })
    .widget('mopidy-volume', {plugin: 'mopidy', event: 'event:volumeChanged'})
    .widget('mopidy-current-track', {plugin: 'mopidy', method: 'playback.getCurrentTlTrack'})
    .plugin('gitlab', {
      settings: {
        api: 'https://gitlab.cron.eu/api/v3',
        privateToken: argv['gitlab-token']
      }
    })
    .widget('gitlab-projects', {plugin: 'gitlab', event: 'projects.list'})
    .widget('github-events', {plugin: 'github', method: 'activity.getEventsForOrg', opts: {org: 'cron-eu'}})
    .plugin('jira', {
      settings: {
        host: 'cron-eu.atlassian.net',
        basic_auth: {
          username: argv['jira-username'],
          password: argv['jira-password']
        }
      }
    })
    .widget('open-jira-issues', {
      plugin: 'jira',
      method: 'search.search',
      opts: {
        jql: 'status in (Open, "In Progress")',
        maxResults: 0
      },
      filter: function(values) {
        return {
          open: values.total
        };
      }
    })
    .plugin('faker', {
      settings: {
        locale: 'de'
      }
    })
    .widget('faker-widget', {
      plugin: 'faker',
      spec: false,
      method: 'fake',
      opts: {
        name: '{{name.lastName}}, {{name.firstName}} {{name.suffix}}',
        company: '{{company.companyName}}, {{address.country}}',
        motto: '{{hacker.phrase}}'
      }
    })
    .plugin('demo', {
      spec: {
        second: [
          Math.floor((Math.random() * 60)),
          Math.floor((Math.random() * 60))
        ].filter(function(el, i, a){
          return i == a.indexOf(el);
        }).sort(function(a, b) {
          return a - b;
        })
      },
      api: function (settings, callback) {
        callback({
          random: function() {
            return Math.floor((Math.random() * 100) + 1);
          }
        });
      }
    })
    .widget('demo-widget', {plugin: 'demo', method: 'random'})
    .dashboard('default', {widgets: '.*'});
};
