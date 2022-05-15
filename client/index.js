import { answerWords } from '/answers.js';
import { words } from '/words.js';

export class Game {

    constructor(hardMode) {
        this._grid = new Array(5).fill(' ').map(() => new Array(6).fill(' ')); // Set and initialize gameboard
        this._specials = new Array(5).fill(' ').map(() => new Array(6).fill(' ')); // Set and initialize special tiles
        this._goalWord = "";
        this._goodLetters = "";
        this._badLetters = "";
        this._solution = "-----";
        this._strategy = "letterElimination";
        this._guessedWords = new Array(6).fill('');
        this._curRow = 0;
        this._log = [];
        this._copyString = "";
        this._startString = "";
        this._solved = false;
        this._hardMode = hardMode;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 6; j++) {
                this._specials[i][j] = 'black';
            }
        }
    }

    setGoalWord(word) {
        if (word.length !== 5) {
            alert(`${word} is not 5 letters`);
            return false;
        }
        if (!answerWords.includes(word)) {
            alert(`${word} is not an allowed goal word!`);
            return false;
        }
        this._goalWord = word;
        this._startString = !this._hardMode ? `=========== Starting new game with goal: ${word} ===========` : `====== Starting new game with goal: ${word} (Hard Mode) ======`;
        return true;
    }

    addWord(word) {
        this._guessedWords[this._curRow] = word;
        for (let i = 0; i < 5; i++) {
            this._grid[i][this._curRow] = word[i];
        }
        this._curRow++;
        this.log(this._curRow === 1 ? this._startString : "");
        this.log(`Guessing Word: ${word}`);
        this.compareGrid();
        if (word !== this._solution) {
            this.log(`Solution: ${this._solution}`);
            this.log(`Good Letters: ${this._goodLetters}`);
            this.log(`Bad Letters: ${this._badLetters}`);
            if(this._curRow === 6){
                this.log(`Failed to solve Wordle!`);
                this.log(`Goal Word Was: ${this._solution}`);
                this.setCopyString(true);
                this._solved = true;
            }
        } else {
            this.log(`Goal Word Found: ${this._solution}`);
            this.log(`Solved Word in ${this._curRow} guesses!`);
            this.setCopyString(false);
            this._solved = true;
        }
    }

    setCopyString(failed) {
        this._copyString = `Tyler's Wordle Algorithm: ${failed ? 'X' : this._curRow}/6`;
        this._copyString += hardMode ? '*\n\n' : '\n\n';
        for (let j = 0; j < this._curRow; j++) {
            for (let k = 0; k < 5; k++) {
                switch (this._specials[k][j]) {
                    case 'green':
                        this._copyString += "🟩";
                        break;
                    case 'black':
                        this._copyString += "⬛";
                        break;
                    case 'yellow':
                        this._copyString += "🟨";
                        break;
                }
            }
            this._copyString += "\n";
        }
    }

    compareGrid() {
        const knowledge = this.updateKnowledge(this._goalWord, this._guessedWords);
        this._solution = knowledge['solution'];
        this._goodLetters = knowledge['good'];
        this._badLetters = knowledge['bad'];


        for (let wordIndex = 0; wordIndex < this._guessedWords.length; wordIndex++) {
            for (let letterIndex = 0; letterIndex < this._guessedWords[wordIndex].length; letterIndex++) {
                let tile = this._grid[letterIndex][wordIndex];
                let color = '';

                if (this._badLetters.includes(tile)) {
                    // Black
                    color = 'black';
                }
                if (this._goodLetters.includes(tile)) {
                    // Yellow
                    color = 'yellow';
                }
                if (this._solution[letterIndex] === tile) {
                    // Green
                    color = 'green';
                }
                this._specials[letterIndex][wordIndex] = color;
            }
        }
    }

    updateKnowledge(goal, guessed) {
        let solution = "-----";
        let good = "";
        let bad = "";

        for (let wordIndex = 0; wordIndex < guessed.length; wordIndex++) {
            for (let letterIndex = 0; letterIndex < guessed[wordIndex].length; letterIndex++) {
                if (goal[letterIndex] === guessed[wordIndex][letterIndex]) {
                    if (solution[letterIndex] === '-') {
                        solution = this.setCharAt(solution, letterIndex, goal[letterIndex]);
                    }
                }
                if (goal.includes(guessed[wordIndex][letterIndex]) && !good.includes(guessed[wordIndex][letterIndex])) {
                    good += guessed[wordIndex][letterIndex];
                } else if (!goal.includes(guessed[wordIndex][letterIndex]) && !bad.includes(guessed[wordIndex][letterIndex])) {
                    bad += guessed[wordIndex][letterIndex];
                }
            }
        }

        return { 'solution': solution, 'good': good, 'bad': bad };
    }

    getPossibileAnswers(dict, guessed, solution, good, bad) {
        return dict.filter(e => {
            if (guessed.includes(e) && e !== solution) {
                return false;
            }
            for (let i = 0; i < 5; i++) {
                if (solution[i] !== '-' && solution[i] !== e[i]) {
                    return false;
                }
            }
            for (let i = 0; i < good.length; i++) {
                if (!e.includes(good[i])) {
                    return false;
                }
            }
            for (let i = 0; i < bad.length; i++) {
                if (e.includes(bad[i])) {
                    return false;
                }
            }
            for (let i = 0; i < guessed.length; i++) {
                const guessWord = guessed[i];
                for (let j = 0; j < guessWord.length; j++) {
                    if (solution[j] !== guessWord[j]) {
                        if (e[j] === guessWord[j]) {
                            return false;
                        }
                    }
                }
            }
            return true;
        });
    }

    logRemainingWords() {
        const possibleAnswers = this.getPossibileAnswers(answerWords, this._guessedWords, this._solution, this._goodLetters, this._badLetters);

        if (possibleAnswers.length === 1) {
            this.log(`One word remaining: ${possibleAnswers[0]}`);
        } else if (possibleAnswers.length <= 25) {
            this.log(`Remaining Possibilites (${possibleAnswers.length}):`);
            this.log(possibleAnswers);
        } else {
            this.log(`Remaining Possibilites: ${possibleAnswers.length}`);
        }
    }

    isValidHardModeGuess(word){
        const possibleAnswers = this.getPossibileAnswers(answerWords, this._guessedWords, this._solution, this._goodLetters, this._badLetters);
        return possibleAnswers.includes(word);
    }

    getNextGuess() {
        const possibleAnswers = this.getPossibileAnswers(answerWords, this._guessedWords, this._solution, this._goodLetters, this._badLetters);

        this.logRemainingWords();

        let nextWord = '';
        if (this._strategy === "letterElimination") {
            if (possibleAnswers.length === 1) {
                nextWord = possibleAnswers[0];
            } else if (possibleAnswers.length <= 25 && true) {
                // Brute force best guess option
                let bestGuesses = [];
                const dictionary = hardMode ? possibleAnswers : answerWords.concat(words);

                for (let i = 0; i < dictionary.length; i++) {
                    let guess = dictionary[i];
                    let avg = 0;
                    for (let j = 0; j < possibleAnswers.length; j++) {
                        // Assume answer is this word and then see how many possibilities remain after this guess
                        let newGuessed = JSON.parse(JSON.stringify(this._guessedWords));
                        newGuessed.push(guess);

                        const knowledge = this.updateKnowledge(possibleAnswers[j], newGuessed);
                        const sol = knowledge['solution'];
                        const good = knowledge['good'];
                        const bad = knowledge['bad'];
                        const newAnswers = this.getPossibileAnswers(possibleAnswers, newGuessed, sol, good, bad);

                        avg += newAnswers.length;
                    }
                    avg /= possibleAnswers.length;

                    if (avg <= 1) {
                        console.log(`Found optimal guess in ${i} words`);

                        this.log("");
                        this.log("Found optimal guess:")
                        this.log(`${guess} reduces remaining possibilites to 1`);
                        return guess;
                    }

                    let index = 0;
                    for (index; index < bestGuesses.length; index++) {
                        if (avg < bestGuesses[index]["avg"]) { break; }
                    }
                    bestGuesses.splice(index, 0, {
                        "word": guess,
                        "avg": avg
                    });

                    if (bestGuesses.length > 5) {
                        bestGuesses = bestGuesses.slice(0, 5);
                    }
                }
                console.log(`Tested all ${dictionary.length} words, best avg: ${bestGuesses[0]['avg'].toFixed(3)}`);

                this.log("");
                this.log("Top Guess Candidates:")
                for (let i = 0; i < Math.min(5, bestGuesses.length); i++) {
                    this.log(`${bestGuesses[i]['word']} with avg remaining guesses: ${bestGuesses[i]['avg'].toFixed(3)}`);
                }

                nextWord = bestGuesses[0]['word'];

            } else {
                // Make letter frequency object
                const letterFreq = {};
                possibleAnswers.forEach(e => {
                    e.split('').forEach(letter =>
                        letterFreq[letter] = letter in letterFreq ? letterFreq[letter] + 1 : 1
                    );
                });
                //console.log(letterFreq);
                let letterPriority = [];
                for (const letter in letterFreq) {
                    let index = 0;
                    for (index; index < letterPriority.length; index++) {
                        const freq = letterFreq[letter];
                        const perWord = letterFreq[letter] / possibleAnswers.length;
                        const distToHalf = Math.abs(0.5 - perWord);

                        if (distToHalf < letterPriority[index]["distToHalf"]) { break; }
                    }
                    letterPriority.splice(index, 0, {
                        "letter": letter,
                        "freq": letterFreq[letter],
                        "perWord": letterFreq[letter] / possibleAnswers.length,
                        "distToHalf": Math.abs(0.5 - letterFreq[letter] / possibleAnswers.length)
                    });
                }
                //console.log(letterPriority);

                //console.log(`Guesses Remaining: ${6-this._curRow}. Remaining Options: ${possibleAnswers.length}`);

                // Next make a mapping of remaining words to a heuristic based on the distToHalf frequency
                let guessWords = [];
                let wordLibrary = (possibleAnswers.length <= (6 - this._curRow) && possibleAnswers.length <= 2) || this._hardMode ? possibleAnswers : answerWords.concat(words);
                wordLibrary = this.removeGuessedWords(wordLibrary);
                for (let i = 0; i < wordLibrary.length; i++) {
                    let score = 0;
                    let usedLetters = '';
                    let word1 = wordLibrary[i].split('');
                    for (let index = 0; index < 5; index++) {
                        const letter = word1[index];
                        if (this._goodLetters.includes(letter)) {
                            score -= 0.5;
                        }
                        if (usedLetters.includes(letter)) {
                            score -= 1;
                        }
                        for (let j = 0; j < this._guessedWords.length; j++) {
                            if (this._guessedWords[j].length !== 0) {
                                if (this._guessedWords[j][index] === letter) {
                                    //console.log(`Letter ${}`);
                                    score -= 1;
                                }
                            }
                        }
                        if (this._solution[index] !== letter) {
                            for (let j = 0; j < letterPriority.length; j++) {
                                if (letterPriority[j]["letter"] === letter) {
                                    score += 1.5 - letterPriority[j]["distToHalf"];
                                }
                            }
                        }
                        usedLetters += letter;
                    }

                    let index = 0;
                    for (index; index < guessWords.length; index++) {
                        if (score > guessWords[index]["score"]) { break; }
                    }
                    guessWords.splice(index, 0, {
                        "word": wordLibrary[i],
                        "score": score
                    });
                }

                //console.log(guessWords);
                this.log("");
                this.log("Top Guess Candidates:")
                for (let i = 0; i < Math.min(5, guessWords.length); i++) {
                    this.log(`${guessWords[i]['word']} with score: ${guessWords[i]['score'].toFixed(3)}`);
                }

                nextWord = guessWords[0]['word'];
            }
        }
        return nextWord;
    }

    log(str) {
        this._log.push(str);
    }

    removeGuessedWords(arr) {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (!this._guessedWords.includes(arr[i])) {
                newArr.push(arr[i]);
            }
        }
        return newArr;
    }

    setCharAt(str, index, chr) {
        if (index > str.length - 1) return str;
        return str.substring(0, index) + chr + str.substring(index + 1);
    }

    /**
     * This function returns the current state of the board. The positions where
     * there are no tiles can be anything (undefined, null, ...).
     * @returns {Array<Array<string>>} A 2-dimensional array representing the
     * current grid.
     */
    getGrid() {
        return this._grid;
    }

    /**
     * This method will take an HTMLElement, which will either be empty or
     * contain the current grid, and render the board in that element. For
     * example, if we have a `<div id="board"></div>`, this should be called
     * `game.render(document.getElementById('board'))`.
     * @param {HTMLElement} element an HTMLElement to render the board into.
     */
    render(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                const tile = this._grid[j][i];
                const specialTile = this._specials[j][i];
                const tileElem = document.createElement("div");
                tileElem.classList.add("tile");
                //console.log(`Rendering word ${i}, tile ${j} to be color: ${specialTile}`);
                switch (specialTile) {
                    case 'yellow':
                        tileElem.classList.add("yellow");
                        break;
                    case 'green':
                        tileElem.classList.add("green");
                        break;
                    case 'black':
                        tileElem.classList.add("black");
                        break;
                    case ' ':
                        tileElem.classList.add("normalTile");
                        break;
                }
                tileElem.setAttribute("id", `tile-${(j + 1)}-${(i + 1)}`);
                tileElem.setAttribute("style", `style="color: white;"`);
                let text = document.createTextNode(tile.toUpperCase());
                tileElem.appendChild(text);
                element.appendChild(tileElem);
            }
        }
    }

    renderLog(element) {
        let str = '';
        this._log.forEach(e => {
            str += e + "\n";
        });
        element.innerHTML = str;
    }
}

