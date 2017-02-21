<template lang="pug">
#dashboard
  .row
    .col.col-xs-12.col-md-2
      .box.valign-wrapper
        img.valign(src='../img/cron-logo-cmyk.svg')
    .col.col-xs-12.col-md-2
      .box.valign-wrapper
        .valign.center-align
          h2 Open JIRA Issues
          p
            countup.countup.orange-text(v-bind:value='widgets["open-jira-issues"].count')
    .col.col-xs-12.col-md-2
      .box.valign-wrapper
        .valign.center-align
          h2 Open GitLab Issues
          p
            countup.countup.orange-text(v-bind:value='openGitLabIssues')
    .col.col-xs-12.col-md-2
      .box.valign-wrapper
        .valign.center-align
          h2 Open GitLab Merge Requests
          p
            countup.countup.orange-text(v-bind:value='openGitLabMergeRequests')
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
    openGitLabIssues: function() {
      if (!this.widgets['gitlab-projects']) {
        return 0;
      }

      var result = 0;
      Object.keys(this.widgets['gitlab-projects'].projects).forEach(function(id) {
        var project = this.widgets['gitlab-projects'].projects[id];
        result += project.open_issues ? project.open_issues.length : 0;
      }, this);
      return result;
    },
    openGitLabMergeRequests: function() {
      if (!this.widgets['gitlab-projects']) {
        return 0;
      }

      var result = 0;
      Object.keys(this.widgets['gitlab-projects'].projects).forEach(function(id) {
        var project = this.widgets['gitlab-projects'].projects[id];
        result += project.open_merge_requests ? project.open_merge_requests.length : 0;
      }, this);
      return result;
    }
  }
}
</script>
