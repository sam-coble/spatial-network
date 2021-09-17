// @ts-ignore
// const cloneDeep = require !== undefined ? require('clone-deep') : _.cloneDeep;

// const cloneDeep = require('clone-deep');
const cloneDeep = _.cloneDeep;

class SpacePopulation {
    networks: SpaceNetwork[];
    constructor( networkCount: number, nodeLayers: number[], {biasBottom, biasTop}:{biasBottom?: number; biasTop?: number;} ) {
        this.networks = [];
        for( let i = 0; i < networkCount; i++ ) {
            this.networks.push(new SpaceNetwork(nodeLayers, biasBottom, biasTop));
        }
    }
    predict( input: number[] ): number[][] {
        return this.networks.map( network => network.predict(input) );
    }
    reproduceAsexual( scores: number[] ): SpacePopulation {
        interface networkScorePair {
            network: SpaceNetwork;
            score: number;
        }
        const pairs: networkScorePair[] = [];
        scores.forEach((e, i) => {
            pairs.push({
                network: this.networks[i],
                score: scores[i],
            });
        });
        pairs.sort((a, b) => {
            return a.score - b.score;
        })
        const newPopulation = new SpacePopulation(0, [], {});
        while( newPopulation.networks.length < this.networks.length ) {
            newPopulation.networks.push( pairs[/*weightedIndex(pairs.length, 'high')*/ pairs.length-1].network.reproduceAsexual() );
        }
        return newPopulation;
    }
    report( test: ( network:SpaceNetwork) => boolean ): number {
        return this.networks.reduce((acc, element) => {
            return test(element) ? 1 : 0;
        },0 ) / this.networks.length;
    }
}
class SpaceNetwork {
    layers: SpaceNetworkLayer[];
    constructor( nodeLayers: number[], biasBottom: number, biasTop: number ) {
        this.layers = nodeLayers.map((val, index, arr) => {
            return new SpaceNetworkLayer(val, index !== 0 && index !== arr.length - 1, biasBottom, biasTop)
        });
        
    }
    predict(input: number[]): number[] {
        this.layers[0].setValues(input);
        return this.layers.reduce((acc, val) => {
            return val.calculateFromPreviousLayer(acc);
        }).toValueArray();
    }
    reproduceAsexual(): SpaceNetwork {
        const newNetwork: SpaceNetwork = cloneDeep(this);
        newNetwork.layers.forEach(layer => {
            layer.nodes.map(node => {
                if( node.fromx === node.tox ) {
                    node.fromx += averageRandom(10);
                    node.tox = node.fromx;
                    node.fromx += averageRandom(10);
                    node.toy = node.fromy;
                } else {
                    node.fromx += averageRandom(10);
                    node.tox += averageRandom(10);
                    node.fromy += averageRandom(10);
                    node.toy += averageRandom(10);
                }
            });
        });

        return newNetwork;
    }
    static fromObj(obj: SpaceNetworkObject): SpaceNetwork {
        const network = new SpaceNetwork([],0,0);
        network.layers = obj.layers.map((objlayer, index) => {
            const layer = new SpaceNetworkLayer(0,false,0,0);
            layer.nodes = objlayer.nodes.map((node, index) => {
                return new SpaceNetworkNode({
                    fromx: node.fromx,
                    fromy: node.fromy,
                    tox: node.tox,
                    toy: node.toy,
                    biasTop: node.bias,
                    biasBottom: node.bias,
                });
            })
            return layer;
        });
        return network;
    }
}
interface SpaceNetworkObject {
    layers: {
        nodes: {
            bias: number;
            fromx: number;
            fromy: number;
            tox: number;
            toy: number;
            value?: number;
        }[]
    }[]
}
class SpaceNetworkLayer {
    nodes: SpaceNetworkNode[];
    constructor( numberOfNodes: number, isHiddenLayer: boolean, biasBottom: number, biasTop: number ) {
        this.nodes = [];
        if( !isHiddenLayer ) {
            for( let i: number = 0; i < numberOfNodes; i++ ) {
                this.nodes.push(new SpaceNetworkNode({
                    x: 2 * Math.random() - 1,
                    y: 2 * Math.random() - 1,
                    biasBottom,
                    biasTop,
                }))
            }
        } else {
            for( let i = 0; i < numberOfNodes; i++ ) {
                this.nodes.push(new SpaceNetworkNode({
                    fromx: 2 * Math.random() - 1,
                    fromy: 2 * Math.random() - 1,
                    tox: 2 * Math.random() - 1,
                    toy: 2 * Math.random() - 1,
                    biasBottom,
                    biasTop,
                }))
            }
        }
    }
    calculateFromPreviousLayer(prev: SpaceNetworkLayer): SpaceNetworkLayer {
        this.nodes.forEach(e => {
            e.value = sigmoid(-e.bias + prev.nodes.reduce((acc, node) => {
                return acc + (node.value / (Math.hypot(e.fromx - node.tox, e.toy - node.fromy) ** 2));
            }, 0));
        });
        return this;
    }
    toValueArray(): number[] {
        return this.nodes.map(node => node.value);
    }
    setValues(input: number[]): void {
        this.nodes.forEach((node, index) => {
            node.value = input[index];
        })
    }

}
class SpaceNetworkNode {
    tox: number;
    fromx: number;
    toy: number;
    fromy: number;
    value: number;
    bias: number;
    constructor(options: SpaceNetworkNodeOptions) {
        const {x, y, tox, toy, fromx, fromy, biasBottom, biasTop} = options;
        if( x || y ) {
            this.tox = x;
            this.fromx = x;
            this.toy = y;
            this.fromy = y;
        } else {
            this.tox = tox;
            this.fromx = fromx;
            this.toy = toy;
            this.fromy = fromy;
        }
        this.value;
        this.bias = biasBottom === biasTop ? biasBottom : Math.random() * (biasTop - biasBottom) + biasBottom;
    }
}
interface SpaceNetworkNodeOptions{
    x?: number;
    y?: number;
    tox?: number;
    toy?: number;
    fromx?: number;
    fromy?: number;
    
    biasBottom: number;
    biasTop: number;    
}
function averageRandom( n: number | undefined ): number {
    if( n === undefined ) {
        n = 10;
    }
    let sum = 0;
    for(let i = 0; i < n; i++){
        sum += Math.random();
    }
    return sum / n - 0.5;
}
function weightedIndex( indexCount: number, dir: 'high' | 'low' ): number {
    let r = Math.random() * (Math.exp(4) - 1);
    if(dir==='high') {
        return Math.floor( Math.log(r + 1) * indexCount / 4 );
    } else {
        return indexCount - 1 - (Math.floor( Math.log(r + 1) * indexCount / 4 ));
    }
}
function sigmoid( x: number ): number {
    return Math.exp(x) / (Math.exp(x) + 1);
}
try{
    exports.SpacePopulation = SpacePopulation;
} catch(e) {
    console.log('browser');
}