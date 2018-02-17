/*
 * Constants and other global information
 */
var svgns = "http://www.w3.org/2000/svg";
var svg;


window.addEventListener('load', init, false);
/*
 * Initializes everything
 */
function init() {
	console.log('page loaded, initializing...');

	// create the graph
	createGraph();

	// add the svg map to the page
	createSVG();
	document.body.appendChild(svg);

	// set up event handlers
}


/*
 * Build the graph and save it in JSON form
 */
function createGraph() {

}

/*
 * Build the SVG file used for holding the traversable edges
 */
function createSVG() {
	svg = document.createElementNS(svgns, "svg");
	svg.setAttribute("BaseProfile", "tiny");
	svg.setAttribute("version", "1.2")
	svg.setAttribute("width", "1150");
	svg.setAttribute("height", "950");
	svg.setAttribute("xmlns", svgns);



	/*
	 * BUILDING INFORMATION
	 */
	

	/*
	 * PATH INFORMATION
	 */
	var pathways = document.createElementNS(svgns, "g");
	EDGE_DATA.forEach(function(e) {
        var polyline = document.createElementNS(svgns, "polyline");
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke-width", "2");
        polyline.setAttribute("stroke", "black");

        var string = ""
        for (var i = 0; i < e.length; i += 2) {
            string += e[i] + "," + e[i+1] + " ";
        }
        polyline.setAttribute("points", string);

        // event handling for hoverover while testing
        polyline.addEventListener("mouseenter", function(e) {

            this.setAttribute("stroke", "red");
            this.setAttribute("stroke-width", 5);

        }, false);
        polyline.addEventListener("mouseleave", function(e) {
            // USE TRANSPARENT, NOT NONE
            this.setAttribute("stroke", "black");
            this.setAttribute("stroke-width", 2);
        }, false);

        polyline.addEventListener("click", function(e) {

            console.log(this);

        }, false);


        pathways.appendChild(polyline);
    });
    

    svg.appendChild(pathways);
}


/*
 * 
 */
function djikstra(s, t, options=[]) {

}