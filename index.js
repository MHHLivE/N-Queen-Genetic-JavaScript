class Chess {
    constructor(queens){
        // super();
        this.queens = queens;
        this.queensPlace = []
        this.score = null;
        this.shuffle();
        this.eval();
        // console.log(this.toString());
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
                    // console.log(`<${i}, ${j}>`)
                    result++;
                }
            }
        }

        // ? init & set iteration counter of each place
        var iterationCounter = {};
        this.queensPlace.forEach(place => {
            iterationCounter[place] = (iterationCounter[place] || 0) + 1;
        });
        // ? get sum of iterations
        for(var key in iterationCounter){
            if(iterationCounter[key] > 1){
                result += (iterationCounter[key] * (iterationCounter[key] - 1)) / 2; // sum of 1 to "iteration count" for each different situation that the queens threaten each other!
            }
        }
        this.score = result;
    }

    isGoal(){
        return (this.score === 0);
    }

    merge(secChess, percentage){
        let perLength = Math.floor(percentage * this.queensPlace.length);
        // console.log(perLength);
        let childs = [deepClone(secChess), deepClone(this), deepClone(secChess), deepClone(this)];
        let childsQueens = [deepClone(secChess).queensPlace, deepClone(this).queensPlace, deepClone(secChess).queensPlace, deepClone(this).queensPlace];
        // console.log(childs);

        for( let index = 0; index < this.queensPlace.length; index++ ){
            if(index < perLength){
                childsQueens[0][index] = childsQueens[3][index];
                childsQueens[1][index] = childsQueens[2][index];
            } else {
                childsQueens[1][index] = childsQueens[3][index];
                childsQueens[0][index] = childsQueens[2][index];
            }
        }

        for(let index = 0; index < 4; index++){
            childs[index].queensPlace = childsQueens[index];
            childs[index].eval();
        }
        
        childs.sort((a, b) => {
            return (a.score - b.score);
        });
        // console.log(childs);
        
        return [childs[0], childs[1]];
    }

    mutate(newClmn, newRow){
        let newChess = deepClone(this);
        let newQueensPlace = this.queensPlace;
        newQueensPlace[newClmn] = newRow;
        newChess.queensPlace = newQueensPlace;
        newChess.eval();
        if(this.score > newChess.score){
            // console.log(this.toString());
            // console.log("compare: " + this.score + " " + newChess.score);
            // console.log("new val: " + newClmn + " " + newRow);
            this.queensPlace = newQueensPlace;
            this.eval();
            // console.log(this.toString());
        }
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
        
        this.geneticState = {
            roundRun : 0,
            finalAnswer : null,
            isFound : false
        }
        // console.log(this.chesses);
        this.searchStart();
    }

    searchStart(){
        while(true){
            // * evaluate
            this.evaluate();
            // ? check end-search condition
            if(this.geneticState.isFound){
                break;
            }
            // * selection
            this.selection();
            // * cross over
            this.crossOver();
            // * mutation
            this.mutation(20);
            this.geneticState.roundRun++;
            console.log(this.geneticState.roundRun);
        }
        console.log(this.geneticState.finalAnswer.toString());
    }
    // TODO : loop till find first answer
    
    evaluate(){
        for(let chess in this.chesses){
            this.chesses[chess].eval();
            if(this.chesses[chess].isGoal()){
                this.geneticState = {
                    roundRun: this.geneticState.roundRun,
                    finalAnswer: this.chesses[chess],
                    isFound: true
                }
                break;
            }
        }
    }
    
    selection(){
        let tempChesses = deepClone(this.chesses);
        // console.log(tempChesses);
        tempChesses.sort((a, b) => {
            return (a.score - b.score);
        });
        
        let chanceScales = [0];
        for(let chess in tempChesses){
            chanceScales.push(tempChesses[tempChesses.length - 1].score - tempChesses[chess].score + chanceScales[chess] + 1);
        }
        chanceScales.pop();
        // console.log(chanceScales);
        let newChesses = [];
        for(let chess in tempChesses){
            // TODO setter
            let chance = Math.random() * chanceScales[chanceScales.length - 1];
            // console.log(chance);
            let scale = chanceScales.length - 1;
            for(; chance < chanceScales[scale]; scale--){
                newChesses[chess] = tempChesses[scale];
            }
            // console.log(tempChesses[scale]);
            
            // console.log(scale);
        }
        // console.log(newChesses);
        this.chesses = newChesses;
        // console.log(this.chesses);
        // console.log(this.chesses);
    }
    
    crossOver(){
        let crossedChesses = [];
        for(let index = 0; index < this.chesses.length - 1; index += 2){
            let percentage = Math.random();
            let crossed = this.chesses[index].merge(this.chesses[index + 1], percentage);
            crossedChesses[index] = crossed[0];
            crossedChesses[index + 1] = crossed[1];
        }
        this.chesses = crossedChesses;
        // console.log(this.chesses);
    }

    mutation(percentage){
        for(let index = 0; index < this.chesses.length; index++){
            let chance = Math.floor(Math.random() * 100);
            // console.log(chance);
            if(chance < percentage){
                let newClmn = Math.floor(Math.random() * this.chesses[0].queensPlace.length);
                let newRow = Math.floor(Math.random() * this.chesses[0].queensPlace.length);
                // console.log(newClmn, newRow);
                this.chesses[index].mutate(newClmn, newRow);
            }
        }
        // console.log(this.chesses);
    }
    
}

function deepClone(obj) {
    if (obj === null || typeof obj !== "object")
      return obj
    var props = Object.getOwnPropertyDescriptors(obj)
    for (var prop in props) {
      props[prop].value = deepClone(props[prop].value)
    }
    return Object.create(
      Object.getPrototypeOf(obj), 
      props
    )
  }



$(document).ready(function(){
//     console.log("first chess :");
    // let testChess = new Chess(5);
//     testChess.queensPlace = [0, 2, 4, 1, 3];
//     testChess.eval();
//     console.log(testChess.score, testChess.isGoal());
    // let test2Chess = testChess;
    // console.log("first chess :");
    // testChess = new Chess(10);
    // console.log("sec chess :");
    // console.log(test2Chess.toString());
//     console.log("genetic start :");
    // let testGeneric = new Genetic(10, 5);
    // console.log(testGeneric.chesses);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // testGeneric.mutation(20);
    // let test2Generic = Object.assign( Object.create( Object.getPrototypeOf(testGeneric)), testGeneric);
    // let test2Generic = deepClone(testGeneric);
    // testGeneric.chesses.sort((a, b) => {
    //     return (a.score - b.score); 
    // });

    // console.log("first one sorted !");
    // for(let chess in testGeneric.chesses){
    //     console.log(testGeneric.chesses[chess].toString());
    // }
    // console.log("second one unsorted !");
    // for(let chess in test2Generic.chesses){
    //     console.log(test2Generic.chesses[chess].toString());
    // }
});

