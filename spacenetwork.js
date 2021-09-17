// @ts-ignore
// const cloneDeep = require !== undefined ? require('clone-deep') : _.cloneDeep;
// const cloneDeep = require('clone-deep');
var cloneDeep = _.cloneDeep;
var SpacePopulation = /** @class */ (function () {
    function SpacePopulation(networkCount, nodeLayers, _a) {
        var biasBottom = _a.biasBottom, biasTop = _a.biasTop;
        this.networks = [];
        for (var i = 0; i < networkCount; i++) {
            this.networks.push(new SpaceNetwork(nodeLayers, biasBottom, biasTop));
        }
    }
    SpacePopulation.prototype.predict = function (input) {
        return this.networks.map(function (network) { return network.predict(input); });
    };
    SpacePopulation.prototype.reproduceAsexual = function (scores) {
        var _this = this;
        var pairs = [];
        scores.forEach(function (e, i) {
            pairs.push({
                network: _this.networks[i],
                score: scores[i]
            });
        });
        pairs.sort(function (a, b) {
            return a.score - b.score;
        });
        var newPopulation = new SpacePopulation(0, [], {});
        while (newPopulation.networks.length < this.networks.length) {
            newPopulation.networks.push(pairs[ /*weightedIndex(pairs.length, 'high')*/pairs.length - 1].network.reproduceAsexual());
        }
        return newPopulation;
    };
    SpacePopulation.prototype.report = function (test) {
        return this.networks.reduce(function (acc, element) {
            return test(element) ? 1 : 0;
        }, 0) / this.networks.length;
    };
    return SpacePopulation;
}());
var SpaceNetwork = /** @class */ (function () {
    function SpaceNetwork(nodeLayers, biasBottom, biasTop) {
        this.layers = nodeLayers.map(function (val, index, arr) {
            return new SpaceNetworkLayer(val, index !== 0 && index !== arr.length - 1, biasBottom, biasTop);
        });
    }
    SpaceNetwork.prototype.predict = function (input) {
        this.layers[0].setValues(input);
        return this.layers.reduce(function (acc, val) {
            return val.calculateFromPreviousLayer(acc);
        }).toValueArray();
    };
    SpaceNetwork.prototype.reproduceAsexual = function () {
        var newNetwork = cloneDeep(this);
        newNetwork.layers.forEach(function (layer) {
            layer.nodes.map(function (node) {
                if (node.fromx === node.tox) {
                    node.fromx += averageRandom(10);
                    node.tox = node.fromx;
                    node.fromx += averageRandom(10);
                    node.toy = node.fromy;
                }
                else {
                    node.fromx += averageRandom(10);
                    node.tox += averageRandom(10);
                    node.fromy += averageRandom(10);
                    node.toy += averageRandom(10);
                }
            });
        });
        return newNetwork;
    };
    SpaceNetwork.fromObj = function (obj) {
        var network = new SpaceNetwork([], 0, 0);
        network.layers = obj.layers.map(function (objlayer, index) {
            var layer = new SpaceNetworkLayer(0, false, 0, 0);
            layer.nodes = objlayer.nodes.map(function (node, index) {
                return new SpaceNetworkNode({
                    fromx: node.fromx,
                    fromy: node.fromy,
                    tox: node.tox,
                    toy: node.toy,
                    biasTop: node.bias,
                    biasBottom: node.bias
                });
            });
            return layer;
        });
        return network;
    };
    return SpaceNetwork;
}());
var SpaceNetworkLayer = /** @class */ (function () {
    function SpaceNetworkLayer(numberOfNodes, isHiddenLayer, biasBottom, biasTop) {
        this.nodes = [];
        if (!isHiddenLayer) {
            for (var i = 0; i < numberOfNodes; i++) {
                this.nodes.push(new SpaceNetworkNode({
                    x: 2 * Math.random() - 1,
                    y: 2 * Math.random() - 1,
                    biasBottom: biasBottom,
                    biasTop: biasTop
                }));
            }
        }
        else {
            for (var i = 0; i < numberOfNodes; i++) {
                this.nodes.push(new SpaceNetworkNode({
                    fromx: 2 * Math.random() - 1,
                    fromy: 2 * Math.random() - 1,
                    tox: 2 * Math.random() - 1,
                    toy: 2 * Math.random() - 1,
                    biasBottom: biasBottom,
                    biasTop: biasTop
                }));
            }
        }
    }
    SpaceNetworkLayer.prototype.calculateFromPreviousLayer = function (prev) {
        this.nodes.forEach(function (e) {
            e.value = sigmoid(-e.bias + prev.nodes.reduce(function (acc, node) {
                return acc + (node.value / (Math.pow(Math.hypot(e.fromx - node.tox, e.toy - node.fromy), 2)));
            }, 0));
        });
        return this;
    };
    SpaceNetworkLayer.prototype.toValueArray = function () {
        return this.nodes.map(function (node) { return node.value; });
    };
    SpaceNetworkLayer.prototype.setValues = function (input) {
        this.nodes.forEach(function (node, index) {
            node.value = input[index];
        });
    };
    return SpaceNetworkLayer;
}());
var SpaceNetworkNode = /** @class */ (function () {
    function SpaceNetworkNode(options) {
        var x = options.x, y = options.y, tox = options.tox, toy = options.toy, fromx = options.fromx, fromy = options.fromy, biasBottom = options.biasBottom, biasTop = options.biasTop;
        if (x || y) {
            this.tox = x;
            this.fromx = x;
            this.toy = y;
            this.fromy = y;
        }
        else {
            this.tox = tox;
            this.fromx = fromx;
            this.toy = toy;
            this.fromy = fromy;
        }
        this.value;
        this.bias = biasBottom === biasTop ? biasBottom : Math.random() * (biasTop - biasBottom) + biasBottom;
    }
    return SpaceNetworkNode;
}());
function averageRandom(n) {
    if (n === undefined) {
        n = 10;
    }
    var sum = 0;
    for (var i = 0; i < n; i++) {
        sum += Math.random();
    }
    return sum / n - 0.5;
}
function weightedIndex(indexCount, dir) {
    var r = Math.random() * (Math.exp(4) - 1);
    if (dir === 'high') {
        return Math.floor(Math.log(r + 1) * indexCount / 4);
    }
    else {
        return indexCount - 1 - (Math.floor(Math.log(r + 1) * indexCount / 4));
    }
}
function sigmoid(x) {
    return Math.exp(x) / (Math.exp(x) + 1);
}
try {
    exports.SpacePopulation = SpacePopulation;
}
catch (e) {
    console.log('browser');
}
