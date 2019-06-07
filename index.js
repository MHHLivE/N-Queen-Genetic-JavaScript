class Chess {
    constructor(queens){
        // super();
        this.queens = queens;
        this.queensPlace = []
        this.score = null;
        this.shuffle();
        this.eval();
        console.log(this.toString());
    }

    shuffle(){
        // console.log("shuffle !");
        for(var index = 0; index < this.queens; index++){
            this.queensPlace.push(index);
            // console.log(index);
        }
        this.queensPlace.sort(() => Math.random() - 0.5);

        // console.log(this.queensPlace);
    }

    eval(){
        var result = 0;
        for(var i = 0; i < this.queensPlace.length; i++){
            for(var j = i + 1; j < this.queensPlace.length; j++){
                if(Math.abs(i - j) === Math.abs(this.queensPlace[i] - this.queensPlace[j])) {
                    // console.log(`${i}(${this.queensPlace[i]}) : ${j}(${this.queensPlace[j]})`);
                    result++;
                }
            }
        }
        
        var itrationCounter = {};
        this.queensPlace.forEach(place => {
            itrationCounter[place] = (itrationCounter[place] || 0) + 1;
        });
        for(var key in itrationCounter){
            // console.log(key);
            if(itrationCounter[key] > 1){
                result = (itrationCounter[key] * (itrationCounter[key] - 1)) / 2;
            }
        }
        // console.log(itrationCounter);
        
        // console.log(result);
        this.score = result;
    }

    toString(){
        var result = "{";

        for(var place in this.queensPlace){
            // console.log(place);
            result += `${this.queensPlace[place]} ,`;
        }

        result = result.substring(0, result.lastIndexOf(' ,')) + `}:${this.score}`;
        // console.log(result);
        
        return result;
    }
}

class Genetic {
    // * initialize random population
    constructor(population, queens){
        this.chesses = [];
        for(var i = 0; i < population; i++){
            this.chesses.push(new Chess(queens));
        }
        // console.log(this.chesses);
    }

    // * evaluate
    // * selection
    // * cross over
    // * mutation
    
    // TODO : loop till find first answer
    
}

