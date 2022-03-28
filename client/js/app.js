var app = new Vue({
    el: '#hamming-encoder',
    data: {
        dataBits: [],
        status: '',
        numberOfDataBits: document.getElementById("number").data
    },
    created: function () {
        this.initDataBits(0);
    },
    methods: {
        initDataBits: function(){
            this.dataBits = [];
            
            for(var i = 0;i < this.numberOfDataBits; i++){
                var bit = { data: null };
                this.dataBits.push(bit);
            }
        },
        send: function () {
            if (this.validate(this.dataBits) === true){
                var encodedMessage = this.encode(this.dataBits);
                return axios.put("http://localhost:3000/message", {bits: encodedMessage}).then(
                    response => (this.status = response.data)
                );
            } else {
                this.status = 'Input not valid!';
            }
        },
        encode: function(bits){
            var n = bits.length;

            if(n == 4)
            {
                            var d7 = this.parity(parseInt(bits[3].data));
                            var d6 = this.parity(parseInt(bits[2].data));
                            var d5 = this.parity(parseInt(bits[1].data));
                            var d3 = this.parity(parseInt(bits[0].data));
                            var c4=this.parity(parseInt(bits[1].data)+parseInt(bits[2].data)+parseInt(bits[3].data)); // se calculeaza bitul de control de pe pozitia 4
                            var c2=this.parity(parseInt(bits[0].data)+parseInt(bits[2].data)+parseInt(bits[3].data)); // se calculeaza bitul de control de pe pozitia 2
                            var c1=this.parity(parseInt(bits[0].data)+parseInt(bits[1].data)+parseInt(bits[3].data)); // se calculeaza bitul de control de pe pozitia 1
                            // var C0 = this. ...
                			console.log("Control bits: "+c1+","+c2+","+c4);
                			console.log("Solution: "+c1+","+c2+","+d3+","+c4+","+d5+","+d6+","+d7);
                            return [c1,c2,parseInt(bits[0].data),c4,parseInt(bits[1].data),parseInt(bits[2].data),parseInt(bits[3].data)]; // vectorul V (cuvantul de transmis)
            }
            else if(n == 8)
                {
                                 var c1 = this.parity(parseInt(bits[0].data)+parseInt(bits[1].data)+parseInt(bits[3].data)+parseInt(bits[4].data)+parseInt(bits[6].data));
                                 var c2 = this.parity(parseInt(bits[0].data)+parseInt(bits[2].data)+parseInt(bits[3].data)+parseInt(bits[5].data)+parseInt(bits[6].data));
                                 var c4 = this.parity(parseInt(bits[1].data)+parseInt(bits[2].data)+parseInt(bits[3].data)+parseInt(bits[4].data));
                                 var c8 = this.parity(parseInt(bits[4].data)+parseInt(bits[5].data)+parseInt(bits[6].data)+parseInt(bits[7].data));
                                 var d7 = this.parity(parseInt(bits[3].data));
                                 var d6 = this.parity(parseInt(bits[2].data));
                                 var d5 = this.parity(parseInt(bits[1].data));
                                 var d3 = this.parity(parseInt(bits[0].data));
                                 var d9 = this.parity(parseInt(bits[4].data));
                                 var d10 = this.parity(parseInt(bits[5].data));
                                 var d11 = this.parity(parseInt(bits[6].data));
                                 var d12 = this.parity(parseInt(bits[7].data));

                                 console.log("Control bits: "+c1+","+c2+","+c4+","+c8);
                                 console.log("Solution: "+c1+","+c2+","+d3+","+c4+","+d5+","+d6+","+d7+","+c8+","+d9+","+d10+","+d11+","+d12);
                                 return [c1,c2,parseInt(bits[0].data),c4,parseInt(bits[1].data),parseInt(bits[2].data),parseInt(bits[3].data),c8,parseInt(bits[4].data),parseInt(bits[5].data),parseInt(bits[6].data),parseInt(bits[7].data)];
                }
        },

        hammingEncode: function(input)
        {
            if (typeof input !== 'string' || input.match(/[^10]/)) {
            		return console.error('Incorrect input. Example: "101011" - Correct');
            	}

            	var output = input;
            	var controlBitsIndexes = [];
            	var controlBits = [];
            	var l = input.length;
            	var i = 1;
            	var key, j, arr, temp, check;

            	while (l / i >= 1) {
            		controlBitsIndexes.push(i);
            		i *= 2;
            	}

            	for (j = 0; j < controlBitsIndexes.length; j++) {
            		key = controlBitsIndexes[j];
            		arr = output.slice(key - 1).split('');
            		temp = chunk(arr, key);
            		check = (temp.reduce(function (prev, next, index) {
            			if (!(index % 2)) {
            				prev = prev.concat(next);
            			}
            			return prev;
            		}, []).reduce(function (prev, next) { return +prev + +next }, 0) % 2) ? 1 : 0;
            		output = output.slice(0, key - 1) + check + output.slice(key - 1);
            		if (j + 1 === controlBitsIndexes.length && output.length / (key * 2) >= 1) {
            			controlBitsIndexes.push(key * 2);
            		}
            	}

            	return output;
        },

        hammingFirstDecode: function(input)
        {
            if (typeof input !== 'string' || input.match(/[^10]/)) {
            		return console.error('Incorrect input. Example: "101011" - Correct');
            	}

            	var controlBitsIndexes = [];
            	var l = input.length;
            	var originCode = input;
            	var hasError = false;
            	var inputFixed, i;

            	i = 1;
            	while (l / i >= 1) {
            		controlBitsIndexes.push(i);
            		i *= 2;
            	}

            	controlBitsIndexes.forEach(function (key, index) {
            		originCode = originCode.substring(0, key - 1 - index) + originCode.substring(key - index);
            	});

            	return originCode;
        },

        hammingDecode: function(input)
        {
            if (typeof input !== 'string' || input.match(/[^10]/)) {
            		return console.error('Incorrect input. Example: "101011" - Correct');
            	}

            	var controlBitsIndexes = [];
            	var sum = 0;
            	var l = input.length;
            	var i = 1;
            	var output = hammingDecodeFirst(input);
            	var inputFixed = hammingEncode(output);


            	while (l / i >= 1) {
            		controlBitsIndexes.push(i);
            		i *= 2;
            	}

            	controlBitsIndexes.forEach(function (i) {
            		if (input[i] !== inputFixed[i]) {
            			sum += i;
            		}
            	});

            	if (sum) {
            		output[sum - 1] === '1'
            			? output = replaceCharacterAt(output, sum - 1, '0')
            			: output = replaceCharacterAt(output, sum - 1, '1');
            	}
            	return output;
        },

        hammingCheck: function(input) {
        	if (typeof input !== 'string' || input.match(/[^10]/)) {
        		return console.error('Incorrect input. Example: "101011" - Correct');
        	}

        	var inputFixed = hammingEncode(hammingPureDecode(input));

        	return hasError = !(inputFixed === input);
        },

        replaceCharacterAt: function(str, index, character) {
          return str.substr(0, index) + character + str.substr(index+character.length);
        },

        chunk: function(arr, size) {
        	var chunks = [],
        	i = 0,
        	n = arr.length;
        	while (i < n) {
        		chunks.push(arr.slice(i, i += size));
        	}
        	return chunks;
        },

        parity: function(number){
            return number % 2;
        },
        validate: function(bits){
            for(var i=0; i<bits.length;i++){
                if (this.validateBit(bits[i].data) === false)
                return false;
            }
            return true;
        },
        validateBit: function(character){
            if (character === null) return false;
            return (parseInt(character) === 0 ||
            parseInt(character) === 1);  
        }
    }
})