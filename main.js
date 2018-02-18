/*
 * Constants and other global information
 */
var svgns = "http://www.w3.org/2000/svg";

var debug = false;

var COLORS = {
	bgColor: '#ced09f',
	buildingFill: '#b7a9a2',
	buildingStroke: '#7b7169',
	pathStroke: '#e8e1be',
	tunnelStroke: '#0000ff',
	roadStroke: '#ffffff',
};


var svg;
var mapData = {
	width: 1150,
	height: 950,
	x: 0,
	y: 0,
	zoom: 1,
};


var tooltip;
var cur_building;
var prev_building_clicked;


var graph;
var entrances = {};


window.addEventListener('load', init, false);
/*
 * Initializes everything
 */
function init() {
	console.log('page loaded, initializing...');
	tooltip = document.getElementById('tooltip');

	// create the graph
	createGraph();

	// add the svg map to the page
	createSVG();
	document.getElementById('mapContainer').appendChild(svg);


	createSidebar();


	// set up event handlers for anything else
	createHandlers();


	console.log("...finished initializing everything");
	// dijkstra(100,490); // test case
}


/*
 * Build the graph and save it in JSON form
 */
function createGraph() {
	graph = VERTICES;

	for (var i = 0; i < ENTRANCE_DATA.length; i++) {
		var entrance = ENTRANCE_DATA[i];
		for (var j = 0; j < graph.length; j++) {
			var vertex = graph[j];
			if (vertex.x === entrance.x && vertex.y === entrance.y) {
				vertex.name = entrance.building;
				vertex.accessible = entrance.accessible;
				vertex.desc = entrance.desc;
				if (entrances[vertex.name] === undefined) {
					entrances[vertex.name] = [vertex.id];
				} else {
					entrances[vertex.name].push(vertex.id);
				}
				break;
			}
		}
	}
}

/*
 * Build the SVG file used for holding the traversable edges
 */
function createSVG() {
	svg = document.createElementNS(svgns, "svg");
	svg.setAttribute("BaseProfile", "tiny");
	svg.setAttribute("version", "1.2")
	svg.setAttribute("width", mapData.width);
	svg.setAttribute("height", mapData.height);
	svg.setAttribute("xmlns", svgns);
	svg.setAttribute("viewport-fill", COLORS.bgColor);


	var bgRect = document.createElementNS(svgns, "rect");
	bgRect.setAttribute("fill", COLORS.bgColor);
	bgRect.setAttribute("width", mapData.width);
	bgRect.setAttribute("height", mapData.height);
	svg.appendChild(bgRect);

	/*
	 * BUILDING INFORMATION
	 */
	var buildings = document.createElementNS(svgns, "g");
	BUILDINGS.forEach(function(b) {
		var polygon = document.createElementNS(svgns, "polygon");
		polygon.setAttribute("fill", COLORS.buildingFill);
		polygon.setAttribute("stroke", COLORS.buildingStroke);
		polygon.setAttribute("stroke-width", "1");
		polygon.setAttribute("name", b.name);
		var string = "";
		var p = b.points;
		for (var i = 0; i < p.length; i += 2) {
            string += p[i] + "," + p[i+1] + " ";
        }
        polygon.setAttribute("points", string);

        // click to bring up tooltip for that building
        polygon.addEventListener("click", function(e) {
            var x = e.pageX + 10;
            var y = e.pageY - 3;
            // shift it to the other side of the mouse if near the right/bottom of the screen
            if (window.innerWidth + window.pageXOffset < x + 260) {
                x -= 250;
            }
            if (window.innerHeight + window.pageYOffset < y + 230) {
                y -= 220;
            }
            tooltip.getElementsByTagName('h2')[0].innerText = this.getAttribute("name");

            tooltip.style.left = x + "px";
            tooltip.style.top  = y + "px";
            tooltip.style.display = "block";
            prev_building_clicked = cur_building;
            cur_building = this.getAttribute("name");

            if (prev_building_clicked !== undefined) {
            	console.log("starting from " + prev_building_clicked);
            	console.log("going to " + cur_building);
            	tooltip.getElementsByTagName('p')[0].innerHTML = '<input type="button" value="get directions from ' + prev_building_clicked + '" onclick="dijkstra(' + entrances[prev_building_clicked][0] + ',' +
            	entrances[cur_building][0] + ',{accessible:false})"/>';
            }


        }, false);

        buildings.appendChild(polygon);

	});
	svg.appendChild(buildings);

	/*
	 * PATH INFORMATION
	 */
	var pathways = document.createElementNS(svgns, "g");
	pathways.setAttribute("id", "path_edges");
	EDGE_DATA.forEach(function(e, index) {
        var polyline = document.createElementNS(svgns, "polyline");
        polyline.setAttribute("id", "edge_" + index)
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke-width", "2");
        polyline.setAttribute("stroke", COLORS.pathStroke);

        var string = "";
        for (var i = 0; i < e.length; i += 2) {
            string += e[i] + "," + e[i+1] + " ";
        }
        polyline.setAttribute("points", string);

        // event handling for hoverover while testing
        polyline.addEventListener("mouseenter", function(e) {
        	if (debug) {
        		this.setAttribute("stroke", "red");
            	this.setAttribute("stroke-width", "5");
        	}

            

        }, false);
        polyline.addEventListener("mouseleave", function(e) {
            // USE TRANSPARENT, NOT NONE
            this.setAttribute("stroke", COLORS.pathStroke);
            this.setAttribute("stroke-width", "2");
        }, false);

        polyline.addEventListener("click", function(e) {
            console.log(this);

        }, false);


        pathways.appendChild(polyline);
    });
    

    svg.appendChild(pathways);
}



