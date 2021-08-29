var myGamePiece;
var myBackground;
var myObstacles = [];
var myScore;
var prevScore;
var myCoins;
var playing;
var platformThickness = 30;
var scrollSpeed;
var nextObs = 150;
var menuShow;
var menu;
var continueBtn;
var continueText;
var exitBtn;
var exitText;
var deathAudio = document.getElementById("deathAudio");

function setupGame() {                  //runs as soon as game page is loaded
	myGameArea.setup();
	myBackground = new component(900, 574, `./images/weather_backgrounds/${getBackgroundFileName()}.png`, 0, 0, "background");          //create background
	myBackground.speedX = 0;
	myBackground.update();                                                                          //draw background
	myGameArea.context.textAlign = "center";
	startText = new component("50px", "Consolas", "black", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2, "text");  //text on how to start game
	startText.text = "press Enter to start"
	startText.update()                          //draw the text
}
function startGame() {                          //when the user presses a key to start the game

	// spriteFileName is defined outside of this file- see the botom of game.html
	myGamePiece = new playerObj(54, 77, 10, 120, spriteFileName);        //create the player object

	myGamePiece.gravity = 0.15;                                     //set gravity intensity
	ctx.textAlign = "end";
	myScore = new component("20px", "Consolas", "black", 650, 20, "text");  //create where the score counter
	prevScore = new component("40px", "Consolas", "blue", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2 + 40, "text");  //create where the score counter
	myCoins = new component("20px", "Consolas", "black", 500, 20, "text");
	menu = new component(300, 200, "rgba(0, 0, 0, 0.5)", myGameArea.canvas.width / 2 - 150, myGameArea.canvas.height / 2 - 100, "rect");
	continueBtn = new component(100, 30, "#FFFFFF", myGameArea.canvas.width / 2 - 50, myGameArea.canvas.height / 2 - 75, "clickable_rect");
	continueText = new component("20px", "Consolas", "#FFFFFF", myGameArea.canvas.width / 2 + 43, myGameArea.canvas.height / 2 - 53, "text");
	exitBtn = new component(100, 30, "#FFFFFF", myGameArea.canvas.width / 2 - 50, myGameArea.canvas.height / 2 - 20, "clickable_rect");
	exitText = new component("20px", "Consolas", "#FFFFFF", myGameArea.canvas.width / 2 + 22, myGameArea.canvas.height / 2, "text");
	continueText.text = "Continue";
	exitText.text = "Exit";
	myGameArea.canvas.addEventListener('click', menuEvent)
	myGameArea.start();
	scrollSpeed = -2;                     //how fast the game scrolls
	myBackground.speedX = scrollSpeed;
}

function menuEvent(event) {
	if (playing && menuShow) {
		var x = event.clientX - myGameArea.canvas.getBoundingClientRect().left;
		var y = event.clientY - myGameArea.canvas.getBoundingClientRect().top;

		var clickComponent;
		myGameArea.clear();
		myGamePiece.update();
		myBackground.update();
		myGamePiece.update();
		for (var i = 0; i < myObstacles.length; i += 1) {
			myObstacles[i].update();
		}
		menu.update();
		continueBtn.update();
		if (myGameArea.context.isPointInPath(x, y)) {
			clickComponent = continueBtn;
		}
		continueText.update();
		exitBtn.update();
		if (myGameArea.context.isPointInPath(x, y)) {
			clickComponent = exitBtn;
		}
		exitText.update();

		if (clickComponent === continueBtn) {
			menuShow = false;
			myGamePiece.animation = true;
			myGameArea.interval = setInterval(updateGameArea, 20);
		} else if (clickComponent === exitBtn) {
			location.href = "/";
		}
	}
}

