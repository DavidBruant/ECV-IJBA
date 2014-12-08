"use strict";

function mapApp() {
	/* create leaflet map */
	var map = L.map('map', {
		center: [44.8597, -0.5157],
		zoom: 8
	});

	/**
	 * Object to store svg:element property for future use
	 */
	var props = {
		circle: {
			default: 2,
			active: 5
		}
	};

	/**
	 * Map type of centre index to name
	 * @type {Array}
	 */
	var typeCentre = [ 'epci', 'transfert', 'traitement' ];


	/* add default stamen tile layer */
	new L.tileLayer('http://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		id: 'edouard-lopez.ik52o4kd',
		minZoom: 0,
		maxZoom: 18,
		attribution: 'Map data © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
	}).addTo(map);

	var svg         = d3.select(map.getPanes().overlayPane).append('svg'),
		g               = svg.append('g').attr('class', 'leaflet-zoom-hide'),
		defs            = svg.append('defs'),
		marker          = defs.append('marker')
								.attr('id', 'arw-end')
								.attr('viewBox', '0 0 10 10')
								.attr('refX', 10)
								.attr('refY', 5)
								.attr('orient', 'auto')
							.append('path')
								.attr('d', 'M 0,0 10,5 0,10'),
		markerMid       = defs.append('marker')
								.attr('id', 'arw-mid')
								.attr('viewBox', '0 0 10 10')
								.attr('refY', 0)
								.attr('refY', 5)
								.attr('orient', 'auto')
							.append('path')
								.attr('d', 'M 0,0 10,5 0,10'),
		entities        = g.append('g').attr('id', 'entities'),
		entitiesLabels  = g.append('g').attr('id', 'entities-labels'),
		centres         = g.append('g').attr('id', 'centres'),
		routes          = g.append('g').attr('id', 'routes')
	;

	var path, entity, label, centre;


	function drawEntities() {
		return getTopoJSON().then(function (dataset) {
            var geoData = topojson.feature(dataset, dataset.objects['gironde-epci.geo']);
            var bounds = d3.geo.bounds(geoData);
            path = d3.geo.path().projection(projectPoint);

            // addCentre(geoData.features, 'id');


            entity = entities.selectAll('.entity')
                .data(geoData.features)
                .enter()
                    .append('path')
                    .attr('class', 'entity')
                ;
            label = entitiesLabels.selectAll('.entity-label')
                .data(geoData.features)
                .enter()
                    .append('text')
                    .attr('class', 'entity-label')
                ;

            // Reposition the SVG to cover the features.
            function reset() {
                var bottomLeft = projectPoint(bounds[0]),
                    topRight = projectPoint(bounds[1]);

                svg.attr('width', topRight[0] - bottomLeft[0])
                    .attr('height', bottomLeft[1] - topRight[1])
                    .style('margin-left', bottomLeft[0] + 'px')
                    .style('margin-top', topRight[1] + 'px');

                g.attr('transform', 'translate(' + -bottomLeft[0] + ',' + -topRight[1] + ')');

                entity.attr('d', path)
                    .attr('class', function (d) {
                        return 'entity ' + getCentres(idify(d.id)).join(' ');
                    })
                ;

                label.attr('id', function (d) { return idify(d.id); })
                    .attr('class', function (d) { return 'entity-label ' + idify(d.id); })
                    .attr('transform', function (d) {
                        //console.log('transform', 'translate(' + path.centroid(d) + ')', d);
                        return 'translate(' + path.centroid(d) + ')';
                    })
                    .attr('x', -20)
                    .attr('dy', '.35em')
                    .text(function (d) { return toProperCase(d.id); })
                ;
            }

            map.on('viewreset', reset);
            reset();
        });
	}

	function drawTransport() {
		trajetsP.then(function (dataset) {
			centre = centres.selectAll('.centre')
				.data(dataset)
				.enter()
				.append('g')
			;

			var centrePlace = centre.append('circle');
			var centreLabel = centre.append('text');

			// Standard enter / update
			var routePath = routes.selectAll('.route')
				.data(dataset)
				.enter()
				.append('path')
			;

			var emissionGroup = routes.append('g').attr('id', 'emission');
			var emission = emissionGroup.selectAll('.emission')
				.data(dataset)
				.enter()
				.append('text')
			;
			var qteGroup = routes.append('g').attr('id', 'qte');
			var qte = qteGroup.selectAll('.qte')
				.data(dataset)
				.enter()
				.append('text')
			;
			var distGroup = routes.append('g').attr('id', 'dist');
			var dist = distGroup.selectAll('.dist')
				.data(dataset)
				.enter()
				.append('text')
			;

			function attach(d) {
				var coordDepart = [ d.depart.longitude, d.depart.latitude ];
				var coordArrivee = [ d.arrivee.longitude, d.arrivee.latitude ];
                
                //console.log('attach transform', 'translate(' + path.centroid({type: 'LineString', coordinates: [coordDepart, coordArrivee ] }) + ')', d);
                
				return 'translate(' + path.centroid({type: 'LineString', coordinates: [coordDepart, coordArrivee ] }) + ')';
			}

			function reset() {
				centre
					.attr('class', function (d) {
						return	' centre ' + idify(d.depart.nom) +
								' from-' + d.depart.type +
								' to-' + d.arrivee.type;
					})
				;
				centrePlace
						.attr('r', props.circle.default)
						.attr('cx', function (d) { return projectDepart(d)[0]; })
						.attr('cy', function (d) { return projectDepart(d)[1]; })
						.attr('title', function (d) { return idify(d.depart.nom); })
				;
				centreLabel
					.attr('class', 'label')
					.attr('transform', function (d) {
						return 'translate(' +  projectDepart(d)[0] + ', ' + projectDepart(d)[1] + ')';
					})
					.text(function (d) { return idify(d.depart.nom); })
				;

				routePath.attr('d', function (d) {
						var coordDepart = [ d.depart.longitude, d.depart.latitude ];
						var coordArrivee = [ d.arrivee.longitude, d.arrivee.latitude ];
						var vertex = path.centroid({type: 'LineString', coordinates: [coordDepart, coordArrivee ] });
						return path({
							type: 'LineString',
							coordinates: [
								coordDepart,
								pointToProjection(vertex),
								coordArrivee
							]
						});
					})
					.attr('class', function (d) {
						return [
							getEpci(idify(d.depart.nom)), getEpci(idify(d.arrivee.nom)),
							'route', idify(d.depart.nom), idify(d.arrivee.nom),
							'from-' + d.depart.type,
							'to-' + d.arrivee.type,
						].join(' ');
					})
				;
				routePath

					.attr('d', function (d) {
						var source = projectDepart(d);
						var target = projectArrivee(d);

						var  dx = target[0] - source[0]
							,dy = target[1] - source[1]
							,dr = Math.sqrt(dx * dx + dy * dy)
							,inOut = Math.round(Math.random(1))
						;
						var arc = 'M ' + source[0] + ', ' + source[1]
								+ 'A ' + dr + ', ' + dr + ',0 0 '+inOut+'  ' + target[0] + ', ' + target[1];

						return arc;
					})
				;

				emission.attr('class', function (d) { return ['emission', getEpci(idify(d.depart.nom)), getEpci(idify(d.arrivee.nom))].join(' '); })
					.attr('y', -5)
					.attr('dy', '.35em')
					.attr('transform', function (d) {return attach(d); })
					.text(function (d) { return Math.round(d.co2) + ' kg'; })
				;
				qte.attr('class', function (d) { return ['qte', getEpci(idify(d.depart.nom)), getEpci(idify(d.arrivee.nom))].join(' '); })
					.attr('y', 5)
					.attr('dy', '.35em')
					.attr('transform', function (d) {return attach(d); })
					.text(function (d) { return Math.round(d.poids) + ' t'; })
				;
				dist.attr('class', function (d) { return ['dist', getEpci(idify(d.depart.nom)), getEpci(idify(d.arrivee.nom))].join(' '); })
					.attr('y', 15)
					.attr('dy', '.35em')
					.attr('transform', function (d) {return attach(d); })
					.text(function (d) { return Math.round(d.distance) + ' km'; })
				;
			}

			map.on('viewreset', reset);
			reset();
		});
	}

	/**
	 * Utility to project a depart point
	 */
	function projectDepart(d) { 
                               return projectPoint([d.depart.longitude, d.depart.latitude]); 
                              }
	function projectArrivee(d) { return projectPoint([d.arrivee.longitude, d.arrivee.latitude]); }

	/**
	 * Use Leaflet to implement a D3 geographic projection.
	 * @param  {array} x point as {latitute,longitude} array
	 * @return {array}   d3 coordinates as {x,y} array
	 */
	function projectPoint(x) {
		var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
		return [point.x, point.y];
	}

	/**
	 * D3 to Leaflet coordinates
	 * @param  {array} p d3 coordinates as {x,y} array
	 * @return {array}   point as {latitute,longitude} array
	 */
	function pointToProjection(p) {
		var projection = map.layerPointToLatLng(new L.point(p[0], p[1]));
		return [projection.lng, projection.lat];
	}


	drawEntities().then(drawTransport);
}