const playButton = document.getElementById("playButton");
const distributionButton = document.getElementById("distributionButton");
const hideButton = document.getElementById("hideButton");
const logButton = document.getElementById("logButton");
const copyButton = document.getElementById("copyButton");
const word = document.getElementById("word");
const log = document.getElementById("log");
const modeButton = document.getElementById("modeButton");
const settingsButton = document.getElementById("settingsButton");
const settingsContainer = document.getElementById("settings-container");
const starterInput = document.getElementById("starter");
const hardModeBox = document.getElementById("hardMode");
const interactiveContainer = document.getElementById("interactive-container");
const guessInput = document.getElementById("guess");
const guessButton = document.getElementById("guessButton");
const undoButton = document.getElementById("undoButton");

let starter = "dwarf";
starterInput.value = starter;
let hardMode = false;
let interactiveMode = false;

let g = new Game(hardMode);
rerender();

playButton.addEventListener("click", playWordle);
distributionButton.addEventListener("click", getScoreDistribution);
hideButton.addEventListener("click", hideLetters);
logButton.addEventListener("click", hideLog);
copyButton.addEventListener("click", copy);
modeButton.addEventListener("click", changeMode);
settingsButton.addEventListener("click", toggleSettings);
guessButton.addEventListener("click", interactiveGuess);
undoButton.addEventListener("click", interactiveUndo);
hardModeBox.addEventListener('change', function () { hardMode = this.checked })

