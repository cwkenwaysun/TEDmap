class Table {

    /**
     * Constructor for the Year Chart
     *
     * @param tagsInfo tag data corresponding to the videos, from tags_info.json
     * @param allData all of data in TED_Talks.json
     * @param groupSet data corresponding to the tag buttons
     */
    constructor(tagsInfo, allData, groupSet) {

        this.tagsInfo = tagsInfo;
        this.allData = allData;
        this.groupSet = groupSet;

        this.tip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }



    /**
     * Returns the d3 map data from the group set.
     */
    processData() {
        let lines = [];
        for (let targetTag of groupSet) {
            for (let allTag of tagsInfo) {
                if (targetTag == allTag["tagName"]) {
                    for (let targetId of allTag["idList"]) {
                        for (let allId of this.allData) {
                            if (targetId == allId["id"]) {
                                // if lines already has this element
                                let i = 0;
                                let inLines = 0;
                                for (; i < lines.length; i++) {
                                    if (lines[i].headline == allId.headline) {
                                        lines[i].weight++;
                                        inLines = 1;
                                        break;
                                    }
                                }

                                // if not, append to lines
                                if (inLines == 0) {
                                    let tmp = allId;
                                    tmp.weight = 1;
                                    if (lines.length == 0) {
                                        lines.push(tmp);
                                    } else {
                                        let i = 0;
                                        for (; i < lines.length; i++) {
                                            if (tmp.weight > lines[i].weight) continue;
                                            else if (tmp.weight == lines[i].weight) {
                                                if (tmp.date > lines[i].date) continue;
                                                else if (tmp.date == lines[i].date) {
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                        lines.splice(i, 0, tmp);
                                    }
                                } else {
                                    // remove
                                    let tmp = lines[i];
                                    lines.splice(i, 1);

                                    //append back to array
                                    let j = 0;
                                    for (; j < lines.length; j++) {
                                        if (tmp.weight > lines[j].weight) continue;
                                        else if (tmp.weight == lines[j].weight) {
                                            if (tmp.date > lines[j].date) continue;
                                            else if (tmp.date == lines[j].date) {
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                    lines.splice(j, 0, tmp);
                                }
                            }
                        }
                    }
                }
            }
        }
        return lines.reverse();
    }

    rightRoundedRect(x, y, width, height, radius) {
        return "M" + x + "," + y +
            "h" + (width - radius) +
            "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius +
            "v" + (height - 2 * radius) +
            "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius +
            "h" + (radius - width) +
            "z";
    };

    /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    tooltip_render(tooltip_data) {
        let text = "<h4>" + tooltip_data.headline + "</h4>";
        // <div class="radarChart2 col-md-8" style="display: inline-flex;"></div>
        text += "<div class='radarChart2' style='display: inline-flex;'></div>"
        //console.log(tooltip_data.rates);

        return text;
    }

    /*compare(a, b) {
        if (a.id < b.id)
            return -1;
        if (a.id > b.id)
            return 1;
        return 0;
    }*/

    drawRadar(video) {
        let rates = video.rates.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);});
        let sum = video.rates.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);
        let axes = [];
        rates.forEach(function(element) {
            let axis = {}
            axis["axis"] = element.name;
            axis["value"] = element.count/sum * 100;
            axes.push(axis);
        }, this);
        let data = [{"name": "  total: " + sum, "axes": axes}];
        //console.log(data);

        let radarChart = new RadarChart(".radarChart2", data);
    }


    /**
     * Remove old line charts and generate new ones.
     */
    update() {
        let tmp = this;
        let data = this.processData();
        console.log(data);
        //d3.select("#tablehead").classed('fixed-header',true);
        // Tooltips.


        // Remove table element.
        document.getElementById("videos").innerHTML = "";


        let videos = d3.select("#videos");
        data.forEach(function (element, i) {
            // Append a table row and some table data.
            let row = videos.append("tr");
            row.append("td").text(i);
            row.append("td").text(element.headline);
            row.append("td").text(element.date);
            row.append("td").text(element.weight);
            // Mouseover: tooltip
            row.on('mouseover', function (d) {
                    tmp.tip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tmp.tip.html(tmp.tooltip_render(element))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    tmp.drawRadar(element);
                })
                .on('mouseout', function (d) {
                    tmp.tip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })

                .on('click', (d) => {
                    let win = window.open(element.newURL, '_blank');
                    win.focus();
                });

        }, this);

        /*let videos = document.getElementById("videos");
        data.forEach(function (element, i) {
            console.log(element.rates);
            let row = videos.insertRow(0);
            row.insertCell(0).innerHTML = data.length - i;
            row.insertCell(1).innerHTML = element.headline;
            row.insertCell(2).innerHTML = element.date;
            row.insertCell(3).innerHTML = element.weight;
            console.log(row);
        }, this);*/

        /*let padding_x = 5;

        let barHeight = 60;

        let svg = d3.select("#table");
        console.log(svg);

        let binding = svg.selectAll("g")
            .data(data);

        console.log(binding);

        let enterG = binding.enter()
            .append("g")
        console.log(enterG);

    

        enterG.append("rect")
        //.attr("d", this.rightRoundedRect(-240, -120, 480, barHeight, 20));
            .attr("width", 600)
            .attr("height", barHeight - 1);

        enterG.append("a")
        .attr("xlink:href", (d) => d.newURL)
        .append("text")
        .attr("x", padding_x)
        .attr("y", barHeight / 3 * 1)
        .attr("class", "table_header")
        .text((d) => d.headline)

        enterG.append("text")
            .attr("x", padding_x)
            .attr("y", barHeight / 3 * 2  - 5)
            .text(function (d) {
                return "speaker: " + d.speaker;
            });

        enterG.append("text")
            .attr("x", padding_x)
            .attr("y", barHeight - 5)
            .text(function (d) {
                return "views: " + d.views;
            });


        binding.transition()
            .duration(1500)
            .attr("transform", function (d, i) {
                return "translate(0," + i * barHeight + ")";
            });
            */
    };
}