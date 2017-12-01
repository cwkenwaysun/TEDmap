//networkChart.js

class networkChart {

    /**
     * Constructor for network chart
     * @param   data network data, including links and nodes.
     */
    constructor (data) {
        //this.tcChart = textCloudChart;

        this.networkData = data;
        this.threshold = 15;
        this.nodes = this.networkData.nodes;
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
        this.margin = {top: 10, right: 20, bottom: 30, left: 20};
        let divnwChart = d3.select("#networkChart").classed("content", true);

        //fetch the svg bounds
        this.svgBounds = divnwChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 600;

        //add the svg to the div
        this.svg = divnwChart.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);

        //border of svg    
        let border = this.svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth)
            //.style("stroke", 'Gray')
            .style("opacity", 0.8)
            .style("fill", "none")
            //.style("stroke-width", '3px');

        this.gAll = this.svg.append("g");
        this.gAll.attr("class", "everything");   

        this.gAll.append("g")
      		.attr("class", "links");
      	this.gAll.append("g")
      		.attr("class", "nodes");
      	
      	this.colorScale = d3.scaleOrdinal() //ten colors
                  .domain(d3.range(0,9))
                  .range(['#1f77b4','#d448ce','#edaf6d','#f492a8','#965628','#3e8934','#21c2ce','#070cc2','#70c32a','#e9272a']);  
                  //[blue, Magenta, olive, Teal, brown, dark green, purple, Navy, green, Red]21c2ce

        this.rScale = d3.scaleLinear()
        .domain([1,203])
        .range([5, 35]);

        this.circletip;
        //this.texthover = false;

        this.switch = true;

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

        this.switch = true;
	    	this.resetData();
    	}
    	else{
        if(this.forceParam==-50)
          this.switch = true;
        else
          this.switch = false;

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


        let usedTags = newlinksdata.map((d)=>{
             if(d.target.tag!=undefined)
                  return d.target.tag;
              return d.target;
        })

        usedTags.push(tagName);

	    	let nodeWithEdge = this.networkData.nodes
	    					.filter((d)=>{
                  return  usedTags.includes(d.tag);
	    					});

        nodeWithEdge.sort((a,b)=>{
            return a.groupid - b.groupid;
        });        
	    	//console.log(nodeWithEdge);

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

        //console.log(groups);
            
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
              nodeWithEdge.find((d)=>{return d.tag==e.target})['value'] = e.value;
          });

        });

        this.linksData = zoominGroup;
        this.nodesData = nodeWithEdge;
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
        //text +=  "Group ID: " + tooltip_data.groupid;

        if(this.forceParam != -15){
          text += "<h4> Top 5 strong related tags:</h4>";
          text += "<ul>"
          tooltip_data.top5.forEach((row)=>{
              text += "<li><b>" + row.tag + "</b>:" + row.value+ "</li>"
          });
          text += "</ul>";
        }
        else if(tooltip_data.tag!=this.selectedTag){
          text += "co-occurrence: "+tooltip_data.value;
        } 

        return text;
    }

    /**
     * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
     */
    update () {

      let divnwChart = d3.select("#tagCloud").node();
      //console.log(divnwChart);

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

		let simulation = d3.forceSimulation()
		    .force("link", d3.forceLink()
                        .id(function(d) { 
                        return d.tag; })
          )
		    .force("charge", d3.forceManyBody()
                            .strength(this.forceParam)
                            .distanceMax(200)

          )
		    .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2))
        .force('collision', d3.forceCollide().radius((d)=>{
          return this.rScale(d.value);
        }))

    this.gAll.select('.links').selectAll('line').remove();

		let lines = this.gAll.select('.links').selectAll('line')
                        .data(this.linksData);
    let newlines = lines.enter().append('line').style("opacity", 0);
    /*
                    .attr("x1", function(d) { return this.svgWidth/2; })
                    .attr("y1", function(d) { return this.svgWidth/2; })
                    .attr("x2", function(d) { return this.svgWidth/2+4; })
                    .attr("y2", function(d) { return this.svgWidth/2+4; });*/  
    
    if(this.forceParam==-15){ 
    }                            

    
        lines.exit()
              .style("opacity", 1)
              .transition()
              .duration(3000)
              .style("opacity", 0)
              .remove();
              

        lines = newlines.merge(lines);
        //if(this.switch){
        lines
        .transition().duration(2000)
        .style("opacity", 1)
        .attr("stroke-width", (d)=> { return Math.sqrt(d.value-this.threshold); });
        //}
        //else{
            lines
        .transition().duration(2000)
        .style("opacity", 1)
        .attr("stroke-width", (d)=> { return Math.sqrt(d.value-this.threshold); });
        //}
        	 //.attr("class", "links");

        let circles;
        this.nodesData.sort((a,b)=>{
                  if (a.tag < b.tag) {
                    return -1;
                  }
                  if (a.tag > b.tag) {
                    return 1;
                  }
        })   
        if(this.switch){
          this.gAll.selectAll('.nodes').selectAll('circle').remove();
          circles = this.gAll.selectAll('.nodes').selectAll('circle')
                        .data(()=>{
                          if(this.forceParam==-15)
                            return this.nodes; //all 403 nodes
                          return this.nodesData;
                        });

          let newcircles = circles.enter().append('circle')
                                  .style("opacity", (d)=>{
                                    if(this.forceParam==-15)
                                      return 0;
                                    else
                                      return 1;
                                  })
                                  .attr("r", (d)=>{
                                     if(this.forceParam!=-15)
                                      return 8
                                     if(d.value>0)
                                      return this.rScale(d.value);
                                     return 8
                                  })
                                  .classed("visible",(d)=>{
                                    if(this.forceParam==-15){
                                      if(this.nodesData.includes(d)){
                                          return true;
                                      }
                                      return false;
                                    }
                                    else
                                      return true;
                                  });

          circles.exit()
              .style("opacity", 1)
              .transition()
              .duration(1500)
              .style("opacity", 0)
              .remove();

        circles =  newcircles.merge(circles); 
        //circles = circles.enter().append('circle').merge(circles);
        
        circles
        .transition().duration(3000)
        .attr("fill", (d)=> { return this.colorScale(d.groupid); })
        .style("opacity", (d)=>{
                if(this.forceParam==-15)
                    if(this.nodesData.includes(d))
                      return 1;
                    else
                      return 0;
                else 
                  return 1;
            }); 
             

        }
        else{
         circles = this.gAll.selectAll('.nodes').selectAll('circle');
                        //.data(this.nodesData);
                        //.data(this.nodes);
                        //
          let i=0;
          circles.classed("visible",(d)=>{
                                    if(this.nodesData.includes(d)){
                                          i++;
                                          return true;
                                      }
                                      return false;
                                  })
                  .transition().duration(2000)
                  .attr("r", (d)=>{
                     if(d.value>0)
                      return this.rScale(d.value);
                     return 8
                  })
                  .style("opacity", (d)=>{
                                    if(this.nodesData.includes(d))
                                      return 1;
                                    return 0;
                                  });     

        }   
        
        
        this.svg.select('.centerTag').remove();
        if(this.forceParam==-15){    
              this.svg.append('text')
                  .attr('dy','2.0em')  
                  .attr("x", 20)
                  .attr('y',10)
                  .classed('centerTag',true)
                  .text("Center: "+this.selectedTag);
        }
        

        circles
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));	                     

		//tooltip
				d3.selectAll('.d3-tip').remove();
				this.circletip = d3.tip().attr('class', 'd3-tip')
                .direction((d)=>{
                  return 'sw'
                  //if(d['fromcloud']!=undefined) return 'sw'
                  //return 'se'
                })
                
                .offset((d)=> {
                    if(d['fromcloud']!=undefined){
                      let uppershift = d3.select("#networkChart").node().getBoundingClientRect();
                      //console.log('uppershift: ' + uppershift.y)
                      let cloudW = d3.select("#tagCloud").node().getBoundingClientRect().width;
                      //console.log('cloudW: ' + cloudW)
                      //console.log('d3.event.pageX: ' + d3.event.pageX);
                      //console.log('d3.event.pageY: ' + d3.event.pageY);
                      let radius = this.forceParam == -15? this.rScale(d.value)*2:16;

                      let xshift = 500;
                      let offsetx = cloudW + d.x - d3.event.pageX + d['xshift'];//d3.event.pageX;
                      let yshift = this.forceParam == -15? 630:630;
                      let offsety = radius + uppershift.y + d.y - d3.event.pageY - d['yshift'];
                      //console.log('offsetX: ' + offsetx);
                      //console.log('offsety: ' + offsety);
                      return [offsety,offsetx]//[d.x,d.y]
                    }
                    return [0,0]
                })
                .html((d)=>{
                  let tooltip_data;
                  let dvalue = d.value;
                  if(this.forceParam != -15){
                    let relatedLine = this.linksData.filter((l)=>{
                      return l.source.tag == d.tag || l.target.tag == d.tag;
                    });
                    let rank = relatedLine.map((l)=>{
                        let tagName;
                        let gid;
                        if(l.source.tag==d.tag){
                          tagName = l.target.tag;
                          gid = l.target.groupid;
                        }
                        else{
                          tagName = l.source.tag;
                          gid = l.source.groupid;
                        }
                        return{
                          "tag": tagName,
                          "value":l.value,
                          "groupid":gid
                        }
                    });

                    rank.sort((a,b)=>{
                      return(b.value - a.value); 
                    });
                    //console.log(rank);
                    let top5 = rank.slice(0,5);
                    //console.log(top5);

                    tooltip_data = {
                        "tag": d.tag,
                        "groupid":d.groupid,
                        "color":this.colorScale(d.groupid),
                        "top5":top5
                      };

                  }
                  else{
                    tooltip_data = {
                        "tag": d.tag,
                        "groupid":d.groupid,
                        "color":this.colorScale(d.groupid),
                        "value":d.value
                        /*
                        "result":[
                          {"nominee": d.D_Nominee_prop,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
                          {"nominee": d.R_Nominee_prop,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
                          {"nominee": d.I_Nominee_prop,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
                         ]
                         */
                      };
                  }    
                  return this.circle_tooltip_render(tooltip_data);
        });
        /*        
        .style("left", ()=>{
          if(d['fromcloud']!=undefined)
            return d.x
          return 0;
        })     
        .style("top", (d)=>{
          if(d['fromcloud']!=undefined)
            return d.y+400
        });*/

			  this.svg.call(this.circletip);
        
        let clickstate = 1;
        let self = this;
        if(this.forceParam != -15){    
            circles.on('mouseover', function(d){
                      d3.select(this).classed('selected',true)
                      .attr('r',(d)=>{
                        return 12;
                      });
                      self.circletip.show(d)
                    })
                    .on('mouseout', function(d){
                      d3.select(this).classed('selected',false)
                      .attr('r',(d)=>{
                        return 8;
                      })
                      self.circletip.hide(d)
                    })
                    .on('dblclick',(d)=>{
                    	//console.log(d.tag);
                      clickstate = 0;
    					         this.selectOneNode(d.tag,d.x,d.y);
    				        })
          					.on('click',(d)=>{
          					// when click, add tag in to buttons
          					//console.log(d.tag);
                    clickstate=1;
                      setTimeout(()=>{
                        if(clickstate==1)
                          addButton(d.tag);
                        }, 400);
          					
          					});
        }
        else{
             circles = this.gAll.selectAll('.nodes').selectAll('.visible')
                    .on('mouseover', function(d){
                      let rsize = d3.select(this).attr('r');
                      //console.log('rsize: '+rsize);
                      d3.select(this).classed('selected',true)
                      .attr('r',(d)=>{
                        return +rsize+4;
                      });
                      self.circletip.show(d)
                    })
                    .on('mouseout', function(d){
                      let rsize = d3.select(this).attr('r');
                      d3.select(this).classed('selected',false)
                      .attr('r',(d)=>{
                        return +rsize-4;
                      });
                      self.circletip.hide(d)
                    })
                    .on('dblclick',(d)=>{
                      //console.log(d.tag);
                      clickstate = 0;
                      this.selectOneNode(d.tag,d.x,d.y);
                		})
          					.on('click',(d)=>{
          					// when click, add tag in to buttons
          					clickstate=1;
                      setTimeout(()=>{
                        if(clickstate==1)
                          addButton(d.tag);
                        }, 400);
          					});
        }

			  simulation
			      .nodes(this.nodesData)
			      .on("tick", ticked);

			  simulation.force("link")
			      .links(this.linksData);
 
            
			  function ticked() {
          /*
          if(!self.switch){
			    lines
			        .attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });
              //.style("opacity", 1)
              //.attr("stroke-width", (d)=> { return Math.sqrt(d.value-self.threshold); });

			    circles
			        .attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; });

          }
          else{
            */
            lines
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          circles
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
          //}    
			  }

        /*
        //zoom capabilities 
        let min_zoom = 0.5;
        let max_zoom = 7;

        var zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        zoom_handler(this.svg);

        function zoom_actions(){
            //this.gAll
            //  .attr("transform", d3.event.transform)
        }
        */

  }

  textHoverOn(tagName,xshift,yshift){
      let circles = this.gAll.selectAll('.nodes').selectAll('.visible').filter((d)=>{
        return d.tag==tagName;
      })._groups;

      let circle = circles[0][0];
      if(circle!=undefined){
        
        d3.select(circle).classed('selected',true);
        let data = circle.__data__;

        data['fromcloud'] = true;
        data['xshift'] = xshift;
        data['yshift'] = yshift;
        this.circletip.show(data);
      }
  }

  textHoverOff(tagName){
      this.gAll.selectAll('.nodes').selectAll('.visible').classed('selected',false);
      let circle = this.gAll.selectAll('.nodes').selectAll('.visible').filter((d)=>{
        return d.tag==tagName;
      })._groups[0][0];
      if(circle!=undefined){
        delete circle.__data__['fromcloud'];
        delete circle.__data__['xshift'];
        delete circle.__data__['yshift'];
        this.circletip.hide(circle.__data__);
      }  
  }     


};