class Buttons {

    /**
     * Constructor for the Year Chart
     *
     * @param groupSet data corresponding to the tag buttons
     * @param lineChart reference to LineChart object
     * @param table reference to Table object
     */
    constructor(lineChartObj, tableObj, tagsInfo, groupSet) {

        this.groupSet = groupSet;
        this.lineChart = lineChartObj;
        this.table = tableObj;
        this.tagsInfo = tagsInfo;

    };

    /**
     * Update other elements in the webpage.
     */
    update() {
        this.lineChart.update();
        this.table.update();
    }


    /**
     * Insert a button to groupSet.
     */
    addButton(tag) {
        // if groupset exist tag print warning
        let number_tag;

        //TODO: change tagsInfo to a hash map instead of an array.
        tagsInfo.forEach(function (element) {
            if (element.tagName == tag) {
                number_tag = element.idList.length;
            }
        }, this);
        // TODO end

        if (this.groupSet.has(tag)) {
            console.warn(tag + " is already in the set.");
        } else {
            this.groupSet.add(tag);

            tag.fontcolor("green");


            let pathColor;
            groupIDs.forEach(function (element) {
                if (tag == element.tag) {
                    pathColor = pathColorScale(element.groupid);
                    return true;
                }
            }, this);

            let button = $("#buttons").append("<button type='button' class='btn btn-primary' style='background:" + pathColor + "'>" + tag + " <span class='badge' style='color:" + pathColor + "'>" + number_tag + "</span></button>");

            // TODO: may be redundent here.
            let tmp = this;
            $("#buttons > button").click(function () {
                //console.log(this.childNodes[0].childNodes[0].textContent.trim());
                $(this).remove();
                tmp.removeButton(this.childNodes[0].textContent.trim());
            });

            // TODO: may be redundent here.
            $("#buttons > button").mouseover(function () {
                let tag = this.childNodes[0].textContent.trim();
                console.log(tag);
                $("." + tagName2Class(tag)).addClass("highlighted");
                $("tr > ." + tagName2Class(tag)).addClass("highlighted");
                //tmp.removeButton(this.childNodes[0].childNodes[0].textContent.trim());
                //$(this).remove();
            });
            $("#buttons > button").mouseout(function () {
                $(".highlighted").removeClass("highlighted");
            });

            this.update();
        }
    }


    /**
     * Remove a button from groupSet.
     */
    removeButton(tag) {
        // if groupset not exist tag print warnig
        //console.log(tag);
        this.groupSet.delete(tag);
        //console.log(groupSet);
        this.update();
    }
}