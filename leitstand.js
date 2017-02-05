module.exports = function (leitstand) {
  leitstand
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
