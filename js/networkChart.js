//networkChart.js

class networkChart {

    /**
     * Constructor for network chart
     * @param   data network data, including links and nodes.
     */
    constructor (data) {
        this.networkData = data;
        this.threshold = 15;

        this.initlinksData = this.networkData.links.filter((d)=>{
              return +d['value'] > this.threshold;
            })
        let targets = this.initlinksData.map((d)=>{
                return d.target;
              })
        let sources = this.initlinksData.map((d)=>{
                return d.source;
              })

        this.tagMap = new Map();

        this.initnodesData = this.networkData.nodes
                .filter((d)=>{
                  this.tagMap.set(d.tag,d.groupid);
                  return  targets.includes(d.tag) || sources.includes(d.tag);
                });

        //console.log(this.initlinksData);  //583
        //console.log(this.initnodesData ); //151       
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
        this.gAll = this.svg.append("g");
        this.gAll.attr("class", "everything");   

        this.gAll.append("g")
      		.attr("class", "links");
      	this.gAll.append("g")
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

    	this.linksData = this.initlinksData;
    	this.nodesData = this.initnodesData;
    	this.update();
    }
    /**
     * find data which are related to the selected tag.
     * @param  string tagName selected tag
     * @return void   
     */
    selectOneNode(tagName,x,y){
    	if(this.selectedTag == tagName){
    		this.selectedTag = null;
    		this.threshold = 15;
    		this.forceParam = -50;
	    	this.resetData();
    	}
    	else{

        /*
        d3.event.stopPropagation();
        let dcx = (this.svgWidth/2-x*1);
        let dcy = (this.svgHeight/2-y*1);
        //zoom.translate([dcx,dcy]);
        this.svg.selectAll('g')
        .transition()
        .duration(1500).attr("transform", "translate("+ dcx + "," + dcy  + ")");
        */
        //tagName = "cars";
    		this.threshold = 0;
    		this.selectedTag = tagName;
    		this.forceParam = -15;

        let newlinksdata = this.networkData.links.reduce((filtered,d)=>{
                let v;
                if(d.target.tag==tagName){
                  v= {
                    "source":tagName,
                    "target":d.source.tag,
                    "value":d.value,
                    "t_groupid":this.tagMap.get(d.source.tag),
                  }
                }
                else if(d.source.tag==tagName){
                  v= {
                    "source":tagName,
                    "target":d.target.tag,
                    "value":d.value,
                    "t_groupid":this.tagMap.get(d.target.tag),
                  }
                }
                else if(d.target==tagName){
                  v= {
                    "source":tagName,
                    "target":d.source,
                    "value":d.value,
                    "t_groupid":this.tagMap.get(d.source),
                  }
                }
                else if(d.source==tagName){
                  v = {
                    "source":tagName,
                    "target":d.target,
                    "value":d.value,
                    "t_groupid":this.tagMap.get(d.target),
                  }

                }
                if(v!=undefined)
                  filtered.push(v);
                return filtered;
              },[])

        newlinksdata.sort((a,b)=>{
          if(a.t_groupid!=b.t_groupid)
           return a.t_groupid - b.t_groupid;
          else
                  if (a.target < b.target) {
                    return -1;
                  }
                  if (a.target > b.target) {
                    return 1;
                  }

        })

        /*
	    	let linksdata = this.networkData.links.filter((d)=>{
                //if(d.target!=undefined)
                  return d.target == tagName || d.source==tagName || d.source.tag==tagName || d.target.tag==tagName;
                //return  d.source.tag==tagName || d.target.tag==tagName;

	    				})
        //*/
        //console.log(linksdata);
        console.log(newlinksdata);

        let usedTags = newlinksdata.map((d)=>{
             if(d.target.tag!=undefined)
                  return d.target.tag;
              return d.target;
        })

        usedTags.push(tagName);

	    	let nodeWithEdge = this.networkData.nodes
	    					.filter((d)=>{
                  //if(d.tag!=undefined)
	    						//return  targets.includes(d.tag) || sources.includes(d.tag);
                  return  usedTags.includes(d.tag);
	    					});

        nodeWithEdge.sort((a,b)=>{
            return a.groupid - b.groupid;
        });        
	    	console.log(nodeWithEdge);

        let groups = d3.nest()
            .key(function(d) { return d.t_groupid; })
            .rollup(function(v) {
              let sum = d3.sum(v,function(l){return l.value});
              let member = v.map((t)=>{
                return t.tag;
              }).sort();
              

              return {
                "valueToGroup":sum,
                "data":v,
              }

            })
            .entries(newlinksdata);

        console.log(groups);
            
        let zoominGroup = [];
        groups.forEach( (d)=> {
          let groupid = "Group"+d.key;
          nodeWithEdge.push(
            {
              "tag":groupid,
              "groupid":d.key,
            }
          )
          zoominGroup.push(
            {
              "source":tagName,
              "target":groupid,
              "value":d.value.valueToGroup,
            }
          );
          let groupNode = d.value.data;
          groupNode.forEach( (e)=> {
              zoominGroup.push(
                {
                  "source":groupid,
                  "target":e.target,
                  "value":e.value,
                }
              );
          });

        });
        
        console.log(zoominGroup);

            
        this.linksData = zoominGroup;
        this.nodesData = nodeWithEdge;
	    	//this.linksData = linksdata;
	    	//this.nodesData = nodeWithEdge;
	    	//this.update();
        
        //this.svg.selectAll('g').attr("transform", "translate("+ 0 + "," + 0  + ")");//
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
		    .force("link", d3.forceLink()
                        .id(function(d) { 
                        return d.tag; })
                        /*
                        .distance(()=>{
                          //if(this.forceParam == -15)
                          //  return 10
                          return 20
                        })
                        */
          )
		    .force("charge", d3.forceManyBody()
                            .strength(this.forceParam)
                            .distanceMax(300)

          )
		    .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));

