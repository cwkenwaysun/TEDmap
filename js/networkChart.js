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
        let divnwChart = d3.select("#networkChart").classed("content", true);

        //fetch the svg bounds
        this.svgBounds = divnwChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 700;

        //add the svg to the div
        this.svg = divnwChart.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);

        this.linksData;
        this.nodesData;
        this.threshold = 15; 
        this.resetData(); 

    };

    resetData(){
    	this.threshold = 15;

    	let linksdata = this.networkData.links.filter((d)=>{
    					return +d['value'] > this.threshold;
    				})
    	let targets = linksdata.map((d)=>{
    					return d.target;
    				})
    	let sources = linksdata.map((d)=>{
    					return d.source;
    				})

    	console.log(linksdata);

    	let nodeWithEdge = this.networkData.nodes
    					.filter((d)=>{
    						return  targets.includes(d.tag) || sources.includes(d.tag);
    					});

    	console.log(nodeWithEdge);

    	this.linksData = linksdata;
    	this.nodesData = nodeWithEdge;
    }
   
    selectOneNode(tagName){

    	let linksdata = this.networkData.links.filter((d)=>{
    					return +d['value'] > this.threshold;
    				})
    	let targets = linksdata.map((d)=>{
    					return d.target;
    				})
    	let sources = linksdata.map((d)=>{
    					return d.source;
    				})

    	console.log(linksdata);

    	let nodeWithEdge = this.networkData.nodes
    					.filter((d)=>{
    						return  targets.includes(d.tag) || sources.includes(d.tag);
    					});

    	console.log(nodeWithEdge);

    	this.linksData = linksdata;
    	this.nodesData = nodeWithEdge;

    }
    /**
     * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
     */
    update () {
    	//console.log(this.networkData.nodes);
    	
    	
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

    	let color = d3.scaleOrdinal(d3.schemeCategory20);

		let simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.tag; }))
		    .force("charge", d3.forceManyBody().strength(-50))
		    .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

		let lines = this.svg.selectAll('.links')
                        .data(this.linksData);
        lines.exit().remove();
        lines = lines.enter().append('line').merge(lines);
        lines.attr("stroke-width", function(d) { return Math.sqrt(d.value-this.threshold); })
        	 .attr("class", "links");

        let circles = this.svg.selectAll('.nodes')
                        .data(this.nodesData);
        circles.exit().remove();
        circles = circles.enter().append('circle').merge(circles);
        circles.attr("r", 8)
        		.attr("class", "nodes")
				.attr("fill", function(d) { return color(d.group); })
				.on('click',(d)=>{console.log(d.tag)})
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));	                     
		/*    
		let link = this.svg.append("g")
			      	.attr("class", "links")
				    .selectAll("line")
				    .data(this.linksData)
				    //.data(this.networkData.links)
				    .enter().append("line")
			      	.attr("stroke-width", function(d) { return Math.sqrt(d.value-this.threshold); });

		let node = this.svg.append("g")
			      	.attr("class", "nodes")
				    .selectAll("circle")
				    .data(this.nodesData)
				    .enter().append("circle")
				      .attr("r", 8)
				      .attr("fill", function(d) { return color(d.group); })
				      .on('click',(d)=>{console.log(d.tag)})
				      .call(d3.drag()
						          .on("start", dragstarted)
						          .on("drag", dragged)
						          .on("end", dragended));
		*/
		//tooltip	      
			  circles.append("title")
			      .text(function(d) { return d.tag; });

			  simulation
			      .nodes(this.nodesData)
			      .on("tick", ticked);

			  simulation.force("link")
			      .links(this.linksData);

			  function ticked() {
			    lines
			        .attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });

			    circles
			        .attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; });
			  }    

    };

};