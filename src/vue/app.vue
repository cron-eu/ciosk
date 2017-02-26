<template lang="pug">
#dashboard
  .row.h25
    .col.s2
      .box.valign-wrapper
        img.valign(src='../img/cron-logo-cmyk.svg')
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
            .message(v-html='welcome', v-bind:key='welcome')
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
    forecast: require('./forecast.vue')
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
    forecast: function() {
      return this.widgets['forecast'].forecast;
    },
    welcome: function() {
      return this.widgets['slack'].welcome;
    }
  }
}
</script>
