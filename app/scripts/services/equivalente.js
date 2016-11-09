(function() {
  'use strict';

  angular.module('sabApp')
    .factory('ReservatorioEquivalente', reservatorioEquivalente);

  reservatorioEquivalente.$inject = ['RESTAPI','$resource'];

  /*jshint latedef: nofunc */
  function reservatorioEquivalente(RESTAPI, $resource) {
    var factory = {
      sabMapa: $resource(RESTAPI.url + '/estados/sab', null, {query: {isArray: false}}),
      estadoEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/estado'),
      baciaEquivalente: $resource(RESTAPI.url+'/reservatorio/equivalente/bacia')
    };
    return factory;
  }
})();