let interactiveGameActive = false;
function playWordle() {
    if (interactiveMode) {
        const goal = word.value.toLowerCase();
        starter = starterInput.value;
        if (starter.length !== 5) {
            alert(`Start word '${starter}' is not 5 letters`);
            return -1;
        }
        if (!words.includes(starter) && !answerWords.includes(starter)) {
            alert(`Start word '${starter}' is not an allowed word!`);
            return -1;
        }

        g = new Game(hardMode);
        interactiveGameActive = true;
        if (g.setGoalWord(goal)) {
            g.addWord(starter);
            g.logRemainingWords();
        }
        rerender();

        guessInput.removeAttribute('disabled');
        guessButton.removeAttribute('disabled');
        undoButton.removeAttribute('disabled');
    } else {
        solveWordle(word.value.toLowerCase(), true);
    }
}

function interactiveUndo(){
    if (!interactiveMode) {
        alert("Switch to interactive mode to undo!");
        return;
    }
    if (!interactiveGameActive) {
        alert("Start an interactive game to undo!");
        return;
    }
    let guessed = g._guessedWords.filter(e => {return e.length !== 0});
    if(guessed.length <= 1){
        alert("No guesses to undo!");
        return;
    }

    guessed.pop();
    const goal = g._goalWord;
    const hard = g._hardMode;
    g = new Game(hard);
    g.setGoalWord(goal);

    for(let i = 0; i < guessed.length; i++){
        g.addWord(guessed[i]);
        g.logRemainingWords();
    }
    rerender();
}

