class LineChart {

    /**
     * Constructor for the Year Chart
     *
     * @param tagsInfo tag data corresponding to the videos, from tags_info.json
     * @param allData all of data in TED_Talks.json
     * @param groupSet data corresponding to the tag buttons
     */
    constructor(tagsInfo, allData, groupSet) {

        d3.select("#lineChart").attr("width", window.window.innerWidth*0.5);
        this.tagsInfo = tagsInfo;
        this.allData = allData;
        this.groupSet = groupSet;

        this.margin = {
            top: 20,
            right: 150,
            bottom: 30,
            left: 30
        };

    };


    /**
     * Returns the d3 map data from the group set.
     */
    processData() {
        let lines = [];
        for (let target of groupSet) {
            let tmp = {}
            for (let tag of tagsInfo) {
                if (target == tag["tagName"]) {
                    tmp["tagName"] = tag["tagName"];
                    tmp["values"] = [];
                    for (let i = 0; i < 17; i++) {
                        tmp["values"].push({
                            "years": (2001 + i).toString(),
                            "video": 0
                        });
                    }
                    for (let targetId of tag["idList"]) {
                        for (let allId of this.allData) {
                            if (targetId == allId["id"]) {
                                // int can be iterator when index by string?
                                let year = parseInt(allId["date"].slice(0, 4)) - 2001;
                                tmp["values"][year]["video"]++;
                            }
                        }
                    }
                }
            }
            lines.push(tmp);
        }
        return lines;
    }

    /**
     * Remove old line charts and generate new ones.
     */
    update() {
        let data = this.processData();
        console.log(data);

        let svg = d3.select("#lineChart");
        let width = svg.attr("width") - this.margin.left - this.margin.right;
        let height = svg.attr("height") - this.margin.top - this.margin.bottom;
        let g = svg.select("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        let parseTime = d3.timeParse("%Y");

        // create multi-line line chart
        let xScale = d3.scaleTime()
            .rangeRound([0, width])
            .domain([parseTime("2001"), parseTime("2017")]);

        let yScale = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([0, d3.max(data, function (d) {
                return d3.max(d.values, function (e) {
                    return e.video;
                });
            })]);

        let xAxis = d3.axisBottom()
            .scale(xScale);

        let yAxis = d3.axisLeft()
            .scale(yScale);

        let xAxisGroup = d3.select("#xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        d3.select("#yAxis > text").remove();
        let yAxisGroup = d3.select("#yAxis")
            .call(yAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("x", 15)
            .attr("y", -16)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("video");


        let line = d3.selectAll("#lines > path")
        line.remove();
        d3.selectAll("#lines > text").remove();
        d3.selectAll("#lines > line").remove();


        // add symbol to line path
        let shapes = [d3.symbolCircle,
            d3.symbolTriangle,
            d3.symbolDiamond,
            d3.symbolSquare,
            d3.symbolStar,
            d3.symbolCross,
            d3.symbolWye
        ];

        let symbol = function (i) {
            return d3.symbol().size(100).type(shapes[i]);
        }

        for (let i = 0; i < data.length; i++) {

            //console.log(groupIDs);
            //console.log(pathColorScale(1));
            //console.log(data[i].tagName);
            console.log(data[i].tagName);
           

            for (let j = 0; j < data[i].values.length; j++) {
                g.append("path")
                    .datum(data[i].values[j])
                    .attr("class", "symbols")
                    .attr("fill", tagColorHash[data[i].tagName])
                    .attr("stroke", tagColorHash[data[i].tagName])
                    .attr("d", symbol(i % 7))
                    .attr("transform", function (d) {
                        return "translate(" + xScale(parseTime(d.years)) + "," + yScale(d.video) + ")";
                    })
                    .classed(tagName2Class(data[i].tagName), true)
                    .on('mouseover', function (d) {
                        $("." + tagName2Class(data[i].tagName)).addClass("highlighted");
                    })
                    .on('mouseout', function (d) {
                        $(".highlighted").removeClass("highlighted");
                    })
            }

            g.append("path")
                .datum(data[i].values)
                .attr("fill", "none")
                .attr("stroke", tagColorHash[data[i].tagName])
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 2)
                .classed(tagName2Class(data[i].tagName), true)
                .attr("d", d3.line()
                    //.curve(d3.curveBasis)
                    .x(function (d) {
                        return xScale(parseTime(d.years));
                    })
                    .y(function (d) {
                        return yScale(d.video);
                    }))
                    .on('mouseover', function (d) {
                        $("." + tagName2Class(data[i].tagName)).addClass("highlighted");
                    })
                    .on('mouseout', function (d) {
                        $(".highlighted").removeClass("highlighted");
                    })

            //console.log(data[i]);
            g.append("text")
                .attr("transform", "translate(" + (width + 45) + "," + (20 * i) + ")")
                .text(data[i].tagName)
                .classed(tagName2Class(data[i].tagName), true);
            g.append("line")
                .attr("x1", width+10)
                .attr("x2", width+40)
                .attr("y1", -4+i*20)
                .attr("y2", -4+i*20)
                .attr("stroke", tagColorHash[data[i].tagName])
                .attr("stroke-width", 2)
                .classed(tagName2Class(data[i].tagName), true);
            //.attr("transform", "translate(" + (width + 10) + "," + (20 * i) + ")")
            //.text(data[i].tagName)
            g.append("path")
                .attr("fill", tagColorHash[data[i].tagName])
                .attr("stroke", tagColorHash[data[i].tagName])
                .attr("d", symbol(i % 7))
                .attr("transform", "translate(" + (width + 25) + "," + (20 * i-4) + ")")
                .classed(tagName2Class(data[i].tagName), true);

        }
    }
}