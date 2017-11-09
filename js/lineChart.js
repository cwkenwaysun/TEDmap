class LineChart {

    /**
     * Constructor for the Year Chart
     *
     * @param electoralVoteChart instance of ElectoralVoteChart
     * @param tileChart instance of TileChart
     * @param votePercentageChart instance of Vote Percentage Chart
     * @param electionInfo instance of ElectionInfo
     * @param electionWinners data corresponding to the winning parties over mutiple election years
     * 
     * @param tagsInfo data corresponding to the winning parties over mutiple election years
     * @param allData data corresponding to the winning parties over mutiple election years
     * @param groupSet data corresponding to the winning parties over mutiple election years
     */
    constructor(tagsInfo, allData, groupSet) {

        this.tagsInfo = tagsInfo;
        this.allData = allData;
        this.groupSet = groupSet;
        console.log(this.allData);
        /*//Creating YearChart instance
        this.electoralVoteChart = electoralVoteChart;
        this.tileChart = tileChart;
        this.votePercentageChart = votePercentageChart;
        // the data
        this.electionWinners = electionWinners;

        // Initializes the svg elements required for this chart
        this.margin = {
            top: 10,
            right: 20,
            bottom: 30,
            left: 50
        };
        let divyearChart = d3.select("#year-chart").classed("fullView", true);

        //fetch the svg bounds
        this.svgBounds = divyearChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 100;

        //add the svg to the div
        this.svg = divyearChart.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)*/
    };


    /**
     * Returns the class that needs to be assigned to an element.
     *
     * @param party an ID for the party that is being referred to.
     */
    chooseClass(data) {
        if (data == "R") {
            return "yearChart republican";
        } else if (data == "D") {
            return "yearChart democrat";
        } else if (data == "I") {
            return "yearChart independent";
        }
    }

    /**
     * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
     */
    update() {
        let lines = [];
        console.log(this.allData);
        console.log(groupSet);
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
            //console.log(tmp);
            lines.push(tmp);
        }
        console.log(lines);
        //var data = lines;
        var data = d3.map(lines);
        console.log(data);
        /*.map(function(d) {
                    console.log(d);
                    return {
                        tagName: d.tagName,
                        values: lines.map(function(e) {
                            return {"year": e.year, "video": e.video};
                        })
                    };
                });*/

        var svg = d3.select("svg"),
            margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var parseTime = d3.timeParse("%Y");


        /*data.sort(function (a, b) {
            return parseTime(a.year) - parseTime(b.year);
        });*/

        var x = d3.scaleTime()
            .rangeRound([0, width])
            .domain([parseTime("2001"), parseTime("2017")]);

        var y = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([0, d3.max(lines, function (d) {
                return d3.max(d.values, function (e) {
                    return e.video;
                });
            })]);
        /*var y = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([0, d3.max(data, function (d) {
                console.log(d.video);
                return d.video;
            })]);*/

        //var z = d3.scaleOrdinal(d3.schemeCategory10);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("video");

        /*let line = g.selectAll(".lineChart")
            .data(data)
            .enter().append("g")
            .attr("class", "lineChart");*/

        for (var i = 0; i < lines.length; i++) {
            console.log(lines[i].values);
            g.append("path")
                .datum(lines[i].values)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    //.curve(d3.curveBasis)
                    .x(function (d) {
                        return x(parseTime(d.years));
                    })
                    .y(function (d) {
                        return y(d.video);
                    }));
        }
        /*d3.tsv("./data.tsv", function (d) {
            //console.log(d);
            d.date = parseTime(d.date);
            d.close = +d.close;
            return d;
        }, function (error, data) {
            if (error) throw error;

            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
            y.domain(d3.extent(data, function (d) {
                return d.close;
            }));

            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .select(".domain")
                .remove();

            g.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Price ($)");

            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        });*/
    }
}