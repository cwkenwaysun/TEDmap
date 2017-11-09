let tagsInfo;
let allData;
var groupSet = new Set();

let lineChart;

// read tags information data
d3.json("tags_info.json", function (data) {
    tagsInfo = data;
    console.log(data);
})

d3.json("TED_Talks.json", function (data) {
    allData = data;
    console.log(data);
    lineChart = new LineChart(tagsInfo, allData, groupSet);
})

$.getJSON("all_tags.json", function (json) {
    console.log(json["all_tags"]);
    for (let i = 0; i < json["all_tags"].length; i++) {
        if (json["all_tags"][i] == "alzheimer's") continue;
        $(".dropdown-menu").append("<li id='force_" + json["all_tags"][i] + "' ><a href='#'>" + json["all_tags"][i] + "</a></li>");
        $("#force_" + json["all_tags"][i]).click(function () {
            groupSet.add(json["all_tags"][i]);
            lineChart.update();
            $("#buttons").append("<button class='btn btn-primary' type='button'>" + json["all_tags"][i] + "<span class='badge'>4</span></button>");

            $("#buttons > button").click(function () {
                console.log(this.textContent);
            });
        });
    }
});