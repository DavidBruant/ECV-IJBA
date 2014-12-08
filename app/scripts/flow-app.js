"use strict";

/**
 * Add missing centres from the CSV to the global list.
 * @param {object} fromData haystack, input data as CSV file
 * @param  {column} d        column
 */
function addCentre(fromData, column, centres) {
	fromData.map(function (d) {
		var key = idify(d[column]);

		var tmp = centres.map(function(e) { return e.name; });
		if (tmp.indexOf(key) === -1) {
			centres.push({'name': key});
		}
	});
	return centres;
}

/**
 * Add relation between two centres
 * @param {object} fromData input data as CSV file
 */
function addLink(fromData, centres, _links) {
	fromData.map(function (d, i) {
		var did = centres.map(function(d) { return d.name; }).indexOf(idify(d.depart));
		var aid = centres.map(function(d) { return d.name; }).indexOf(idify(d.arrivee));

		_links.push({
			'source': did,
			'target': aid,
			'value': Math.round(d.qte, 0)
		});
	});

	return _links;
}

function flowApp() {
	var margin = {top: 1, right: 1, bottom: 6, left: 1},
			width = 600,//360 - margin.left - margin.right,
			height = 600 - margin.top - margin.bottom;

	var formatNumber = d3.format(",.0f"),
			format = function(d) { return formatNumber(d) + " t"; },
			color = d3.scale.category20c();

	var svg = d3.select(".flow-app").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var sankey = d3.sankey()
			.nodeWidth(40)
			.nodePadding(10)
			.size([width, height]);

	var path = sankey.link();



	Promise.all([pointsP, trajetsP]).then(function(res) {
		var points = res[0],
            trajets = res[1];
        
        /**
		 * List of centres
		 * @type {Array}
		 */
		var nodes = points;
        
		var links = trajets.map(function(t){
            return {
                source: nodes.findIndex(function(n){ return n.id === t.depart.id; }),
                target: nodes.findIndex(function(n){ return n.id === t.arrivee.id; }),
                value: t.poids
            };
        });

		/*d3.json('data/gironde-epci.topo.json', function (dataset) {
			var geoData = topojson.feature(dataset, dataset.objects['gironde-epci.geo']);
			_centres = addCentre(geoData.features, 'id', _centres);
		});*/

		sankey
				.nodes(nodes)
				.links(links)
				.layout(32);

		var link = svg.append("g").selectAll(".link")
				.data(links)
			.enter().append("path")
				.attr("class", function (d) { return ["link ", d.source.nom, d.target.nom].join(' '); })
				.attr("d", path)
				.style("stroke-width", function(d) { return Math.max(1, d.dy); })
				.sort(function(a, b) { return b.dy - a.dy; });

		link.append("title")
				.text(function(d) { return d.source.nom + " → " + d.target.nom + "\n" + format(d.value); });

		var node = svg.append("g").selectAll(".node")
				.data(points)
			.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			// .call(d3.behavior.drag()
			// 	.origin(function(d) { return d; })
			// 	.on("dragstart", function() { this.parentNode.appendChild(this); })
			// 	.on("drag", dragmove));

		node.append("rect")
				.attr("height", function(d) { return Math.max(5, d.dy); })
				.attr("width", sankey.nodeWidth())
				.style("fill", function(d) { return d.color = color(d.nom); })
				// .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
				//.attr("class", function (d) { return d.nom; })
				.on('mouseover', function (d) {
					var eid = d.nom;
					updateCounter(eid);
					highlightEntity(eid);
					showEntityLabel(eid);
					showEntityRoute(eid);
				})
			.append("title")
				.text(function(d) { return d.nom + "\n" + format(d.value); });

		node.append("text")
				.attr("x", -6)
				.attr("y", function(d) { return d.dy / 2; })
				.attr("dy", ".35em")
				.attr("text-anchor", "end")
				.attr("transform", null)
				.text(function(d) { return d.nom; })
			.filter(function(d) { return d.x < width / 2; })
				.attr("x", 6 + sankey.nodeWidth())
				.attr("text-anchor", "start");

		// function dragmove(d) {
		// 	d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
		// 	sankey.relayout();
		// 	link.attr("d", path);
		// }
	});

}
