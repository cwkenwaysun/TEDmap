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



    /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    tooltip_render(tooltip_data) {
        let text = "<h3>" + tooltip_data.headline + "</h3>";
        text += "<h4>Speaker: " + tooltip_data.speaker + "<h4>";
        text += "<h4>Has tags: ";
        tooltip_data.tags.split(",").forEach(function (element) {
            if (groupSet.has(element.toLowerCase())) {
                let pathColor;
                groupIDs.forEach(function (e) {
                    if (element.toLowerCase() == e.tag) {
                        pathColor = pathColorScale(e.groupid);
                        return true;
                    }
                }, this);
                text += "<font color='" + pathColor + "'>" + element + "  </font> ";
            }
        }, this);
        text += "</h4>";


        // <div class="radarChart2 col-md-8" style="display: inline-flex;"></div>
        text += "<div class='radarChart2' style='display: inline-flex;'></div>"
        text += "<h5>" + tooltip_data.description + "</h5>";
        text += "<p>Date: " + tooltip_data.date + "<p>";
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
        let rates = video.rates.sort(function (a, b) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });
        let sum = video.rates.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);
        let axes = [];
        rates.forEach(function (element) {
            let axis = {}
            axis["axis"] = element.name;
            axis["value"] = element.count / sum * 100;
            axes.push(axis);
        }, this);
        let data = [{
            "name": "  total: " + sum,
            "axes": axes
        }];
        //console.log(data);

        let radarChart = new RadarChart(".radarChart2", data);
    }


    /**
     * Remove old line charts and generate new ones.
     */
    update() {
        let tmp = this;
        let data = this.processData();
        //d3.select("#tablehead").classed('fixed-header',true);
        // Tooltips.


        // Remove table element.
        document.getElementById("videos").innerHTML = "";


        let videos = d3.select("#videos");
        data.forEach(function (element, i) {
            // Append a table row and some table data.
            let row = videos.append("tr");
            element.tags.split(",").forEach(function (e) {
                row.classed(tagName2Class(e), true)
            }, this);
            row.append("td").text(i);
            row.append("td").text(element.headline);
            row.append("td").text(element.speaker);
            row.append("td").text(element.views);

            // Mouseover: tooltip
            row.on('mouseover', function (d) {
                    tmp.tip.transition()
                        .duration(200)
                        .style("opacity", .9);

                    let coords = d3.mouse(this);
                    console.log(coords);
                    //let targetel = d3.event.target;
                    //console.log(targetel);
                    let height = d3.select(this).node().getBoundingClientRect().height;
                    //console.log(height);
                    let yshift = height - coords[1];

                    tmp.tip.html(tmp.tooltip_render(element))
                        .classed("col-md-4", true)
                        //.direction('sw')
                        .style("left", (d3.event.pageX - 535) + "px")
                        //.style("top", (d3.event.pageY - 380) + "px");
                        .style("top", (d3.event.pageY + yshift - 400) + "px");
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

        //if(i==0){
        //let rtd = row.selectAll('td');
        let firsttr = document.getElementById("myTable2");
        if (firsttr.getElementsByTagName("TR")[0] != null) {
            firsttr = firsttr.getElementsByTagName("TR")[0].getElementsByTagName("TD");
            for (let j = 0; j < 4; j++) {
                let afterwidth = firsttr[j].offsetWidth;
                console.log(afterwidth);
                //console.log(rtd._groups[0][j]);
                let thelem = document.getElementById("tablehead").getElementsByTagName("TH")[j];
                thelem.style.width = afterwidth + "px";
            }
        }
    };
}