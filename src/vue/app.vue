<template lang="pug">
#dashboard
  .row.h25
    .col.s2
      .box.valign-wrapper
        img.responsive-img.valign(src='../img/cron-logo-cmyk.svg')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 JIRA Issues
          p
            countup.countup(v-bind:value='openJIRAIssues')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 GitLab Issues
          p
            countup.countup(v-bind:value='openGitLabIssues')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 GitLab Merge Requests
          p
            countup.countup(v-bind:value='openGitLabMergeRequests')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 GitHub Issues
          p
            countup.countup(v-bind:value='openGitHubIssues')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 GitHub Pull Requests
          p
            countup.countup(v-bind:value='openGitHubPullRequests')
  .row.h25
    .col.s3
      .box.valign-wrapper
        .valign.center-align
          forecast.forecast(v-bind:forecast='forecast')
    .col.s6
      .box.valign-wrapper
        .valign.center-align
          transition(mode='out-in', enter-active-class='animated wobble', leave-active-class='animated zoomOut')
            .welcome(v-html='welcome', v-bind:key='welcome')
    .col.s3
      .box.valign-wrapper
        .valign.center-align
          transition(mode='out-in', enter-active-class='animated wobble', leave-active-class='animated zoomOut')
            mopidy(v-bind:mopidy='mopidy')
  .row.h50
    .col.s4
      .box.valign-wrapper
        .valign
          h2.center-align GitHub Events
          feed(v-bind:items='gitHubFeed')
    .col.s4
      .box.valign-wrapper
        .valign
          h2.center-align Twitter
          feed(v-bind:items='twitterFeed')
    .col.s4
      .box.valign-wrapper
        .valign
          h2.center-align GitLab Events
          feed(v-bind:items='gitLabFeed')
</template>

<script>
module.exports = {
  data: function () {
    return {
      widgets: window.widgets
    }
  },
  components: {
    countup: require('./countup.vue'),
    forecast: require('./forecast.vue'),
    mopidy: require('./mopidy.vue'),
    feed: require('./feed.vue')
  },
  computed: {
    openJIRAIssues: function() {
      return this.widgets['open-jira-issues'].count || 0;
    },
    openGitLabIssues: function() {
      return this.widgets['gitlab-projects'] && this.widgets['gitlab-projects'].projects && Object.keys(this.widgets['gitlab-projects'].projects).reduce(function(obj, id) {
        return obj + (this.widgets['gitlab-projects'].projects[id].open_issues || 0);
      }, 0) || 0;
    },
    openGitLabMergeRequests: function() {
      return this.widgets['gitlab-projects'] && this.widgets['gitlab-projects'].projects && Object.keys(this.widgets['gitlab-projects'].projects).reduce(function(obj, id) {
        return obj + (this.widgets['gitlab-projects'].projects[id].open_merge_requests || 0);
      }, 0) || 0;
    },
    openGitHubIssues: function() {
      return this.widgets['open-github-issues'].count || 0;
    },
    openGitHubPullRequests: function() {
      return this.widgets['github-repos'] && this.widgets['github-repos'].repos && Object.keys(this.widgets['github-repos'].repos).reduce(function(obj, id) {
        return obj + (this.widgets['github-repos'].repos[id].open_pull_requests || 0);
      }, 0) || 0;
    },
    gitHubFeed: function() {
      return this.widgets['github-feed'] && this.widgets['github-feed'].entries || [];
    },
    twitterFeed: function() {
      return this.widgets['twitter-feed'] && this.widgets['twitter-feed'].entries || [];
    },
    gitLabFeed: function() {
      return this.widgets['gitlab-feed'] && this.widgets['gitlab-feed'].entries || [];
    },
    forecast: function() {
      return this.widgets['forecast'].forecast;
    },
    welcome: function() {
      return this.widgets['slack'].welcome;
    },
    twitterQuery: function() {
      return this.widgets['slack'].twitter;
    },
    mopidy: function() {
      return this.widgets['mopidy'];
    }
  }
}
</script>
