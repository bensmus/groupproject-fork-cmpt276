var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var checkered = new Image();
var podium = new Image();
var character = new Image();

var radio_form = document.getElementById("radio_form");

var coin_disp = document.getElementById("coin_disp");
coin_disp.innerText = "Coins: " + coins;

checkered.src = "images/shop/checkered.png";
podium.src = "images/shop/podium.png";
character.src = characterFileName;  // <-- from shop.html inlined script

// The window load event executes a bit later when the complete page is fully loaded, 
// including all frames, objects and images.
$(window).on('load', function () {
	console.log("loaded");
	redraw();
});

function redraw() {
	ctx.clearRect(0, 0, 700, 700);
	ctx.filter = "sepia(30%) contrast(10%) brightness(150%)"
	ctx.drawImage(checkered, 100, 100, 600, 600, 0, 0, 700, 700);
	ctx.filter = "contrast(20%) sepia(30%) hue-rotate(200deg) brightness(70%)";
	ctx.drawImage(podium, 150, 550, 400, 100);
	ctx.filter = "none";
	ctx.drawImage(character, 220, 75);
}

var blue_radio = document.getElementById("blue_radio");
var green_radio = document.getElementById("green_radio");
var pink_radio = document.getElementById("pink_radio");
var noglasses_radio = document.getElementById("noglasses_radio");
var yesglasses_radio = document.getElementById("yesglasses_radio");

var last_unlocked_input = document.getElementById("lastUnlockedInput");
var green_unlock = document.getElementById("green_unlock");
var pink_unlock = document.getElementById("pink_unlock");
var glasses_unlock = document.getElementById("glasses_unlock");

$("input").change(function () {
	console.log("submit");
	radio_form.submit();
});

$("button").click(function () {  // buttons don't change, since they don't have a field
	console.log("submit");
	radio_form.submit();
});

blue_radio.onclick = function () {
	color = "blue";
}

green_radio.onclick = function () {
	color = "green";
}

pink_radio.onclick = function () {
	color = "pink";
}

noglasses_radio.onclick = function () {
	glasses = false;
}

yesglasses_radio.onclick = function () {
	glasses = true;
}

green_unlock.onclick = function () {
	last_unlocked_input.value = "green";
}

pink_unlock.onclick = function () {
	last_unlocked_input.value = "pink";
}

glasses_unlock.onclick = function () {
	last_unlocked_input.value = "glasses";
}

// Show radio/button/msg depending on unlocked array

var green_radio_class = document.getElementsByClassName("green_radio");
var pink_radio_class = document.getElementsByClassName("pink_radio");
var yesglasses_radio_class = document.getElementsByClassName("yesglasses_radio");
var green_insufficient = document.getElementById("green_insufficient");
var pink_insufficient = document.getElementById("pink_insufficient");
var glasses_insufficient = document.getElementById("glasses_insufficient");

if (unlocked.includes("green")) {
	for (let index = 0; index < green_radio_class.length; index++) {
		const element = green_radio_class[index];
		element.style.display = "inline";
	}
} else if (coins >= prices["green"]) {
	green_unlock.style.display = "inline";
} else {
	green_insufficient.style.display = "inline";
}

if (unlocked.includes("pink")) {
	for (let index = 0; index < pink_radio_class.length; index++) {
		const element = pink_radio_class[index];
		element.style.display = "inline";
	}
} else if (coins >= prices["pink"]) {
	pink_unlock.style.display = "inline";
} else {
	pink_insufficient.style.display = "inline";
}

if (unlocked.includes("glasses")) {
	for (let index = 0; index < yesglasses_radio_class.length; index++) {
		const element = yesglasses_radio_class[index];
		element.style.display = "inline";
	}
} else if (coins >= prices["glasses"]) {
	glasses_unlock.style.display = "inline";
} else {
	glasses_insufficient.style.display = "inline";
}
