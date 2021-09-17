const express = require('express');
const path = require('path')
const {readFile} = require('fs').promises;

const app = express();
const bodyParser = require('body-parser')

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const fg = require("./FlappyGame.js");
const {SpacePopulation} = require("./spacenetwork.js");

let pop = new SpacePopulation(500, [3,5,5,1], {
	biasBottom: 0,
	biasTop: 2,
});
/*
pop = pop.reproduceAsexual(pop.predict([1,.5,0]).map(res => {
	return 1 - Math.abs(0.5 - res[0]);
}));
*/

const getContentType = extension => {
	switch(extension){
		case '.map':
		case '.js':
			return 'application/javascript';
		case '.css':
			return 'text/css';
		case '.jpg':
			return 'image/jpg';
		case '.png':
			return 'image/png';
		case '.mp3':
			return 'audio/mpeg';
		case '.ico':
			return 'image/vnd';
		case '':
			return  'text/html';
		default:
			throw `bad file extension: ${extension}`;
	}
}

app.use( express.static( __dirname + '/Chess' ));
app.post('/getpop', urlencodedParser, async (req, res) => {
	res.header('application/JSON').status(200).send( pop );
});
app.post('/reproduce', urlencodedParser, async (req, res) => {
	// console.log(req.body);
	pop = pop.reproduceAsexual(JSON.parse(req.body.scores));
	res.header('application/JSON').status(200).send(pop);
});
app.post('/resetNetwork', urlencodedParser, async (req, res) => {
	pop = new SpacePopulation(pop.networks.length, pop.networks[0].layers.map(layer => {
		return layer.nodes.length;
	}), {
		biasBottom: 0,
		biasTop: 2,
	});
	res.header('application.JSON').status(200).send(pop);
});
app.get('/*', async (req, res) => {
	try{
		switch(req.url){
			case '/':
				res.header('Content-Type', 'text/html');
				res.send( await readFile('./index.html', 'utf8') );
				break;
			default: 					
				try{					
					res.header('Content-Type', getContentType( path.extname(req.url) ) );
					res.send( await readFile('.' + req.url) );
				}
				catch(err){
					res.header('Content-Type', 'text/html');
					res.send('404 Fie Not Found');
					throw "404 file not found";
				}
		}
	} catch(err) {
		console.log(err);
	}
});

app.listen(process.env.PORT || 3000, () => console.log(`App Available`));




