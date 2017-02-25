<template lang="pug">
#dashboard
  .row.h25
    .col.s2
      .box.valign-wrapper
        img.valign(src='../img/cron-logo-cmyk.svg')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 Open JIRA Issues
          p
            countup.countup(v-bind:value='openJIRAIssues')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 Open GitLab Issues
          p
            countup.countup(v-bind:value='openGitLabIssues')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 Open GitLab Merge Requests
          p
            countup.countup(v-bind:value='openGitLabMergeRequests')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 Open GitHub Issues
          p
            countup.countup(v-bind:value='openGitHubIssues')
    .col.s2
      .box.valign-wrapper
        .valign.center-align
          h2 Open GitHub Pull Requests
          p
            countup.countup(v-bind:value='openGitHubPullRequests')
</template>

<script>
module.exports = {
  data: function () {
    return {
      widgets: window.widgets
    }
  },
  components: {
    countup: require('./countup.vue')
  },
  computed: {
    openJIRAIssues: function() {
      return widgets["open-jira-issues"].count || 0;
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
      return widgets["open-github-issues"].count || 0;
    },
    openGitHubPullRequests: function() {
      return this.widgets['github-repos'] && this.widgets['github-repos'].repos && Object.keys(this.widgets['github-repos'].repos).reduce(function(obj, id) {
        return obj + (this.widgets['github-repos'].repos[id].open_pull_requests || 0);
      }, 0) || 0;
    }
  }
}
</script>
