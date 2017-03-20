function secondsToReadableTime(seconds) {
  var date = new Date(null);
  date.setSeconds(seconds); // specify value for SECONDS here
  var result = date.toISOString().substr(11, 8).split(':');
  return result[0] + 'h ' + result[1] + 'min ' + result[2] + 's';
}

function secondsToHours(seconds) {
  return _.round(seconds / 3600, 1);
}

function time_hhmmss_to_seconds(hhmmss) {
  // your input string
  var a = hhmmss.split(':'); // split it at the colons
  // minutes are worth 60 seconds. Hours are worth 60 minutes.
  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return seconds;
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
    'title',
    'subtitle'
  ],

  template: '<div>' +
  '<h3 class="graph-title">{{title}}</h3>' +
  '<h4 class="graph-subtitle">{{subtitle}}</h4>' +
  '<canvas id="chartId" width="400" height="300"></canvas>' +
  '</div>',

  mounted: function () {

    // un getDocumentById ne fonctionnerait pas ici (je le sais, j'ai essayé)
    var ctx = this.$el.children.chartId;

    var self = this;
    axios.get(this.api).then(function (response) {

      var labels = [];
      var dataset1 = {
        label:"Temps de parole du candidat et de ses soutiens",
        data:[],
        backgroundColor:"#5472AE"
      };
      var dataset2 = {
        label:"Temps d'antenne SANS paroles du candidat ou de ses soutiens",
        data:[],
        backgroundColor:'#77B5FE'
      };

      for (var candidatName in response.data) {

        labels.push(candidatName);

        var total_paroles = response.data[candidatName].total_temps_de_parole.secondes;
        var total_antenne = response.data[candidatName].total_temps_antenne.secondes;

        // le dataset1 sera le temps de parole (du candidat ET de ses soutiens)
        dataset1.data.push(total_paroles);

        // le dataset2 sera le temps d'antenne mois le temps de parole.
        // Ce sont les séquences d'antenne sans parole du candidat ou de ses soutiens
        var total_antenne_sans_parole = total_antenne - total_paroles;
        if (total_antenne_sans_parole < 0) {
          console.log(self.title + " : " + candidatName + "temps d'antenne inférieur au temps de parole détecté : " + total_antenne_sans_parole);
          total_antenne_sans_parole = 0;
        }
        dataset2.data.push(total_antenne_sans_parole);

      }

      new Chart(ctx, {
        type: 'horizontalBar',
        responsive:true,
        data: {
          labels: labels,
          datasets: [dataset1, dataset2]
        },
        options: {
          legend:{
            display:true,
            position:"top"
          },
          scales: {
            xAxes: [{
              stacked: true,
              ticks: {
                // Create scientific notation labels
                callback: function(value, index, values) {
                  return secondsToHours(value) + ' h';
                }
              }
            }],
            yAxes: [{
              stacked: true
            }]
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem) {
                return secondsToHours(tooltipItem.xLabel) + ' heures';
              }
            }
          }

        }
      });
    })

  }

});

/**
 * Afficher l'ensemble des graphiques hebdomadaires automatiquement
 */
Vue.component('chartjs-bar-hebdos', {

  data: function() {
    return {
      periodes:[]
    }
  },

  template: '<div>' +
  ' <div v-for="periode in periodes">' +
  ' <!--<a :href="periode.api">JSON source</a>-->' +
  ' <chartjs-bar' +
  ' chart-id="chaines-generalistes"' +
  ' :api="periode.api"' +
  ' :title="periode.text">' +
  ' </chartjs-bar>' +
  ' </div>' +
  ' </div>',

  created: function () {
    var self = this;
    axios.get("/api/v1/releves-hebdomadaires-metadonnees.json").then(function (response) {
      self.periodes = response.data.periodes;
      var periodesArray = [];
      for (periode in self.periodes) {
        periodesArray.push(self.periodes[periode]);
      }
      self.periodes = periodesArray.reverse();
      for (periode in self.periodes) {
        self.periodes[periode].text = "Temps d'antenne des candidats à la présidentielle 2017 - du " + self.periodes[periode].text;
        self.periodes[periode].api = "/api/v1/" + self.periodes[periode].folder + "/releves-par-candidats.json";
      };
    });
  }

});

/**
 * bar charjs
 */
Vue.component('chartjs-bar-par-chaine', {

  props:[
    'chartId',
    'api',
    'title',
    'subtitle'
  ],

  template: '<div>' +
  '<h3 class="graph-title">{{title}}</h3>' +
  '<h4 class="graph-subtitle">{{subtitle}}</h4>' +
  '<canvas id="chartId" width="400" height="300"></canvas>' +
  '</div>',

  mounted: function () {

    // un getDocumentById ne fonctionnerait pas ici (je le sais, j'ai essayé)
    var ctx = this.$el.children.chartId;

    axios.get(this.api).then(function (response) {

      // on créer d'abord la liste total des candidats en inspectant
      // toutes les chaines; pour pouvoir créer ensuite des datasets
      // dont les index correspondent bien au même candidat.
      var candidatNames = [];
      var chaines = response.data;
      for (var chaineName in chaines) {
        for (var candidatName in chaines[chaineName]) {
          if(!_.includes(candidatNames, candidatName)) {
            candidatNames.push(candidatName);
          }
        }
      }

      // construction des statisques par candidat pour chaque chaine
      var datasets = [];
      for (var chaineName in chaines) {

        var dataset = {label:chaineName, data:[], backgroundColor:[]};
        dataset.hidden = chaineName == 'TF1' ? dataset.hidden = false : true;
        var color = Math.random().toString(16).slice(2, 8).toUpperCase();

        for (index in candidatNames) {

          if (undefined !== chaines[chaineName][candidatNames[index]]) {
            var candidatDatas = chaines[chaineName][candidatNames[index]];
            dataset.data.push(time_hhmmss_to_seconds(candidatDatas["Total Temps d'antenne"]));
          }
          else {
            dataset.data.push(0);
          }
          dataset.backgroundColor.push('#' + color);

        }
        datasets.push(dataset);

      }

      new Chart(ctx, {
        type: 'horizontalBar',
        responsive:true,
        data: {
          labels:candidatNames,
          datasets:datasets
        },
        options: {
          legend:{
            display:true
          },
          scales: {
            xAxes: [{
              ticks: {
                // Create scientific notation labels
                callback: function(value, index, values) {
                  return secondsToHours(value);
                }
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem) {
                return _.round(tooltipItem.xLabel / 60, 2) + ' minutes';
              }
            }
          }
        }
      });

    })

  }

});

/**
 * Vue compilera ses composants à l'intérieur de ces zones
 */
new Vue({
  el: '.vueApp'
});
