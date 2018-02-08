let tagsInfo;
let allData;
let buttons;
let groupSet;

let lineChart;
let table;
var groupIDs;

var tagColorHash = {}; // used in color of buttons
var tagVideoCount = {}; // used in badges in buttons

// local to groupset
const localGroupSet = JSON.parse(localStorage.getItem('TEDmapButtons'));
console.log(localGroupSet);
groupSet = (localGroupSet && new Set(localGroupSet)) || new Set();
console.log("groupSet: " + Array.from(groupSet));

updateButtons();

// clear
document.querySelector('#clearButtons').addEventListener('click', function() {
    console.log('clear event');
    // groupSet.clear();
    localStorage.setItem('TEDmapButtons', JSON.stringify([]));
    //call update button
    groupSet.clear();
    updateButtons();
    console.log(localStorage.getItem('TEDmapButtons'));
})

function addButton(tag){
    console.log(tag);
    groupSet.add(tag); 
    localStorage.setItem('TEDmapButtons', JSON.stringify([...Array.from(groupSet)]));
        updateButtons();
}

function updateButtons() {
    const buttons = document.querySelector('#buttons');
    buttons.innerHTML = Array.from(groupSet).map((tag, i) => {
        return `
            <button type='button' class='btn btn-primary' style='background:${tagColorHash[tag]}'> 
            ${tag} <span class='badge' style='color:${tagColorHash[tag]}'>${tagVideoCount[tag]}</span></button>
        `;
    }).join('');
    document.querySelectorAll('#buttons > button').forEach(button => button.addEventListener('click', function() {
        // groupset to local
        console.log(this.childNodes[0].textContent.trim());
        groupSet.delete(this.childNodes[0].textContent.trim());
        localStorage.setItem('TEDmapButtons', JSON.stringify([...Array.from(groupSet)]));
        updateButtons();
    }));

    // TODO: add mouseover event
    // $("#buttons > button").mouseover(function () {
    //     let tag = this.childNodes[0].textContent.trim();
    //     //console.log(tag);
    //     $("." + tagName2Class(tag)).addClass("highlighted");
    //     $("tr > ." + tagName2Class(tag)).addClass("highlighted");
    //     //tmp.removeButton(this.childNodes[0].childNodes[0].textContent.trim());
    //     //$(this).remove();
    // });
    // $("#buttons > button").mouseout(function () {
    //     $(".highlighted").removeClass("highlighted");
    // });

    // TODO: connect with table and lineChart
}






// read tags information data
d3.json("data/tags_info.json", function (data1) {
    tagsInfo = data1;
    console.log('tagsInfo:');
    console.log(tagsInfo);
    tagsInfo.map((e) => tagVideoCount[e.tagName] = e.idList.length);

    //call fetchJSONFile then build and render 
    //data/network_WO_TEDtag_v5.json
    fetchJSONFile('data/network_per_year.json', function (data2) {
        groupIDs = data2.nodes;
        console.log('groupIDs');
        console.log(groupIDs);
        groupIDs.map((e) => tagColorHash[e.tag] = colorScale(e.groupid));
        //console.log(tagColorHash);
        fetchJSONFile('data/TEDtag_frequency_v2.json', function (f) {
            let nwChart = new networkChart(data2);
            let tcChart = new textCloudChart(f, nwChart);
            tcChart.update();
            //nwChart.update();
            d3.json("data/TED_Talks.json", function (data) {
                console.log('AllData');
                console.log(data);
                
                allData = data;
                //console.log(data);
                lineChart = new LineChart(tagsInfo, allData, groupSet);
                table = new Table(tagsInfo, allData, groupSet);
                //buttons = new Buttons(lineChart, table, tagsInfo, groupSet);
            })
        });
    });
})

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



const colorScale = d3.scaleOrdinal() //ten colors
    .domain(d3.range(0, 9))
    .range(['#1f77b4', '#d448ce', '#edaf6d', '#f492a8', '#965628', '#3e8934', '#21c2ce', '#070cc2', '#70c32a', '#e9272a']);
//[blue, Magenta, olive, Teal, brown, dark green, purple, Navy, green, Red]