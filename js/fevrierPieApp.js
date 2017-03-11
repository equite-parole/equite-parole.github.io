
var app = angular.module('fevrierPieApp', []);

app.controller('fevrierPieAppController', ['$scope', '$http', function($scope, $http) {

  $http.get("https://equite-parole.github.io/api/v1/2017-02-01--2017-02-26/chaines-generalistes.json").then(function(result) {

    //console.log(result);

    var content = [];
    angular.forEach(result.data, function(value, key) {
      content.push({
        "label": key,
        "value": value.total_temps_antenne.secondes,
        "color": "#2484c1"
      });
    });

    var data = {
      "sortOrder": "value-desc",
      "content": content
    };

    var pie = new d3pie("pieChart", {
      "header": {
        "title": {
          "text": "Temps d'antenne sur les chaînes généralistes du 1er Février 2017 au 26 Février 2017",
          "fontSize": 24,
          "font": "open sans"
        },
        "subtitle": {
          "text": "TF1, France 2, France 3, Canal +, France 5, M6, C8, France 4, France Ô, RMC Découverte",
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

  });


}]);