function createSidebar() {
	var sidebar = document.getElementById('sidebar');
	var selectOrigin = document.createElement('select');
	var selectDestination = document.createElement('select');
	selectOrigin.setAttribute('id', 'select_origin');
	selectDestination.setAttribute('id', 'select_destination');
	for (var entrance in entrances) {
		var option1 = document.createElement('option');
		var option2 = document.createElement('option');
		option1.setAttribute('value', entrances[entrance][0]);
		option2.setAttribute('value', entrances[entrance][0]);
		option1.innerText = entrance;
		option2.innerText = entrance;

		selectOrigin.appendChild(option1);
		selectDestination.appendChild(option2);
	}

	document.getElementById('sb_start').appendChild(selectOrigin);
	document.getElementById('sb_end').appendChild(selectDestination);

	document.getElementById('sb_submit').addEventListener('click', function(evt) {
		var start = document.getElementById('select_origin');
		var end = document.getElementById('select_destination');
		var vertexStart = parseInt(start.options[start.selectedIndex].value);
		var vertexEnd = parseInt(end.options[end.selectedIndex].value);
		dijkstra(vertexStart, vertexEnd);
	}, false);

}



/*
 * Add event handlers to anything needing them that doesn't already have them
 */
function createHandlers() {
	// need to handle map support for zooming in/out and moving around
	document.addEventListener('keydown', function(evt) {
		// TODO: BOUNDS NEED TO BE BASED ON THE SIZE OF THE MAP CONTAINER
		switch(evt.keyCode) {
			case 37: // left arrow
				mapData.x = Math.min(mapData.width - mapData.width/mapData.zoom, mapData.x + 10*mapData.zoom);
				break;
			case 39: // right arrow
				mapData.x = Math.max(-mapData.width/mapData.zoom + window.innerWidth, mapData.x - 10*mapData.zoom);
				break;
			case 38: // up arrow
				mapData.y = Math.min(mapData.height - mapData.height/mapData.zoom, mapData.y + 10*mapData.zoom);
				break;
			case 40: // down arrow
				mapData.y = Math.max(-mapData.height/mapData.zoom + window.innerHeight, mapData.y - 10*mapData.zoom);
				break;
			case 187: // =/+, zoom in
				mapData.zoom = Math.min(3, mapData.zoom + 0.1);
				break;
			case 189: // -, zoom out
				mapData.zoom = Math.max(0.6, mapData.zoom - 0.1);
				break;
		}
		svg.setAttribute("transform", "translate(" + mapData.x + "," + mapData.y + ") scale(" + mapData.zoom + ")");

	}, false);

	// close out of tooltip
	document.getElementById('tooltip').getElementsByTagName('span')[0].addEventListener('click', function(evt) {
		document.getElementById('tooltip').style.display = 'none';
	}, false);
}

