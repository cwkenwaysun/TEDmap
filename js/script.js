let tagsInfo;
let allData;
let buttons;
var groupSet = new Set();

let lineChart;
let table;


function addButton(tag) {
    /*let number_tag;

    //TODO: change tagsInfo to a hash map instead of an array.
    tagsInfo.forEach(function(element) {
        if (element.tagName == tag) {
            number_tag = element.idList.length;
        }
    }, this);
    groupSet.add(tag);
    lineChart.update();
    table.update();
    
    $("#buttons").append("<button class='btn btn-primary' type='button'>" + tag + "<span class='badge'>" + number_tag + "</span></button>");

    $("#buttons > button").click(function () {
        groupSet.delete(this.childNodes[0].textContent);
        $(this).remove();
        lineChart.update();
        table.update();
    });*/
    buttons.addButton(tag);
}

// read tags information data
d3.json("data/tags_info.json", function (data1) {
    tagsInfo = data1;
    d3.json("data/TED_Talks.json", function (data) {
        allData = data;
        //console.log(data);
        lineChart = new LineChart(tagsInfo, allData, groupSet);
        table = new Table(tagsInfo, allData, groupSet);
        buttons = new Buttons(lineChart, table, tagsInfo, groupSet);
    })
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

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("myTable2");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.getElementsByTagName("TR");
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (n == 0) {
                if (dir == "asc") {
                    if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (n == 0 && parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                }
            } else {
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}


// radar

var margin = {
        top: 50,
        right: 80,
        bottom: 50,
        left: 80
    },
    width = Math.min(700, window.innerWidth / 4) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom);

var data = [{
        name: 'Allocated budget',
        axes: [{
                axis: 'Sales',
                value: 42
            },
            {
                axis: 'Marketing',
                value: 20
            },
            {
                axis: 'Development',
                value: 60
            },
            {
                axis: 'Customer Support',
                value: 26
            },
            {
                axis: 'Information Technology',
                value: 35
            },
            {
                axis: 'Administration',
                value: 20
            }
        ]
    },
    {
        name: 'Actual Spending',
        axes: [{
                axis: 'Sales',
                value: 50
            },
            {
                axis: 'Marketing',
                value: 45
            },
            {
                axis: 'Development',
                value: 20
            },
            {
                axis: 'Customer Support',
                value: 20
            },
            {
                axis: 'Information Technology',
                value: 25
            },
            {
                axis: 'Administration',
                value: 23
            }
        ]
    }
];

var radarChartOptions2 = {
    w: 290,
    h: 350,
    margin: margin,
    maxValue: 60,
    levels: 6,
    roundStrokes: false,
    color: d3.scaleOrdinal().range(["#AFC52F", "#ff6600"]),
    format: '.0f',
    legend: {
        title: 'Organization XYZ',
        translateX: 100,
        translateY: 40
    },
    unit: '$'
};

// Draw the chart, get a reference the created svg element :
//let svg_radar2 = RadarChart(".radarChart2", data, radarChartOptions2);


//radar end

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

//call fetchJSONFile then build and render 
fetchJSONFile('data/network_WO_TEDtag_v5.json', function (data) {

    fetchJSONFile('data/TEDtag_frequency_v2.json', function (f) {
        let tcChart = new textCloudChart(f);
        let nwChart = new networkChart(data, tcChart);
        //tcChart.update();
        nwChart.update();
    });

});