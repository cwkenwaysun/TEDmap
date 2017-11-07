//networkChart.js

class networkChart {

    /**
     * Constructor for network chart
     * @param   data network data, including links and nodes.
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
        this.svg.append("g")
      		.attr("class", "links");
      	this.svg.append("g")
      		.attr("class", "nodes");
      	
      	this.colorScale = d3.scaleOrdinal(d3.schemeCategory20);		    
        this.linksData;
        this.nodesData;
        this.threshold = 15;
        this.selectedTag = null; 
        this.forceParam = -50;
        this.resetData();

    };
    /**
     * Set data to the initial state, display links whose value are bigger than threshold
     * @return void call update in the end of function
     */
    resetData(){

    	let linksdata = this.networkData.links.filter((d)=>{
    					return +d['value'] > this.threshold;
    				})
    	let targets = linksdata.map((d)=>{
    					if(d.target.tag!=undefined)
    						return d.target.tag;
    					return d.target;
    				})
    	let sources = linksdata.map((d)=>{
    					if(d.target.tag!=undefined)
    						return d.source.tag;
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
    	this.update();
    }
    /**
     * find data which are related to the selected tag.
     * @param  string tagName selected tag
     * @return void   
     */
    selectOneNode(tagName){
    	if(this.selectedTag == tagName){
    		this.selectedTag = null;
    		this.threshold = 15;
    		this.forceParam = -50;
	    	this.resetData();
    	}
    	else{
    		this.threshold = 0;
    		this.selectedTag = tagName;
    		this.forceParam = -300;

	    	let linksdata = this.networkData.links.filter((d)=>{
	    					return d.target == tagName || d.source==tagName;
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
	    	//this.update();
    	}
    	this.update();

    }
    /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    circle_tooltip_render(tooltip_data) {
        let text = "<h2 style='color:"  + tooltip_data.color + ";' >" + tooltip_data.tag + "</h2>";
        text +=  "Group ID: " + tooltip_data.groupid;

        return text;
    }

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

    	//let color = d3.scaleOrdinal(d3.schemeCategory20);

		let simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.tag; }))
		    .force("charge", d3.forceManyBody().strength(this.forceParam))
		    .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

		let lines = this.svg.select('.links').selectAll('line')
                        .data(this.linksData);
        lines.exit().remove();
        lines = lines.enter().append('line').merge(lines);
        lines.attr("stroke-width", (d)=> { return Math.sqrt(d.value-this.threshold); });
        	 //.attr("class", "links");


        let circles = this.svg.selectAll('.nodes').selectAll('circle')
                        .data(this.nodesData);
        circles.exit().remove();
        circles = circles.enter().append('circle').merge(circles);
        circles.attr("r", 8)
        		//.attr("class", "nodes")
				.attr("fill", (d)=> { return this.colorScale(d.groupid); })
				.on('click',(d)=>{console.log(d.tag);
					this.selectOneNode(d.tag)
				})
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));	                     

		//tooltip
				let circletip = d3.tip().attr('class', 'd3-tip')
                .direction('se')
                .offset(function() {
                    return [0,0];
                })
                .html((d)=>{
                    let tooltip_data = {
                        "tag": d.tag,
                        "groupid":d.groupid,
                        "color":this.colorScale(d.groupid)
                        /*
                        "result":[
                          {"nominee": d.D_Nominee_prop,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
                          {"nominee": d.R_Nominee_prop,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
                          {"nominee": d.I_Nominee_prop,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
                         ]
                         */
                      };
                    return this.circle_tooltip_render(tooltip_data);

                });	
			  //circles.selectAll('title').remove();		      
			  //circles.append("title")
			  //    .text(function(d) { return d.tag; });
			  this.svg.call(circletip);
            
              circles.on('mouseover', circletip.show)
                .on('mouseout', circletip.hide);

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