function interactiveGuess() {
    if (!interactiveMode) {
        alert("Switch to interactive mode to guess!");
        return;
    }
    if (!interactiveGameActive) {
        alert("Start an interactive game to guess!");
        return;
    }

    const guessWord = guessInput.value.toLowerCase();
    if (guessWord.length !== 5) {
        alert(`Guessed word '${guessWord}' is not 5 letters`);
        return -1;
    }
    if (!words.includes(guessWord) && !answerWords.includes(guessWord)) {
        alert(`Guessed word '${guessWord}' is not an allowed word!`);
        return -1;
    }

    if(g._guessedWords.includes(guessWord)){
        alert(`You can't make the same guess twice!`);
        return -1;
    }
    if(hardMode){
        if(!g.isValidHardModeGuess(guessWord)){
            alert(`Guessed word '${guessWord}' does not follow Hard Mode rules!`);
            return -1;
        }
    }

    g.addWord(guessWord);
    g.logRemainingWords();
    rerender();
    if(g._solved){
        interactiveGameActive = false;
        guessInput.setAttribute('disabled', '');
        guessButton.setAttribute('disabled', '');
        undoButton.setAttribute('disabled', '');
    }
}

function changeMode() {
    if (interactiveContainer.style.display === "none") {
        interactiveContainer.style.display = "block";
        modeButton.setAttribute("value", "Solver Mode");
        interactiveMode = true;
    } else {
        interactiveContainer.style.display = "none";
        modeButton.setAttribute("value", "Interactive Mode");
        interactiveMode = false;
    }
}

