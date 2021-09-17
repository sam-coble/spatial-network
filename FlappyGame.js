class FlappyGame {

	constructor( options ) {

		this.gap = options.gap || 150;
		this.dist = options.dist || 400;
		this.maxX = options.maxX || 600;
		this.maxY = options.maxY || 600;
		this.pipeW = options.pipeW || 40;
		this.minPipeY = options.minPipeY || 50;
		this.maxPipeY = options.maxPipeY - this.gap || this.maxY - 50 - this.gap;
		this.pipeSpeed = options.pipeSpeed || 5;

		// this.r = options.random;
		// this.random = options.random ? () => this.r.next().value : () => Math.random();
		// console.log(this.random);
		this.pipes = [];

		this.bird = {
			x: options.birdX || 100,
			y: options.birdY || 300,
			w: options.birdW || 20,
			h: options.birdH || 20,
			v: options.birdV || 0,
		}

		this.grav = options.grav || .6;
		this.jumpV = options.jumpV || -10;


		this.score = 0;
		this.over = false;

		for( let x = this.bird.x + this.dist; x < this.maxX; x += this.dist ) {
			this.pipes.push( new this.constructor.PipePair( 
				x, 
				this.pipeW, 
				this.gap, 
				this.minPipeY, 
				this.maxPipeY,
			));
		}

	}

	update( shouldJump ) {


		// checks

		if( this.pipes.reduce( (acc, cur) => acc + cur.hit( this.bird ) , 0) ) {
			this.over = true;
		} else if( this.bird.y + this.bird.h >= this.maxY ){
			this.over = true;
		}

		if( this.pipes[0].x + this.dist <= 0 ) {
			this.pipes.shift();
			this.score++;
		}

		if( this.pipes[this.pipes.length - 1].x + this.dist < this.maxX ) {
			this.pipes.push( new this.constructor.PipePair(
				this.maxX,
				this.pipeW,
				this.gap,
				this.minPipeY,
				this.maxPipeY
			));
		}




		// update

		if( shouldJump ){
			this.bird.v = this.jumpV;
		} else {
			this.bird.v += this.grav;
		}

		this.bird.y += this.bird.v;
		

		this.pipes.forEach( e => e.move( this.pipeSpeed ) );

		return this.peek();
		

	}
	peek() {
		return {
			bird: this.bird,
			pipes: this.pipes,
			score: this.score,
			over: this.over,
		}
	}



}
FlappyGame.PipePair = class {

	constructor( x, w, gap, minY, maxY ) {
		this.x = x;
		this.w = w;
		// bottom of top pipe
		this.y = Math.random() * (maxY - minY) + minY;
		this.gap = gap;

		
	}

	move( x ){
		this.x -= x;
	}
	hit( b ) {
		return b.x + b.w >= this.x && b.x <= this.x + this.w &&
				((b.y <= this.y) || (b.y + b.h >= this.y + this.gap));
	}

}
FlappyGame.PipePair.count = 0;
FlappyGame.PipePair.r = Math.random();
FlappyGame.PipePair.gameCount = 5;
FlappyGame.PipePair.repeatedRandom = function(){
	if(FlappyGame.PipePair.count >= FlappyGame.PipePair.gameCount){
		FlappyGame.PipePair.count = 0;
		FlappyGame.PipePair.r = Math.random();
	}
	FlappyGame.PipePair.count++;
	return FlappyGame.PipePair.r;
}
try{
	exports.FlappyGame = FlappyGame;
	// node
} catch(e) {
	// browser 
}