var myGameArea = {
	canvas: document.createElement("canvas"),
	setup: function () {                        //creates the canvas element when page is loaded
		playing = 0;
		this.canvas.width = 704;
		this.canvas.height = 396;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.querySelector("body > br"));
	},
	start: function () {
		playing = 1;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.frameNo = 0;
		myObstacles = [];
		myObstacles.push(new component(755, platformThickness, "green", 0, 0, "rect"));                 //create starting platform
		myObstacles.push(new component(755, platformThickness, "green", 0, myGameArea.canvas.height - platformThickness, "rect"));
		clearInterval(this.interval);
		this.interval = setInterval(updateGameArea, 20);        //start the main loop
	},
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);    //get rid of all the things on the canvas
	},
	stop: function () {
		if (!menuShow) {
			playing = 0;
		}
		clearInterval(this.interval);       //pauses the game
	}
}

function submitHs(un, hs, coins) {
	document.getElementById("un").value = un;
	document.getElementById("hs").value = hs;
	document.getElementById("coins").value = coins;
	playing = -1;
}

function submit() {
	if (playing == -1) {
		document.getElementById("submitForm").submit();
	}
}

function death() {               //when the player dies
	deathAudio.play();            // play audio when death
	myGameArea.stop();                                          //pause the game
	ctx.textAlign = "center";
	myScore.x = myGameArea.canvas.width / 2;
	myScore.width = "60px";
	myScore.y = myGameArea.canvas.height / 2 - 20;                     //center the score
	prevScore.y = myScore.y + 50
	if (highscore < myGameArea.frameNo) {//check if new high score
		myScore.text = "New High Score: " + myGameArea.frameNo;          //display the score
		prevScore.text = "Previous High Score: " + highscore;
		highscore = myGameArea.frameNo;
	} else {
		myScore.text = "Final Score: " + myGameArea.frameNo;          //display the score
		prevScore.text = "High Score: " + highscore;
	}
	submitHs(uname, highscore, coins);
	myScore.update();
	prevScore.update();
}

