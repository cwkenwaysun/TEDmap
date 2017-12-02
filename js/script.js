let tagsInfo;
let allData;
let buttons;
var groupSet = new Set();

let lineChart;
let table;
var groupIDs;



function addButton(tag) {
    buttons.addButton(tag);
}

// read tags information data
d3.json("data/tags_info.json", function (data1) {
    tagsInfo = data1;

    //call fetchJSONFile then build and render 
    //data/network_WO_TEDtag_v5.json
    fetchJSONFile('data/network_per_year.json', function (data2) {
        groupIDs = data2.nodes;
        fetchJSONFile('data/TEDtag_frequency_v2.json', function (f) {
            let nwChart = new networkChart(data2);
            let tcChart = new textCloudChart(f, nwChart);
            tcChart.update();
            //nwChart.update();
            d3.json("data/TED_Talks.json", function (data) {
                allData = data;
                //console.log(data);
                lineChart = new LineChart(tagsInfo, allData, groupSet);
                table = new Table(tagsInfo, allData, groupSet);
                buttons = new Buttons(lineChart, table, tagsInfo, groupSet);
                addButton("innovation");
            })
        });

    });

})

// dropdown
/*$.getJSON("all_tags.json", function (json) {
    console.log(json["all_tags"]);
    for (let i = 0; i < json["all_tags"].length; i++) {
        if (json["all_tags"][i] == "alzheimer's") continue;
        $(".dropdown-menu").append("<li id='force_" + json["all_tags"][i] + "' ><a href='#'>" + json["all_tags"][i] + "</a></li>");
        $("#force_" + json["all_tags"][i]).click(function () {
            groupSet.add(json["all_tags"][i]);
            lineChart.update();
            table.update();
            $("#buttons").append("<button class='btn btn-primary' type='button'>" + json["all_tags"][i] + "<span class='badge'>4</span></button>");

            $("#buttons > button").click(function () {
                groupSet.delete(this.childNodes[0].textContent);
                $(this).remove();
                lineChart.update();
                table.update();
            });
        });
    }
});*/

var myTable = $("#myTable2");

$('#t_headline, #t_speaker')
    .wrapInner('<span title="sort this column"/>')
    .each(function () {

        var th = $(this),
            thIndex = th.index(),
            inverse = false;

        th.click(function () {

            myTable.find('td').filter(function () {

                return $(this).index() === thIndex;

            }).sortElements(function (a, b) {

                return $.text([a]) > $.text([b]) ?
                    inverse ? -1 : 1 :
                    inverse ? 1 : -1;

            }, function () {

                // parentNode is the element we want to move
                return this.parentNode;

            });

            inverse = !inverse;

        });

    });

$('#t_number, #t_views')
    .wrapInner('<span title="sort this column"/>')
    .each(function () {

        var th = $(this),
            thIndex = th.index(),
            inverse = false;

        th.click(function () {

            myTable.find('td').filter(function () {

                return $(this).index() === thIndex;

            }).sortElements(function (a, b) {
                return parseInt($.text([a])) < parseInt($.text([b])) ?
                    inverse ? -1 : 1 :
                    inverse ? 1 : -1;

            }, function () {

                // parentNode is the element we want to move
                return this.parentNode;

            });

            inverse = !inverse;

        });

    });

String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}

function tagName2Class(tagName) {
    return tagName.replaceAll(" ", "").replaceAll("'", "").toLowerCase();
}

function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                let data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}



var pathColorScale = d3.scaleOrdinal() //ten colors
    .domain(d3.range(0, 9))
    .range(['#1f77b4', '#d448ce', '#edaf6d', '#f492a8', '#965628', '#3e8934', '#21c2ce', '#070cc2', '#70c32a', '#e9272a']);
//[blue, Magenta, olive, Teal, brown, dark green, purple, Navy, green, Red]