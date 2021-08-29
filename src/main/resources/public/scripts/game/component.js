function component(width, height, color, x, y, type) {          //obsticles, floors, ceilings, backgrounds
	this.type = type;                                           //text takes width as font style and height as font size
	if (type == "image" || type == "background") {
		this.image = new Image();
		this.image.src = color;
	}
	this.width = width;
	this.height = height;
	this.speedX = 0;            //moves the object every frame
	this.speedY = 0;
	this.x = x;                 //position of object
	this.y = y;
	this.gravity = 0;           //acceleration in y axis
	this.gravitySpeed = 0;
	this.update = function () {
		ctx = myGameArea.context;
		if (this.type == "text") {
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = color;
			ctx.fillText(this.text, this.x, this.y);

		}
		if (type == "image" || type == "background") {
			ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
			if (type == "background") {
				ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
			}
		} if (type == "rect") {
			ctx.fillStyle = color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		if (type == "clickable_rect") {
			ctx.fillStyle = color;
			ctx.strokeStyle= color;
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.stroke();
		}
	}
	this.newPos = function () {                      //update x and y values
		this.gravitySpeed += this.gravity;                      //accelerate the gravity speed
		this.x += this.speedX;                                  //movement due to speed
		this.y += this.speedY + this.gravitySpeed;              //movement due to speed and gravity
		if (this.type == "background") {                    //if it's a background
			if (this.x == -(this.width)) {                  //make the background loop
				this.x = 0;
			}
		}
	}
	this.crashWith = function (otherobj) {               //checking for collisions
		var myleft = this.x;                        //getting the bounds of objects
		var myright = this.x + (this.width);
		var mytop = this.y;
		var mybottom = this.y + (this.height);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height);
		var distTraveled = this.speedY + this.gravitySpeed;
		var outsideX = (myright < otherleft) || (myleft > otherright);
		var crash = true;

		if ((mybottom < othertop) || (mytop > otherbottom) || outsideX) {   //if there is no overlap in coordinates
			crash = false;                                                  //no crash
		}
		if (!outsideX) {
			if ((mybottom <= othertop) && ((mybottom + distTraveled >= othertop))) {         //on top of something detection
				this.gravitySpeed = 0;                                                      //falling in down direction
				this.y = otherobj.y - this.height - 0.05;
				crash = false;
			} else if ((mytop >= otherbottom) && ((mytop + distTraveled <= otherbottom))) {  //falling in up direction
				this.gravitySpeed = 0;
				this.y = otherobj.y + otherobj.height + 0.05;
				crash = false;
			}
		}
		return crash;
	}
}

// The player is updated at 50 fps because of setInterval(updateGameArea, 20)
function playerObj(width, height, x, y, spritesheet) {          //the player

	this.score = 0;                     //score not used for now   
	this.width = width;                 //rest is the same as the component object without the text and background types
	this.height = height;               //because removing them is more efficient in terms of less redundant somparisons  
	this.speedX = 0;
	this.speedY = 0;
	this.x = x;
	this.y = y;
	this.upright = true;
	this.gravity = 0;
	this.gravitySpeed = 0;
	this.image = new Image();
	this.image.src = spritesheet;
	this.animation = true;

	// running-animation-related attributes
	this.updateAnim = false;  // whether or not we cycle to the next frame
	this.runFrame = 0;

	this.update = function () {
		ctx = myGameArea.context;
		// context.drawImage(sprite, column*frameWidth, row*frameHeight, frameWidth, frameHeight, 10, 30, frameWidth, frameHeight);
		// Draw different segments of the spritesheet. See: https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations 

		// TODO: Make gravity dependent -> If gravitySpeed < 0: flip image
		if (!this.upright) {
			// move the context so that we can draw the image
			// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
			ctx.save();
			ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
			ctx.scale(1, -1);
			ctx.translate(-this.width / 2, -this.height / 2);
			ctx.drawImage(this.image, this.runFrame * this.width, 0, this.width, this.height, 0, 0, this.width, this.height);
			ctx.restore()
		} else {
			ctx.drawImage(this.image, this.runFrame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		}

		if (this.updateAnim && this.animation) {
			// next imageCount
			if (this.runFrame == 14) {
				this.runFrame = 0;  // back to first image
			} else {
				this.runFrame++;  // next image
			}
		}
		this.updateAnim = !this.updateAnim;


		// if (type == "image") {
		// 	ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

		// 	// discern fps: ~50 fps
		// 	// var newDate = new Date();
		// 	// console.log("millisecond" + newDate.getTime() - this.date.getTime()); 
		// 	// this.date = newDate;

		// 	// 

		// } else if (type == "rect") {
		// 	ctx.fillStyle = color;
		// 	ctx.fillRect(this.x, this.y, this.width, this.height);
		// }
	}

	this.newPos = function () {
		this.gravitySpeed += this.gravity;
		this.x += this.speedX;
		this.y += this.speedY + this.gravitySpeed;
	}

	this.crashWith = function (otherobj) {
		var myleft = this.x;
		var myright = this.x + (this.width);
		var mytop = this.y;
		var mybottom = this.y + (this.height);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height);
		var distTraveled = this.speedY + this.gravitySpeed;
		var outsideX = (myright < otherleft) || (myleft > otherright);
		var crash = true;
		var property = 'normal';

		if (otherobj.type === 'image') {
			property = 'coins';
		}
		if ((mybottom < othertop) || (mytop > otherbottom) || outsideX) {
			crash = false;
		}
		if (!outsideX && otherobj.type !== 'image') {
			if ((mybottom >= othertop) && ((mybottom - distTraveled <= othertop))) {         //on top of something detection
				this.gravitySpeed = 0;
				this.y = otherobj.y - this.height - 0.05;
				crash = false;
			} else if ((mytop <= otherbottom) && ((mytop - distTraveled >= otherbottom))) {
				this.gravitySpeed = 0;
				this.y = otherobj.y + otherobj.height + 0.05;
				crash = false;
			}
		}
		return {
			crash: crash,
			property: property,
			obj: otherobj
		};
	}
}
