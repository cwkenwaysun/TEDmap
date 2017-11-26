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

            //TODO: beautify it
            //$("#buttons").append("<button class='btn btn-primary' type='button'>" + tag + " <span class='badge'>" + number_tag + "</span></button>");
            $("#buttons").append("<li role='presentation'><a href='#'>" + tag + " <span class='badge'>" + number_tag + "</span></a></li>")

            let tmp = this;
            $("#buttons > li").click(function () {
                //console.log(this.childNodes[0].childNodes[0].textContent.trim());
                tmp.removeButton(this.childNodes[0].childNodes[0].textContent.trim());
                $(this).remove();
            });

            //TODO: add hover

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