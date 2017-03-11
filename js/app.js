function secondsToReadableTime(seconds) {
  var date = new Date(null);
  date.setSeconds(seconds); // specify value for SECONDS here
  var result = date.toISOString().substr(11, 8).split(':');
  return result[0] + 'h ' + result[1] + 'min ' + result[2] + 's';
}

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
 * bar charjs
 */
Vue.component('chartjs-bar', {

  props:[
    'chartId',
    'api',
    'title'
  ],

  template: '<div>' +
  '<h3 class="graph-title">{{title}}</h3>' +
  '<canvas id="chartId" width="400" height="300"></canvas>' +
  '</div>',

  mounted: function () {
    // un getDocumentById ne fonctionnerait pas ici (je le sais, j'ai essayé)
    var ctx = this.$el.children.chartId;
    axios.get(this.api).then(function (response) {
      var labels = [];
      var data = [];
      var backgroundColor = [];
      for (var key in response.data) {
        data.push(response.data[key].total_temps_antenne.secondes);
        labels.push(key);
        backgroundColor.push('#' + Math.random().toString(16).slice(2, 8).toUpperCase());
      }

      new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1
          }]
        },
        options: {
          legend:{
            display:false
          },
          scales: {
            xAxes: [{
              ticks: {
                // Create scientific notation labels
                callback: function(value, index, values) {
                  return secondsToReadableTime(value);
                }
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem) {
                return secondsToReadableTime(tooltipItem.xLabel);
              }
            }
          }
        }
      });
    })

  }

});

/**
 * Vue compilera ses composants à l'intérieur de ces zoines
 */
new Vue({
  el: '.vueApp'
});
