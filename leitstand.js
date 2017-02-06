module.exports = function (leitstand) {

  var argv = require('yargs').argv;

  leitstand
    .plugin('jira', {
      jira: {
        host: 'cron-eu.atlassian.net',
        basic_auth: {
          username: argv['jira-username'],
          password: argv['jira-password']
        }
      }
    }, function () {
      leitstand.widget('open-jira-issues',
        this.widget('search', 'search', {
          jql: 'status in (Open, "In Progress")',
          maxResults: 0
        }), function() {
          this.filter = function(values) {
            return {
              open: values.total
            };
          };
        });
    })
    .plugin('demo', {
      widget: function () {
        return {
          put: false,
          spec: {
            second: [
              Math.floor((Math.random() * 60)),
              Math.floor((Math.random() * 60)),
              Math.floor((Math.random() * 60)),
              Math.floor((Math.random() * 60)),
              Math.floor((Math.random() * 60)),
              Math.floor((Math.random() * 60)),
              Math.floor((Math.random() * 60))
            ].filter(function(el, i, a){
              return i == a.indexOf(el);
            }).sort(function(a, b) {
              return a - b;
            })
          },
          job: function () {
            this.set({
              value: Math.floor((Math.random() * 100) + 1)
            });
          }
        };
      }
    }, function () {
      for (i = 0; i < 11; i++) {
        leitstand.widget(i + 1, this.widget());
      }
    })
    .dashboard('default', function () {
      // /dashboards/default
      this.add('.*');
    });
};
