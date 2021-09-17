
let gameNetworkPairs = [];
let spacePressed = false;
let paused = false;
let fmap;
ajax('/getpop').post({}).then(res => {
	res = JSON.parse(res);
	FlappyGame.PipePair.gameCount = res.networks.length;
	console.log(res.networks);
	res.networks.forEach(networkobj => {
		gameNetworkPairs.push({game: new FlappyGame({
				
			}),
			network: SpaceNetwork.fromObj(networkobj),
		});
	});
});
function setup() {
	createCanvas(1200,600);
	fill(0);
	stroke(0);

	frameRate(60);
	textAlign( CENTER, CENTER );


}
function draw() {
	if(gameNetworkPairs.length == 0)return;
	background(255);
	gameNetworkPairs.forEach(pair => {
		drawGame(pair.game);
	})
	const leadPair = gameNetworkPairs.find(pair => !pair.game.over);
	drawPipes((leadPair == undefined ? gameNetworkPairs[0] : leadPair).game);
	if( gameNetworkPairs.every((pair) => pair.game.over) ) {

	} else {
		gameNetworkPairs.forEach(pair => {
			if( !pair.game.over ) {
				pair.game.update(pair.network.predict([
				
					(pair.game.maxY - pair.game.bird.y) / height, // height
					(pair.game.pipes.find(pipePair => { // dist to next pipe
						return pipePair.x > pair.game.bird.x
					}).x - pair.game.bird.x) / width,
					(pair.game.pipes.find(pipePair => pipePair.x > pair.game.bird.x).y) / height, // vertical height difference
				])[0] > 0.5);
			}
		})
	}
	
}
function drawGame(state) {
	fill(255,255,0,40);
	rect(state.bird.x,state.bird.y,state.bird.w,state.bird.h);

	// fill( 0,255,0);

	// for( pp of state.pipes ) {
	// 	rect(pp.x,0,pp.w,pp.y);
	// 	rect(pp.x,pp.y+pp.gap,pp.w,height-(pp.y+pp.gap));
	// }
}
function drawPipes(state) {
	fill( 0,255,0,100);

	for( pp of state.pipes ) {
		rect(pp.x,0,pp.w,pp.y);
		rect(pp.x,pp.y+pp.gap,pp.w,height-(pp.y+pp.gap));
	}
}
function reproduce(){
	if(gameNetworkPairs.every(pair => {
		return pair.game.over;
	})) {
		ajax('/reproduce').post({
			scores: JSON.stringify(gameNetworkPairs.map(pair => pair.game.score))
		}).then(res => {
			res = JSON.parse(res);
			FlappyGame.PipePair.gameCount = res.networks.length;
			// console.log(res.networks);
			gameNetworkPairs = []
			res.networks.forEach(networkobj => {
				gameNetworkPairs.push({game: new FlappyGame({
						
					}),
					network: SpaceNetwork.fromObj(networkobj),
				});
			});
		});
	} else {
		alert('wait for all birds to die')
	}
	
}
function resetNetwork(){
	ajax('/resetNetwork').post({}).then(res => {
		res = JSON.parse(res);
		gameNetworkPairs = [];
		FlappyGame.PipePair.gameCount = res.networks.length;
		res.networks.forEach(networkobj => {
			gameNetworkPairs.push({
				game: new FlappyGame({

				}),
				network: SpaceNetwork.fromObj(networkobj),
			});
		});
	});
}