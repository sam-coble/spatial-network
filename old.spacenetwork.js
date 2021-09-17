const FlappyMap = class {

	constructor( nodes ) {

		this.nodeLayers = [];
		
		this.nodeLayers.push([]);
		nodes.inputs.forEach( element => 
			this.nodeLayers[0].push( element )
		);

		this.nodeLayers.push([]);
		nodes.hiddenNodes.forEach( element =>
			this.nodeLayers[1].push( element )
		);


		this.nodeLayers.push([]);
		nodes.outputs.forEach( element => 
			this.nodeLayers[2].push( element)
		);



	}
	addHiddenNode( x1, y1, x2, y2 ) {

		this.nodeLayers[1].push({
			start: new this.constructor.FlappyNode( x1, y1 ),
			end: new this.constructor.FlappyNode( x2, y2 ),
		});

	};
	get( inputs ) {

		this.nodeLayers[0].forEach( (element, index) => 
			element.value = inputs[index]
		);

		this.nodeLayers[1].forEach( (element, index) => {
			try {	
				return element.setValue( this.nodeLayers[ 0 ] );
			} catch( e ) {
				return FlappyMap.FlappyHiddenNode.prototype.setValue.call(
					element,
					this.nodeLayers[ 0 ]
				);
			}
		});

		this.nodeLayers[2].forEach( (element, index) => {
			try {
				return element.setValue( this.nodeLayers[0].concat(this.nodeLayers[1]));
			} catch( e ) {
				return FlappyMap.FlappyNode.prototype.setValue.call(
					element,
					this.nodeLayers[0].concat(this.nodeLayers[1]),
				);
			}
		});

		return this.nodeLayers[2].map( element => element.value );
	}

}
FlappyMap.range = {
	min: -.1,
	max: .1,
}
FlappyMap.generateRandom = function( counts ) {

	const inputs = [];
	for( let i = 0; i < counts.inputs; i++ ) {
		inputs.push( new this.FlappyNode(
			Math.random() * (this.range.max - this.range.min) + this.range.min,
			Math.random() * (this.range.max - this.range.min) + this.range.min,
		));
	}

	const outputs = [];
	for( let i = 0; i < counts.outputs; i++ ) {
		outputs.push( new this.FlappyNode(
			Math.random() * (this.range.max - this.range.min) + this.range.min,
			Math.random() * (this.range.max - this.range.min) + this.range.min,
		));
	}

	const hiddenNodes = [];
	for( let i = 0; i < counts.hiddenNodes; i++ ) {
		hiddenNodes.push( new this.FlappyHiddenNode(
			Math.random() * (this.range.max - this.range.min) + this.range.min,
			Math.random() * (this.range.max - this.range.min) + this.range.min,
			Math.random() * (this.range.max - this.range.min) + this.range.min,
			Math.random() * (this.range.max - this.range.min) + this.range.min,
		));
	}

	return {
		inputs: inputs,
		hiddenNodes: hiddenNodes,
		outputs: outputs,
	};


}

FlappyMap.FlappyNode = class {

	constructor( x, y ) {

		this.x = x;
		this.y = y;

		this.value;
		this.sign = Math.random() < .5 ? -1 : 1;

	}
	setValue( nodes ) {

		this.value = nodes.reduce( (acc, cur) => {
			const sigmoid = t => 1 / ( 1 + Math.exp(-t/1) );

			return sigmoid(
				acc + Math.pow( Math.hypot( this.x - cur.x, this.y - cur.y ), -2 )
				 * cur.value * cur.sign
			);

		}, 0);


	}


}
FlappyMap.FlappyHiddenNode = class {
	constructor( x, y, fx, fy ){
		this.x = x;
		this.y = y;
		this.fx = fx;
		this.fy = fy;

		this.value;
		this.sign = Math.random() < .5 ? -1 : 1;

	}
	setValue( nodes ) {
		this.value = nodes.reduce( (acc, cur) => {
			const sigmoid = t => 1 / ( 1 + Math.exp(-t/1) );
			return sigmoid(
				acc + Math.pow( Math.hypot( this.fx - cur.x, this.fy - cur.y ), -2 )
				* cur.value * cur.sign
			);
		}, 0);
	}
}
FlappyMap.get = FlappyMap.prototype.get;

try {
	exports.FlappyMap = FlappyMap;
} catch( e ) {
	console.log('browser');
}

