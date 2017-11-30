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
        this.svgHeight = 350;

        //add the svg to the div
        this.svg = divnwChart.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
            .attr("class", "wordcloud");

        this.colorScale = d3.scaleOrdinal() //ten colors
                  .domain(d3.range(0,9))
                  .range(['#1f77b4','#d448ce','#e7ce16','#21c2ce','#965628','#1a6111','#54107a','#070cc2','#70c32a','#e9272a']);  
                  //[blue, Magenta, olive, Teal, brown, dark green, purple, Navy, green, Red]
        this.textScale = d3.scaleOrdinal() //ten colors
                  .domain(['exploration','society','computers','health','brain','culture','design','relationships','future','other'])
                  .range(d3.range(0,10));  
          
        this.selectedId = 0;
        this.selectedCategory = "exploration";
        
        divnwChart.selectAll('li').on('click',(d,i,object)=>{
            this.selectedCategory = d3.select(object[i]).text();
            this.selectedId = this.textScale(this.selectedCategory); 
            this.update();
        });
        /*
        .on('mouseover', function(d){
                      let t = d3.select(this).text();
                      d3.select(this)
                      .style('background-color',()=>{
                        return self.colorScale(self.textScale(t))
                      });
                      //.style("opacity","0.5");

                    })
        .on('mouseout', function(d){
                  if(d3.select(this).text()!=self.selectedCategory)
                      d3.select(this).style('background-color',"rgba(188, 188, 188, 1)");
        });
        */

        this.gtext = this.svg.append("g")
                    .attr("transform", "translate("+this.svgWidth/2+",175)");

        this.cloud = d3.layout.cloud().size([this.svgWidth, 325]);
        this.sizeScale = d3.scaleLinear()
                        .domain([1, 2386])
                        .range([8, 75]); 
        this.networkChart.update();
        this.update();                


    };

    updateButton() {
        d3.select("#tagCloud").selectAll('li')
        .classed('active',(d,i,object)=>{
            let t = d3.select(object[i]).text();
            if(t==this.selectedCategory)
              return true;
            return false;
            /*
            if(t==this.selectedCategory)
              return this.colorScale(this.textScale(t));
            else
              return "rgba(188, 188, 188, 1)"
            */
        });
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
                

    //this.cloud.stop();
    /*
    alltext.exit()
              .style("opacity", 1)
              .transition()
              .duration(1500)
              .style("opacity", 0)
              .remove();
              */
                              
    this.cloud
            .words(gdata)
            .rotate(0)
            .padding(2)
            .spiral('archimedean')
            .text((d)=>{ return d.tag; })
            .fontSize((d)=> { return this.sizeScale(d.frequency)+7 });
                  
    let self = this;
    let clickstate = 1;        
    this.cloud.on("end", (words)=>{
        
        let alltext = this.gtext.selectAll(".incloud").data(gdata);

        alltext.enter().append("text")
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
                .on('click',(d)=>{
                    clickstate=1;
                      setTimeout(()=>{
                        if(clickstate==1)
                          addButton(d.tag);
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
                      let xshift = tbbox.width/2 - coords[0];
                      let yshift = tbbox.height/2 - coords[1];
                      //console.log(coords);
                      d3.select(this).style('opacity',0.5);
                      let t = d3.select(this).text();
                      self.networkChart.textHoverOn(t,xshift,yshift);
                })
                .on('mouseout', function(d){
                  d3.select(this).style('opacity',1);
                    let t = d3.select(this).text();
                      self.networkChart.textHoverOff(t);

                })
                .transition().duration(1500)
                .style("opacity", 1);       
    });


    this.cloud.start();


  }     


};