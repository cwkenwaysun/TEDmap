//scripts.js

    function fetchJSONFile(path, callback) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
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
	fetchJSONFile('data/network_WO_TEDtag_v3.json', function(data) {
		let nwChart = new networkChart(data);
		nwChart.update();
	});
