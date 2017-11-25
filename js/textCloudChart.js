//https://github.com/jasondavies/d3-cloud

class textCloudChart {

    /**
     * Constructor for text cloud chart
     * @param   data network data, including links and nodes.
     */
    constructor (data) {
        this.freqData = data;
     
        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
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

        this.colorScale = d3.scaleOrdinal(d3.schemeCategory20);   
        this.selectedId = 0;

        divnwChart.selectAll('.btn').on('click',(d,i,object)=>{
            let t = d3.select(object[i]).text();
            //console.log(t);
            this.selectedId = +t; 
            this.update();
        })

        this.gtext = this.svg.append("g")
                    .attr("transform", "translate("+this.svgWidth/2+",175)");

        this.cloud = d3.layout.cloud().size([this.svgWidth, 325]);
        this.sizeScale = d3.scaleLinear()
                        .domain([1, 2386])
                        .range([10, 100]);        

    };
    
    setColor(colscale) {
        this.colorScale = colscale;
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
    //console.log(gdata); 

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
            //.padding(0)
            .fontSize((d)=> { return this.sizeScale(d.frequency) });       

    this.cloud.on("end", (words)=>{
        
        let alltext = this.gtext.selectAll(".incloud").data(gdata);

        alltext.enter().append("text")
                .style("font-size", (d)=> { return this.sizeScale(d.frequency) + "px"; })
                .style("fill", (d)=>{ 
                  return this.colorScale(d.groupid) 
                  //return 'black';
                })
                .attr('class','incloud')
                .attr('opacity',0)
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.tag; })
                .transition().duration(1500)
                .style("opacity", 1); 

        //alltext.exit()
              //.style("opacity", 1)
              //.transition()
              //.duration(1500)
              //.style("opacity", 0)
        //      .remove();        

        //alltext = newtext.merge(alltext);

        //alltext
        //.transition().duration(3000)
        //.style("opacity", 1);        
    });


    this.cloud.start();


  }     


};