function toggleSettings() {
    if (settingsContainer.style.display === "none") {
        settingsContainer.style.display = "block";
        settingsButton.setAttribute("value", "Hide Settings");
    } else {
        settingsContainer.style.display = "none";
        settingsButton.setAttribute("value", "Show Settings");
    }
}

function copy() {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = g._copyString;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    alert("Copied to Clipboard");
}

function hideLog() {
    if (log.style.display === "none") {
        log.style.display = "block";
        logButton.setAttribute("value", "Hide Log");
    } else {
        log.style.display = "none";
        logButton.setAttribute("value", "Show Log");
    }
}

function hideLetters() {
    const tiles = document.getElementsByClassName('tile');
    for (let i = 0; i < tiles.length; i++) {
        const classList = tiles[i].classList;
        let color = 'black';
        if (classList.contains('black')) {
            color = "#414141";
        } else if (classList.contains('yellow')) {
            color = "#b59f3b";
        } else if (classList.contains('green')) {
            color = "#538d4e";
        }
        if (tiles[i].style.color === '') {
            tiles[i].style.color = color;
        } else if (tiles[i].style.color !== 'white') {
            tiles[i].style.color = "white";
        } else {
            tiles[i].style.color = color;
        }
    }
}

let secondGuesses = [];

function solveWordle(goal, render) {
    starter = starterInput.value;
    if (starter.length !== 5) {
        alert(`Start word '${starter}' is not 5 letters`);
        return -1;
    }
    if (!words.includes(starter) && !answerWords.includes(starter)) {
        alert(`Start word '${starter}' is not an allowed word!`);
        return -1;
    }

    g = new Game(hardMode);
    interactiveGameActive = false;
    guessInput.setAttribute('disabled', '');
    guessButton.setAttribute('disabled', '');
    undoButton.setAttribute('disabled', '');
    let returnVal = -1;
    if (g.setGoalWord(goal)) {
        g.addWord(starter);
        let lastGuess = starter;
        let guesses = 1;
        let nextGuess = g.getNextGuess();
        while (nextGuess !== lastGuess && guesses <= 6) {
            if (guesses === 2) {
                secondGuesses.push(nextGuess);
            }
            if (guesses !== 6) {
                lastGuess = nextGuess;
                g.addWord(lastGuess);
                nextGuess = g.getNextGuess();
            }
            guesses++;
        }
        returnVal = guesses;
    }
    if (render) {
        rerender();
    }
    return returnVal;
}

