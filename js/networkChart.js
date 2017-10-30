//networkChart.js

class networkChart {

    /**
     * Constructor for the Year Chart
     *
     * @param electoralVoteChart instance of ElectoralVoteChart
     * @param tileChart instance of TileChart
     * @param votePercentageChart instance of Vote Percentage Chart
     * @param electionInfo instance of ElectionInfo
     * @param electionWinners data corresponding to the winning parties over mutiple election years
     */
    constructor (data) {
        this.networkData = data;
        
        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        let divnwChart = d3.select("#networkChart").classed("fullView", true);

        //fetch the svg bounds
        this.svgBounds = divnwChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 2000;

        //add the svg to the div
        this.svg = divnwChart.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);

        //this.dataForYears;    
    };

   

    /**
     * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
     */
    update () {
    	function dragstarted(d) {
		  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		  d.fx = d.x;
		  d.fy = d.y;
		}

		function dragged(d) {
		  d.fx = d3.event.x;
		  d.fy = d3.event.y;
		}

		function dragended(d) {
		  if (!d3.event.active) simulation.alphaTarget(0);
		  d.fx = null;
		  d.fy = null;
		}

    	//console.log(this.networkData);
    	let linksdata = this.networkData.links.filter((d)=>{
    					return +d['value'] > 10;
    				})
    	console.log(linksdata);
    	console.log(this.networkData.nodes);

    	let color = d3.scaleOrdinal(d3.schemeCategory20);

		let simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.tag; }))
		    .force("charge", d3.forceManyBody().strength(-300))
		    .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

		let link = this.svg.append("g")
			      	.attr("class", "links")
				    .selectAll("line")
				    .data(linksdata)
				    //.data(this.networkData.links)
				    .enter().append("line")
			      	.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

		let node = this.svg.append("g")
			      	.attr("class", "nodes")
				    .selectAll("circle")
				    .data(this.networkData.nodes)
				    .enter().append("circle")
				      .attr("r", 5)
				      .attr("fill", function(d) { return color(d.group); })
				      .call(d3.drag()
						          .on("start", dragstarted)
						          .on("drag", dragged)
						          .on("end", dragended));

			  node.append("title")
			      .text(function(d) { return d.tag; });

			  simulation
			      .nodes(this.networkData.nodes)
			      .on("tick", ticked);

			  simulation.force("link")
			      .links(linksdata);

			  function ticked() {
			    link
			        .attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });

			    node
			        .attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; });
			  }    

    };

};