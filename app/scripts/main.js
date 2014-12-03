/**
* Heavily based on Mike Bostocks work: http://bost.ocks.org/mike/leaflet/
* @param  {[type]} window    [description]
* @param  {[type]} document  [description]
* @param  {[type]} L         [description]
* @param  {[type]} undefined [description]
* @return {[type]}           [description]
*/
(function (window, document, L, d3) {
	'use strict';

    /**
     * List of centres
     * @type {Array}
     */
    var _centres = [], _links = [];
    
    pointsP.then(function(points){
        console.log('points', points);
    });
    
	flowApp(_centres, _links);
	mapApp(_centres, _links);
}(window, document, L, d3));
