//https://github.com/jasondavies/d3-cloud

class textCloudChart {

    /**
     * Constructor for text cloud chart
     * @param   data network data, including links and nodes.
     */
    constructor (data, networkChart) {
        this.networkChart = networkChart;
        this.freqData = data;
     
        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 20};
        let divnwChart = d3.select("#tagCloud").classed("content", true);

        //fetch the svg bounds
        this.svgBounds = divnwChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 450;

        //add the svg to the div
        this.svg = divnwChart.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
            .attr("class", "wordcloud");

        this.colorScale = d3.scaleOrdinal() //ten colors
                  .domain(d3.range(0,9))
                  .range(['#1f77b4','#d448ce','#edaf6d','#f492a8','#965628','#3e8934','#21c2ce','#070cc2','#70c32a','#e9272a']);  
                  //[blue, Magenta, olive, Teal, brown, dark green, purple, Navy, green, Red]
        this.textScale = d3.scaleOrdinal() //ten colors
                  .domain(['exploration','society','computers','health','brain','culture','design','relationships','future','other'])
                  .range(d3.range(0,10));  
          
        this.selectedId = 1;
        this.selectedCategory = "society";
        
        divnwChart.selectAll('li').on('click',(d,i,object)=>{
            this.selectedCategory = d3.select(object[i]).text();
            this.selectedId = this.textScale(this.selectedCategory); 
            this.update();
        });

        this.gtext = this.svg.append("g")
                    .attr("transform", "translate("+this.svgWidth/2+","+ this.svgHeight/2+")");

        this.cloud = d3.layout.cloud().size([this.svgWidth, 425]);

        let maxT = 60;
        this.sizeScale = d3.scaleLinear()
                        .domain([1, 2386])
                        .range([8, maxT]); 
        this.networkChart.update();
        this.update();                


    };

    updateButton() {
        d3.select("#tagCloud").selectAll('li')
        .classed('active',(d,i,object)=>{
          let obj = d3.select(object[i]).select('a');
            let t = d3.select(object[i]).text();
            if(t==this.selectedCategory){
              obj.style('border-color',()=>{return this.colorScale(this.selectedId)})
                  .style('border-bottom-color',"transparent");
              return true;
            }
            else {
              obj.style('border-color',"transparent");
               // .style('border-bottom-color',"transparent");
              return false;
            }

        });
        d3.select('#ulid').style('border-bottom-color',()=>{return this.colorScale(this.selectedId)});
    }
    /**
     * call by networkChart
     */
    setColor() {
        //this.colorScale = colscale;
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

    let gdata = this.freqData.filter((d)=>{
            return d.groupid==this.selectedId;
        }) 
    //console.log(this.selectedId); 
    this.updateButton();
    this.gtext.selectAll(".incloud").remove();
                
                              
    this.cloud
            .words(gdata)
            .rotate(0)
            .padding(3)
            .spiral('archimedean')
            .text((d)=>{ return d.tag; })
            .fontSize((d)=> { return this.sizeScale(d.frequency)+10 });
                  
    let self = this;
    let clickstate = 1;        
    this.cloud.on("end", (words)=>{
        
        let alltext = this.gtext.selectAll(".incloud").data(gdata);

        let textshown = alltext.enter().append("text")
                .style("font-size", (d)=> { return this.sizeScale(d.frequency) + "px"; })
                .style("fill", (d)=>{ 
                  return this.colorScale(d.groupid);
                })
                .attr('class','incloud')
                .attr('opacity',0)
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.tag; })
                .transition().duration(1500)
                .style("opacity", 1);

        this.gtext.selectAll(".incloud")
              .on('click',(d)=>{
                    clickstate=1;
                      setTimeout(()=>{
                        if(clickstate==1) {
                            console.log(d.tag);
                          addButton(d.tag);
                        }
                        }, 400);
                })
              .on('dblclick',(d)=>{
                    clickstate = 0;
                    this.networkChart.selectOneNode(d.tag,0,0);
                })
                .on('mouseover', function(d){
                      var coords = d3.mouse(this);
                      let targetel = d3.event.target;
                      let tbbox      = targetel.getBBox();
                      let xshift = tbbox.width/2 + coords[0];
                      let yshift = tbbox.height/2 - coords[1];
                      //console.log('tbbox: h'+ tbbox.height + "tbbox: w: "+ tbbox.width);
                      //console.log(coords);
                      //console.log('yshift: '+yshift);
                      d3.select(this).style('opacity',0.5)
                      .classed('hoverOn',true);
                      let t = d3.select(this).text();
                      self.networkChart.textHoverOn(t,xshift,yshift);
                })
                .on('mouseout', function(d){
                  d3.select(this).style('opacity',1).classed('hoverOn',false);
                    let t = d3.select(this).text();
                      self.networkChart.textHoverOff(t);

                });      
    });


    this.cloud.start();


  }     


};