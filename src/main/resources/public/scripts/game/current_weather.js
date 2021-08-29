// Vancouver Canada id=6173331
// Full url: 
// https://api.openweathermap.org/data/2.5/weather?id=6173331&appid=acd3aa9fee4665d2c593bd386e5e2787&units=metric
// Response is json

const api_url = 'https://api.openweathermap.org/data/2.5/weather?id=6173331&appid=acd3aa9fee4665d2c593bd386e5e2787&units=metric'

function getSunlight(sunrise, current_time, sunset) {
	if (current_time < sunrise || current_time > sunset) {
		return "night";
	}
	var dayfraction = (current_time - sunrise) / (sunset - sunrise);
	if (dayfraction < 0.66 && dayfraction > 0.33) {
		return "direct";
	}
	else {
		return "angled";
	}
}

function getCloudiness(cloud_percent) {
	if (cloud_percent < 33) {
		return "clear";
	}
	if (cloud_percent < 66) {
		return "cloudy";
	}
	else {
		return "overcast";
	}
}

// https://stackoverflow.com/questions/247483/http-get-request-in-javascript
function getBackgroundFileName() {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", api_url, false); // false for synchronous request
	xmlHttp.send(null);
	weather = JSON.parse(xmlHttp.responseText);

	var sunrise = weather["sys"]["sunrise"];
	var current_time = weather["dt"];
	var sunset = weather["sys"]["sunset"];
	var sunlight = getSunlight(sunrise, current_time, sunset);

	var clouds = getCloudiness(weather["clouds"]["all"]);

	if (sunlight == "night") {
		return "night";
	} else {
		return sunlight + "_" + clouds;
	}
}