/*
 * 
 */
function dijkstra(s, t, options={}) {

	// remove coloring from all paths
	var paths = document.getElementById('path_edges');
	for (var i = 0; i < paths.children.length; i++) {
		var path = paths.children[i];
		path.setAttribute("stroke", COLORS.pathStroke);
	}

	console.log(options);
	var distances = new Array(graph.length).fill(Infinity);
	distances[s] = 0;
	var previous = new Array(graph.length).fill(-1);

	var heap = {
		data: [],
		push: function(n) {
			this.data.push(n);
			this.bubbleUp(this.data.length-1);
		},
		bubbleUp: function(i) {
			var parent = Math.floor((i-1)/2);
			if (distances[this.data[parent]] > distances[this.data[i]]) {
				this.swap(parent, i);
				this.bubbleUp(parent);
			}
		},
		pop: function() {
			if (this.data.length === 0) {
				return undefined;
			} else {
				var top = this.data[0];
				if (this.data.length === 1) {
					this.data.pop();

				} else {
					this.data[0] = this.data.pop(); // replace root with last element
					this.bubbleDown(0);	
				}
				return top;
			}
		},
		bubbleDown: function(i) {
			var left = 2*i, right = 2*i+1;
			var smallest;
			if (right < this.data.length && distances[this.data[i]] > distances[this.data[right]]) {
				smallest = right;
			}
			if (left < this.data.length && distances[this.data[i]] > distances[this.data[left]]) {
				smallest = left;
			}
			if (smallest !== undefined) {
				this.swap(i, smallest);
				this.bubbleDown(smallest);
			}
		},
		swap: function(a, b) {
			var t = this.data[a];
			this.data[a] = this.data[b];
			this.data[b] = t;
		},
		isEmpty: function() {
			return (this.data.length === 0);
		},

	};
	
	heap.push(s);

	var counter = 0;
	// console.log("Starting at " + s + ", looking for " + t);
	while(!heap.isEmpty() && counter < 10000) {
		counter++;
		var v = heap.pop();
		// console.log("new loop of dijkstra: vertex " + v);
		if (v === t) {
			console.log("found target!");
			break; // return distances[t];
		}
		// console.log(graph[v]);
		for (var i = 0; i < graph[v]["neighbors"].length; i++) {
			var n = graph[v]["neighbors"][i];
			// console.log("distances[" + n + "]=" + distances[n] + ", distances[" + v + "]=" + distances[v]);
			if (options["accessible"] === true && !(graph[v].accessible ===true)) { // if on accessible 
				continue;
			}
			if (distances[n] > graph[v]["weights"][i] + distances[v]) {
				distances[n] = graph[v]["weights"][i] + distances[v];
				heap.push(n);
				previous[n] = v;
			}
		}

	}
	// console.log("finished dijkstra");
	// if (counter === 10000) { console.log("ENDED PREMATURELY"); }
	if (distances[t] === undefined) {
		console.log("could not find path from " + s + " to " + t);
		return;
	}
	// console.log(distances);
	// console.log("path:");
	for (var v = t, prev = undefined; v !== s; v = prev) {
		var prev = previous[v];
		// console.log("---new---");
		// console.log(v)
		var evt = new MouseEvent('mouseenter', {
			bubbles: true,
			cancelable: true,
			view: window
		});
		// console.log(document.getElementById("edge_" + v));

		console.log("going from " + v + " to " + prev);
		// console.log(graph[prev]);
		// console.log("edges of " + prev + ": " + graph[prev]["edges"]);
		var edge_id = graph[prev]["edges"][graph[prev]["neighbors"].indexOf(v)];
		// console.log("edge id: " + edge_id);
		var foo = debug;
		debug = true;
		document.getElementById("edge_" + edge_id).dispatchEvent(evt);
		debug = foo;
	}
	// console.log("reached starting vertex " + v);
	// console.log(previous);
}