let scDistVerify = 0;
function getScoreDistribution() {
    starter = starterInput.value;
    if (starter.length !== 5) {
        alert(`Start word '${starter}' is not 5 letters`);
        return -1;
    }
    if (!words.includes(starter) && !answerWords.includes(starter)) {
        alert(`Start word '${starter}' is not an allowed word!`);
        return -1;
    }

    if (scDistVerify === 0) {
        alert("This runs the algorithm on all ~2300 words, and will take upwards of 30 minutes. If you are sure you want to run this press the button again...")
        scDistVerify = 1;
        distributionButton.style = 'background-color: greenyellow;';
        return -1;
    }
    alert("Preparing to run all ~2300 words. Test progress will be displayed in the console, and results to the log. The test is completed when the button returns to normal.");

    secondGuesses = [];
    const logArr = [];
    const log = document.getElementById('log');
    const scores = { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [] };
    const limit = 2500;

    for (let i = 0; i < answerWords.length && i < limit; i++) {
        const score = solveWordle(answerWords[i], false);
        scores[score].push(answerWords[i]);
        if (i % 100 === 0) {
            console.log(`Solved ${i} wordles.`);
        }
        if (score === 7) {
            console.log(`Failed to solve: ${answerWords[i]}`);
        }
    }
    console.log(scores);
    for (let i = 1; i <= 7; i++) {
        logArr.push(`Wordles in ${i}: ${scores[i].length}`);
    }

    const count = {};
    for (const element of secondGuesses) {
        if (count[element]) {
            count[element] += 1;
        } else {
            count[element] = 1;
        }
    }
    const sortable = [];
    for (const element in count) {
        sortable.push([element, count[element]]);
    }
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });
    //console.log(sortable);
    //console.log(secondGuesses);
    logArr.push('');
    logArr.push(`Had ${sortable.length} unique second word choices`);
    for (let i = 0; i < 25; i++) {
        logArr.push(`Word ${sortable[i][0]} had ${sortable[i][1]} uses.`);
    }

    let str = '';
    logArr.forEach(e => {
        str += e + "\n";
    });
    log.innerHTML = str;

    distributionButton.style = '';
    scDistVerify = 0;
}

function rerender() {
    g.render(document.getElementById('board'));
    g.renderLog(document.getElementById('log'));
}



function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

//console.log(JSON.stringify(shuffle(answerWords)));