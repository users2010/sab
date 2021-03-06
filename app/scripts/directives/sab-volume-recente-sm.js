(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabVolumeRecenteSm', sabVolumeRecenteSm);

    sabVolumeRecenteSm.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabVolumeRecenteSm($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          monitoramento: '=',
          previsoes: '=',
          data: '=',
          capacidade: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3;

            // Set the dimensions of the canvas / graph
            var margin = {top: 30, right: 30, bottom: 60, left: 40},
                width = 400 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            // Parse the date / time
            var localized = d3.locale({
              "decimal": ",",
              "thousands": ".",
              "grouping": [3],
              "currency": ["R$", ""],
              "dateTime": "%d/%m/%Y %H:%M:%S",
              "date": "%d/%m/%Y",
              "time": "%H:%M:%S",
              "periods": ["AM", "PM"],
              "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
              "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
              "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
              "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            });
            var parseDate = d3.time.format("%d/%m/%Y").parse;

            // Set the ranges
            var x1 = d3.time.scale().range([0, width/2]);
            var x2 = d3.time.scale().range([width/2, width]);
            var y = d3.scale.linear().range([height, 0]);
            var x1Axis = d3.svg.axis().scale(x1).orient("bottom").tickFormat(localized.timeFormat("%d %b")).tickSize(5);
            var x2Axis = d3.svg.axis().scale(x2).orient("bottom").tickFormat(localized.timeFormat("%d %b")).tickSize(15);
            var x3Axis = d3.svg.axis().scale(x2).orient("bottom").tickFormat(localized.timeFormat("%d %b")).tickSize(25);
            var yAxis = d3.svg.axis().scale(y).orient("left").ticks(4).tickFormat(function(t) { return t+"%"});

            // Define the line
            var valueline1 = d3.svg.line()
                .interpolate("monotone")
                .x(function(d) { return x1(d.date); })
                .y(function(d) { return y(d.VolumePercentual); });
            var valueline2 = d3.svg.line()
                .interpolate("monotone")
                .x(function(d) { return x2(d.date); })
                .y(function(d) { return y(d.Porcentagem); });
            var valuearea = d3.svg.area()
                .interpolate("monotone")
                .x(function(d) { return x1(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.VolumePercentual); });

            // Adds the svg canvas
            var svgFrame = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%'});

            var svg = svgFrame.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
              gLines = svg.append("g").attr("class", "lines"),
              gAxis = svg.append("g").attr("class", "axis"),
              gTexts = svg.append("g").attr("class", "texts"),
              clipPath = svg.append("clipPath")
                .attr("id", "clip")
                .append("rect")
                  .attr("y", -2)
                  .attr("width", width)
                  .attr("height", (height + 2)),
              curtain = svg.append('rect')
                .attr('x', -1 * width)
                .attr('y', -1 * height)
                .attr('width', width)
                .attr('height', (height + 4))
                .attr('class', 'curtain')
                .attr('transform', 'rotate(180)')
                .style('fill', '#ffffff'),
              gDetails = svg.append("g").attr("class", "details");

            var
              lineSvg = gLines.append("path").attr('clip-path', 'url(#clip)'),
              lineRetirada = gLines.append("path").attr('clip-path', 'url(#clip)'),
              lineOutorga = gLines.append("path").attr('clip-path', 'url(#clip)'),
              lineVolumeMorto = gDetails.append("line"),
              areaSvg = gLines.append("path").attr('clip-path', 'url(#clip)'),
              dayStroke = gDetails.append('line'),
              endCircle = gDetails.append('circle'),
              title1 = gTexts.append('text'),
              title2 = gTexts.append('text'),
              x1AxisSvg = gAxis.append("g")
                .attr("class", "x axis axis-s")
                .attr("transform", "translate(0," + (height + 1) + ")"),
              x2AxisSvg = gAxis.append("g")
                .attr("class", "x axis axis-2")
                .attr("transform", "translate(0," + (height + 1) + ")"),
              x3AxisSvg = gAxis.append("g")
                .attr("class", "x axis axis-3")
                .attr("transform", "translate(0," + (height + 1) + ")"),
              yAxisSvg = gAxis.append("g")
                .attr("class", "y axis"),
              circleRetirada = gDetails.append('circle'),
              circleOutorga = gDetails.append('circle'),
              textPrevisao = gTexts.append('text'),
              xAxisLineSvg = x1AxisSvg.append('line').attr("class", "axis-line"),
              gLegend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(0," + (height+margin.top+5) + ")");
              gLegend.append("text")
                .attr('x', 15).attr('y', 10)
                .attr('font-size', '8px')
                .text("Estimativa com base na retirada de água")
              gLegend.append("text")
                .attr('x', 15).attr('y', 20)
                .attr('font-size', '8px')
                .text("Estimativa com base na outorga");
              gLegend.append("circle")
                .attr('cx', 10).attr('cy', 8).attr('r', 3)
                .style({
                  "fill": "rgb(88, 182, 235)"
                });
              gLegend.append("circle")
                .attr('cx', 10).attr('cy', 18).attr('r', 3)
                .style({
                  "fill": "rgb(67, 107, 224)"
                });
              gLegend.append("line")
                .attr('x1', 0).attr('y1', 8)
                .attr('x2', 10).attr('y2', 8)
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(88, 182, 235)"
                });
              gLegend.append("line")
                .attr('x1', 0).attr('y1', 18)
                .attr('x2', 10).attr('y2', 18)
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(67, 107, 224)"
                });

            scope.$watchCollection(function(scope) { return [scope.monitoramento, scope.previsoes, scope.data, scope.capacidade]; }, function(newValue) {
              if ((typeof newValue[0] !== 'undefined') && (newValue[0].volumes.length !== 0) && (typeof newValue[1] !== 'undefined') && (typeof newValue[2] !== 'undefined')) {
                draw(newValue[0], newValue[1], newValue[2], newValue[3]);
              }
            });

            // Get the data
            var draw = function(monitoramento, previsoes, data, capacidade) {
              // Reset drawing
              lineSvg.attr('display', 'none');
              lineRetirada.attr('display', 'none');
              lineOutorga.attr('display', 'none');
              lineVolumeMorto.attr('display', 'none');
              areaSvg.attr('display', 'none');
              dayStroke.attr('display', 'none');
              endCircle.attr('opacity', '0');
              title1.attr('opacity', '0');
              title2.attr('opacity', '0');
              x1AxisSvg.attr('display', 'none').attr('opacity', 0);
              x2AxisSvg.attr('display', 'none').attr('opacity', 0);
              x3AxisSvg.attr('display', 'none').attr('opacity', 0);
              xAxisLineSvg.attr('display', 'none').attr('opacity', 0);
              yAxisSvg.attr('display', 'none').attr('opacity', 0);
              circleRetirada.attr('opacity', '0');
              circleOutorga.attr('opacity', '0');
              textPrevisao.attr('display', 'none');
              curtain.attr('width', width);
              gDetails.attr('opacity', 0);
              gLegend.attr('opacity', 0);

              var
                volumes = monitoramento.volumes,
                regression = monitoramento.coeficiente_regressao,
                previsaoOutorga = previsoes.outorga,
                previsaoRetirada = previsoes.previsao,
                volumeMorto = +previsoes.volume_morto,
                dataBase = parseDate(data);

              volumes.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.volume = +d.Volume;
              });
              previsaoRetirada.volumes.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.volume = +d.Volume;
              });
              previsaoOutorga.volumes.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.volume = +d.Volume;
              });

              x2.domain([dataBase, d3.time.day.offset(dataBase, 180)]);
              xAxisLineSvg
                .attr("x1", x2(x2.domain()[0]))
                .attr("y", height)
                .attr("x2", x2(x2.domain()[1]));
              y.domain([0, d3.max(volumes, function(d) { return d.VolumePercentual; })]);

              if (volumes.length > 1) {
                x1.domain(d3.extent(volumes, function(d) { return d.date; }));
                x1Axis.tickValues([
                  volumes[0].date,
                  volumes[volumes.length-1].date
                ]);

                lineSvg
                  .style({
                    "fill": "none",
                    "stroke-width": "1",
                    "stroke": color(regression)
                  })
                  .attr("class", "tendencia")
                  .attr("d", valueline1(volumes))
                  .attr('display', 'inline');
                areaSvg
                  .style({
                    "fill-opacity": "0.1",
                    "fill": color(regression)
                  })
                  .attr("d", valuearea(volumes))
                  .attr('display', 'inline');
                lineVolumeMorto
                  .attr('x1', 0)
                  .attr('y1', y(volumeMorto))
                  .attr('x2', width)
                  .attr('y2', y(volumeMorto))
                  .attr('display', 'inline')
                  .style({
                    "stroke": "gray",
                    "stroke-width": "0.5",
                    "stroke-dasharray": "5,2"
                  });

                // Details
                dayStroke
                  .attr('x1', width * 0.5)
                  .attr('y1', 0)
                  .attr('x2', width * 0.5)
                  .attr('y2', height)
                  .attr('display', 'inline')
                  .style({
                    "stroke": "gray",
                    "stroke-width": "1"
                  });
                endCircle
                  .attr('cx', width * 0.5)
                  .attr('cy', y(volumes[volumes.length-1].VolumePercentual))
                  .attr('r', 3)
                  .attr('display', 'inline')
                  .style({
                    "fill": color(regression)
                  });

                // Texts
                title1
                  .attr('x', width * 0.25)
                  .attr('y', -10)
                  .attr('font-size', '8px')
                  .attr('text-anchor', 'middle')
                  .text("Últimos meses");
                title2
                  .attr('x', width * 0.75)
                  .attr('y', -10)
                  .attr('font-size', '8px')
                  .attr('text-anchor', 'middle')
                  .text("Estimativa");

                x1AxisSvg.call(x1Axis).attr('display', null);
                xAxisLineSvg.attr('display', null);
                yAxisSvg.call(yAxis).attr('display', null);
              }

            if (previsaoRetirada.volumes.length) {
                lineRetirada
                  .style({
                    "fill": "none",
                    "stroke-width": "0.8",
                    "stroke": "rgb(88, 182, 235)"
                  })
                  .attr("class", "retirada")
                  .attr('display', 'inline')
                  .attr("d", valueline2(previsaoRetirada.volumes));
                circleRetirada
                  .attr('cx', x2(previsaoRetirada.volumes[previsaoRetirada.volumes.length-1].date))
                  .attr('cy',  y(previsaoRetirada.volumes[previsaoRetirada.volumes.length-1].Porcentagem))
                  .attr('r', 3)
                  .style({
                    "fill": "rgb(88, 182, 235)"
                  });
                  x2Axis.tickValues([previsaoRetirada.volumes[previsaoRetirada.volumes.length-1].date]);
                  x2AxisSvg.call(x2Axis).attr('display', 'inline');
            }

            if (previsaoOutorga.volumes.length) {
              lineOutorga
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(67, 107, 224)"
                })
                .attr("class", "outorga")
                .attr("d", valueline2(previsaoOutorga.volumes))
                .attr('display', 'inline');
              circleOutorga
                .attr('cx', x2(previsaoOutorga.volumes[previsaoOutorga.volumes.length-1].date))
                .attr('cy',  y(previsaoOutorga.volumes[previsaoOutorga.volumes.length-1].Porcentagem))
                .attr('r', 3)
                .attr('display', 'inline')
                .style({
                  "fill": "rgb(67, 107, 224)"
                });
              x3Axis.tickValues([previsaoOutorga.volumes[previsaoOutorga.volumes.length-1].date]);
              x3AxisSvg.call(x3Axis).attr('display', 'inline');
            }

            if (!(previsaoRetirada.volumes.length || previsaoOutorga.volumes.length)) {
                textPrevisao
                  .attr('x', width * 0.75)
                  .attr('y', height * 0.5)
                  .attr('font-size', '8px')
                  .attr('text-anchor', 'middle')
                  .attr('display', 'inline')
                  .attr('fill', 'gray')
                  .text("Dados insuficientes");
            }

            // Animation
            title1.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            gDetails.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            gLegend.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            x1AxisSvg.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            xAxisLineSvg.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            yAxisSvg.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            x2AxisSvg.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            x3AxisSvg.transition()
              .delay(500)
              .duration(500)
              .attr('opacity', '1');
            curtain.transition()
              .delay(1000)
              .duration(500)
              .ease('linear')
              .attr('width', (width * 0.5))
              .transition()
                .delay(3000)
                .duration(500)
                .attr('width', 0);
            endCircle.transition()
              .delay(1500)
              .duration(200)
              .attr('opacity', '1');
            title2.transition()
              .delay(2200)
              .duration(500)
              .attr('opacity', '1');
            if (previsaoRetirada.volumes.length) {
              circleRetirada.transition()
                .delay(3200)
                .duration(200)
                .attr('opacity', '1');
            }
            if (previsaoOutorga.volumes.length) {
              circleOutorga.transition()
                .delay(3200)
                .duration(200)
                .attr('opacity', '1');
            }

            function color(slope) {
              if (slope > 0) {
                return "#2ecc71";
              } else if (slope < 0){
                return "#e74c3c";
              }
              return "#3498db";
            }

            function rotate(slope) {
              if (slope >= 0) {
                return "translate("+(width / 2)+", "+(height + 10)+"), rotate(-180 5 0)";
              }
              return "translate("+(width / 2)+", "+(height + 5)+")";
            }

          };

        }
      };
    }
})();