		let lines = this.gAll.select('.links').selectAll('line')
                        .data(this.linksData);
    let newlines = lines.enter().append('line').style("opacity", 0);                    

        lines.exit()
              .style("opacity", 1)
              .transition()
              .duration(1500)
              .style("opacity", 0)
              .remove();

        lines = newlines.merge(lines);
        lines
        .transition().duration(1500)
        .style("opacity", 1)
        .attr("stroke-width", (d)=> { return Math.sqrt(d.value-this.threshold); });
        	 //.attr("class", "links");


        let circles = this.gAll.selectAll('.nodes').selectAll('circle')
                        .data(this.nodesData);
        let newcircles = circles.enter().append('circle')
                                  .style("opacity", 0)
                                  .attr("r", 8);
                        
        circles.exit()
              .style("opacity", 1)
              .transition()
              .duration(1500)
              .style("opacity", 0)
              .remove();

        circles =  newcircles.merge(circles); 
        //circles = circles.enter().append('circle').merge(circles);
        
        circles
        .transition().duration(1500)
				.attr("fill", (d)=> { return this.colorScale(d.groupid); })
        .style("opacity", 1);

        circles
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));	                     

		//tooltip
				d3.selectAll('.d3-tip').remove();
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

			  this.svg.call(circletip);
            
        circles.on('mouseover', circletip.show)
                .on('mouseout', circletip.hide)
                .on('dblclick',(d)=>{
                	console.log(d.tag);
					     this.selectOneNode(d.tag,d.x,d.y);
				});

                
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

        //zoom capabilities 
        let min_zoom = 0.5;
        let max_zoom = 7;
        let zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
                                    .on("zoom", zoom_actions);
        
        //let zoom_handler = d3.zoom()
        //    .on("zoom", zoom_actions);

        zoom_handler(this.svg);

        function zoom_actions(){
            this.gAll
              .attr("transform", d3.event.transform)
        }

  }     


};