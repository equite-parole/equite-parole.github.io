/**
 *
 */
Vue.component('d3-pie-chart', {
  props:['api', 'title'],
  template: '<div id="cumulGlobalPieChart"></div>',
  mounted: function () {

    var self = this;
    axios.get(this.api).then(function (response) {
      var content = [];
      var datas = response.data;
      for (var key in datas) {
        content.push({
          "label": key,
          "value": datas[key].total_temps_antenne.secondes,
          "color": '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
        });
      }
      var data = {
        "sortOrder": "value-desc",
        "content": content
      };

      new d3pie("cumulGlobalPieChart", {
        "header": {
          "title": {
            "text": self.title,
            "fontSize": 24,
            "font": "open sans"
          },
          "subtitle": {
            "text": "",
            "color": "#999999",
            "fontSize": 18,
            "font": "open sans"
          },
          "titleSubtitlePadding": 9
        },
        "footer": {
          "color": "#999999",
          "fontSize": 10,
          "font": "open sans",
          "location": "bottom-left"
        },
        "size": {
          "canvasWidth":900,
          "pieOuterRadius": "90%"
        },
        "data": data,
        "labels": {
          "outer": {
            "pieDistance": 32
          },
          "inner": {
            "hideWhenLessThanPercentage": 3
          },
          "mainLabel": {
            "fontSize": 11
          },
          "percentage": {
            "color": "#ffffff",
            "decimalPlaces": 0
          },
          "value": {
            "color": "#adadad",
            "fontSize": 11
          },
          "lines": {
            "enabled": true
          },
          "truncation": {
            "enabled": true
          }
        },
        "effects": {
          "pullOutSegmentOnClick": {
            "effect": "linear",
            "speed": 400,
            "size": 8
          }
        },
        "misc": {
          "gradient": {
            "enabled": true,
            "percentage": 100
          }
        }
      });

    })
  }
});

/**
 * Bootstrap Vue
 */
new Vue({
  el: '#vueApp'
});