function updateGameArea() {                                             //main loop
	var x, height, gap, minHeight, maxHeight, minGap, maxGap;
	var hit = false;

	myGameArea.clear();             //clear the canvas 
	myGameArea.frameNo += 1;        //update frame
	myBackground.newPos();          //update background
	myBackground.update();
	myGamePiece.newPos();

	for (i = 0; i < myObstacles.length; i += 1) {
		if (myObstacles[i].x < -myObstacles[i].width) {       //check if obstacles have long past
			myObstacles.splice(i, 1);                        //if so we don't need to check them for collisions
		}
		var crashResult = myGamePiece.crashWith(myObstacles[i]);
		if (crashResult.crash && crashResult.property === 'normal') {        //check for collisions
			hit = true;
		}
		if (crashResult.crash && crashResult.property === 'coins') {
			coins++;
			var pos = myObstacles.indexOf(crashResult.obj);
			myObstacles.splice(pos, 1);
		}
	}
	if (hit) {
		myGamePiece.x += scrollSpeed;               //if there is a collision push the player back at the same speed as the scrolling object
	}

	if (myGamePiece.x < -myGamePiece.width) {         //checking position of player in the x axis
		death();                                    //if out of bounds they die
	} else if (myGamePiece.x < 30 && !hit) {
		myGamePiece.x += 0.1;                   //if player is behind go forwards slowly
	} else {
		myGamePiece.speedX = 0;
	}

	if (myGamePiece.y + myGamePiece.height < 0) {               //check if player is out of bounds in the y axis
		death();                                                //if so they die
	} else if (myGamePiece.y > myGameArea.canvas.height) {
		death();
	}

	if (myGameArea.frameNo == 1 || nextObs-- == 0) {            //obstacles
		nextObs = Math.round(150 / (-scrollSpeed / 3));           //set when the next obsticle will appear
		scrollSpeed = -(2 + 0.004 * (myGameArea.frameNo));            //change speed of game
		floorLen = (nextObs + 1) * -scrollSpeed + 1;            //set the length of a floor segment

		x = myGameArea.canvas.width;
		floorHeight = myGameArea.canvas.height - platformThickness
		wallMinHeight = 70;
		wallMaxHeight = 170;
		height = Math.floor(Math.random() * (wallMaxHeight - wallMinHeight + 1) + wallMinHeight);
		minGap = 300;
		maxGap = 500;
		maxPit = floorLen / 2;
		minPit = Math.min(50, maxPit);
		pitWidth = Math.floor(Math.random() * (maxPit - minPit + 1) + minPit);
		gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

		obs = Math.floor(Math.random() * 17) + Math.sign(myGamePiece.gravity) * 7;        //randomly choose where the obsticle will appear, biased towards where the player currently is
		if (obs < 9) {
			if (Math.floor(Math.random() * 2)) {
				myObstacles.push(new component(20, height, "green", x, 0, "rect"));                                                //wall on top
				myObstacles.push(new component(floorLen, platformThickness, "green", x, 0, "rect"));
				myObstacles.push(new component(floorLen, platformThickness, "green", x, floorHeight, "rect"));
			} else {
				myObstacles.push(new component(floorLen - pitWidth, platformThickness, "green", x + pitWidth, 0, "rect"));         //pit on roof
				myObstacles.push(new component(floorLen, platformThickness, "green", x, floorHeight, "rect"));
			}
		} else if (obs == 9) {
			myObstacles.push(new component(floorLen, platformThickness, "green", x, 0, "rect"));                                //no trap
			myObstacles.push(new component(floorLen, platformThickness, "green", x, floorHeight, "rect"));
		} else {
			if (Math.floor(Math.random() * 2)) {
				myObstacles.push(new component(20, x - height - gap, "green", x, height + gap, "rect"));                           //wall on bottom
				myObstacles.push(new component(floorLen, platformThickness, "green", x, 0, "rect"));
				myObstacles.push(new component(floorLen, platformThickness, "green", x, floorHeight, "rect"));
			} else {
				myObstacles.push(new component(floorLen, platformThickness, "green", x, 0, "rect"));
				myObstacles.push(new component(floorLen - pitWidth, platformThickness, "green", x + pitWidth, floorHeight, "rect"));//pit on floor
			}
		}
		var randomCoinsNum = Math.ceil(Math.random() * 3)
		var randomCoinsY = Math.ceil(Math.random() * 315)
		randomCoinsY = randomCoinsY > 40 ? randomCoinsY : 40;
		for (var i = 0; i < randomCoinsNum; i++) {
			myObstacles.push(new component(40, 40, './images/game/gold_coins.png', x + (i * 40) + (i * 10), randomCoinsY, "image"));
		}
	}
	for (i = 0; i < myObstacles.length; i += 1) {
		myObstacles[i].x += scrollSpeed;
		myObstacles[i].update();                            //scroll the obsticles
	}
	if (playing == 1) {
		myScore.text = "SCORE: " + myGameArea.frameNo;        //score
		myCoins.text = "COINS: " + coins;
		myScore.update();
		myCoins.update();
	}
	myGamePiece.update();                                   //draw the player
}

document.addEventListener('keydown', event => {             //user input
	event.preventDefault();
	if (playing == -1) {
		document.getElementById("submitForm").submit();
	} else if (playing && (event.key === 'Esc' || event.key === 'Escape') && !menuShow) {
		menuShow = true;
		myGamePiece.animation = false;
		myGameArea.stop();
		menu.update();
		continueBtn.update();
		continueText.update();
		exitBtn.update();
		exitText.update();
	} else if (playing && Math.abs(myGamePiece.gravitySpeed) < 0.1 && event.key === " ") {      //when a key is pressed
		myGamePiece.gravity = Math.sign(myGamePiece.gravity) * (0.15 * (scrollSpeed / 2));   //flip the gravity on the player
		myGamePiece.upright = !myGamePiece.upright;
		myGamePiece.gravitySpeed = 10 * myGamePiece.gravity;                                 //gives the flip a little more oomph and scales with game speed
	} else if (!playing && event.key === 'Enter') {                                         //if the player is dead or in the 'press a key to start' screen
		startGame();                                            //start the game
	}
});

document.addEventListener("mousedown", event => {             //user input
	submit();
});

window.onbeforeunload = submit();

setupGame();
