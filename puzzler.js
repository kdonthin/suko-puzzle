class Deck
{
    constructor(size)
    {
        this.size = size ;

        this.reset()
    }

    shuffle()
    {
        for (let i = 0; i < 7; ++i )
        {
            var index1 = Math.floor(Math.random()*this.deck.length) ;
            var index2 = Math.floor(Math.random()*this.deck.length) ;
    
            if ( index1 != index2 )
            {
                let temp = this.deck[index1] ;
                this.deck[index1] = this.deck[index2] ;
                this.deck[index2] = temp ;
            }
        }  
    }

    pop()
    {
        return ( this.deck.length ? this.deck.pop() : 0) ;
    }

    reset()
    {
        this.deck = [] ;

        for( let i = 0; i < this.size; ++i)
        {
            this.deck.push(i+1) ;
        }
    }
}

class Tile
{
    constructor(value, selected, enabled)
    {
        this.value = value ;
        this.selected = selected ;
        this.enabled = enabled ;
    }
}

const ADD = "←" ;
const REMOVE = "→" ;

class Step
{
    constructor(action, digit, row, column)
    {
        this.action = action ;
        this.digit = digit ;
        this.row = row ;
        this.column = column ;
    }

    toString()
    {
        if (this.action == ADD)
        {
            return `[${this.row},${this.column}] ${this.action} ${this.digit}` ;
        }
        else
        {
            return `[${this.row},${this.column}] ${this.action} ${this.digit}` ;
        }
    }
}

class Steps
{
    constructor()
    {
        this.steps = [] ;
    }

    push(step)
    {
        this.steps.push(step) ;
    }

    pop()
    {
        if (this.steps.length > 0)
        {
            return this.steps.pop() ;
        }
        else
        {
            return "" ;
        }
    }

    clear()
    {
        this.steps = [] ;
    }

    count()
    {
        return this.steps.length ;
    }

    toString()
    {
        let result = "" ;

        for (let i = 0 ; i < this.steps.length ; ++i)
        {
            result += `${i+1}. ${this.steps[i].toString()}\n` ;
        }

        return result ;
    }
}

var tiles ;

var solution = [[],[],[]] ;
var userAnswers = [[0,0,0],[0,0,0],[0,0,0]] ;

var board = [[],[],[],[]] ;
var sumBoard = [[],[]] ;
var boardColors ; // Randomize board colors
var steps = new Steps() ;

var TILES = $("#tiles > div") ;
var BOARD = $("#board > .box") ;
var lockApp = false ; // lockApp when showing answer.
var timerId ;
var timerStartTime ;
var timePastSec ;
var isPuzzleCorrect ;

const GAME_INTRO = "\nINSTRUCTIONS:\nPlace the numbers 1-9 in the spaces so that the number in each circle is equal to the sum of the four surrounding spaces and each color total is correct.\nClick on tile to select and click on box(Board) to place it.\nInspired by WSJ Suko Number Puzzle." ;

function createSolution()
{
    let deck = new Deck(9) ;

    deck.shuffle() ;

    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            solution[row][col] = deck.pop() ;
        }
    }
}

function setBoard()
{
    createSolution() ;

    board[0].push($("#A1"))
    board[0].push($("#A2"))
    board[0].push($("#A3"))

    board[1].push($("#B1"))
    board[1].push($("#B2"))
    board[1].push($("#B3"))

    board[2].push($("#C1"))
    board[2].push($("#C2"))
    board[2].push($("#C3"))

    board[3].push($("#D1"))
    board[3].push($("#D2"))
    board[3].push($("#D3"))

    boardColors = [[1,0,3],[1,2,3],[0,2,0]] ;

    var positionDeck = new Deck(3) ;
    var colorDeck = new Deck(3) ;

    positionDeck.shuffle() ;
    colorDeck.shuffle() ;

    setBoardColor(positionDeck.pop(), colorDeck.pop()) ;
    setBoardColor(positionDeck.pop(), colorDeck.pop()) ;
    colorDeck.reset() ;
    setBoardColor(positionDeck.pop(), colorDeck.pop()) ;

    boardColors = rotateBoardColors(boardColors) ;

    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            board[row][col].addClass(`cat${boardColors[row][col]}`) ;
            board[row][col].click(function() {
                boardClicked(row, col) ;
            })
        }
    }

    for (let col = 0; col < 3; ++col)
    {
        board[3][col].addClass(`cat${col+1}`) ;
        board[3][col].text(solution[0][col]+solution[1][col]+solution[2][col]) ;

        board[3][col].text(calculateSumForColor(col+1)) ;
    }

    sumBoard[0].push($("#SA1"))
    sumBoard[0].push($("#SA2"))
    sumBoard[1].push($("#SB1"))
    sumBoard[1].push($("#SB2"))

    sumBoard[0][0].text(solution[0][0] + solution[0][1] + solution[1][0] + solution[1][1]) ;
    sumBoard[0][1].text(solution[0][1] + solution[0][2] + solution[1][1] + solution[1][2] ) ;
    sumBoard[1][0].text(solution[1][0] + solution[1][1] + solution[2][0] + solution[2][1] ) ;
    sumBoard[1][1].text(solution[1][1] + solution[1][2] + solution[2][1] + solution[2][2] ) ;

    TILES = $("#tiles > div") ;
    
    // initialize tiles
    initializeTiles() ;

    steps.clear() ;
    updateBoard() ;
    updateTiles() ;

    TILES.click(function() {
        tileClicked(this) ;
    }) ;

    timerId = setInterval(updateTimer, 1000) ;
    timerStartTime = new Date() ;
    isPuzzleCorrect = false ;    
}

function rotateBoardColors(boardColors)
{
    let randomDeck = new Deck(4) ;

    randomDeck.shuffle() ;

    let rotationCount = randomDeck.pop() ;


    for( let i = 0; i <= rotationCount; ++i)
    {
        boardColors = rotateBoardColorsOnce(boardColors) ;
    }

    return boardColors ;
}

function rotateBoardColorsOnce(boardColors)
{
    let newBoardColors = [[0,0,0], [0,0,0], [0,0,0]] ;

    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            newBoardColors[col][2-row] = boardColors[row][col] ;
        }
    }

    return newBoardColors ;
}

function updateTimer()
{
    let now = new Date() ;
    timePastSec = Math.floor((now - timerStartTime)/1000) ;

    $("#timer").val(secondsToTimeString(timePastSec)) ;
}

function secondsToTimeString(timePastSec)
{
    let hours = Math.floor(timePastSec/3600) ;
    let minutes = Math.floor((timePastSec%3600)/60) ;
    let seconds = Math.floor(timePastSec%60) ;

    if ( hours )
    {
        return `${leadingZero(hours)}:${leadingZero(minutes)}:${leadingZero(seconds)}`
    }
    else
    {
        return `${leadingZero(minutes)}:${leadingZero(seconds)}`
    }
}

function leadingZero(number)
{
    return number > 9 ? number : "0" + number ; 
}

function initializeTiles()
{
    tiles = [] ;
    
    for( let i = 1; i <= 9 ; ++i)
    {
        tiles.push(new Tile(i, false, true)) ;
    }
}

function clearTileSelection()
{
    for( let i = 0; i < 9 ; ++i)
    {
        tiles[i].selected = false ;
    }
}

function calculateSumForColor(color)
{
    let total = 0 ;

    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            if ( boardColors[row][col] == color)
            {
                total += solution[row][col] ;
            }
        }
    }

    return total ;
}

function boardClicked(row, col)
{
    if ( isAppLocked() )
    {
        return ;
    }

    selectedTileIndex = getSelectedTileIndex() ;

    if ( selectedTileIndex < 0 )
    {
        if (userAnswers[row][col] != 0)
        {
            steps.push(new Step(REMOVE, userAnswers[row][col], row, col )) ;
            tiles[userAnswers[row][col]-1].enabled = true ;
            tiles[userAnswers[row][col]-1].selected = true ;
            userAnswers[row][col] = 0 ;
            updateBoard() ;
            updateTiles() ;
        }
        else
        {
            // alert("Select a tile before selecting box.") ;
            logToPage("Select a tile before selecting box.") ;
        }
    }
    else
    {
        if ( userAnswers[row][col] != 0)
        {
            tiles[userAnswers[row][col]-1].enabled = true ;
            tiles[userAnswers[row][col]-1].selected = true ;
            steps.push(new Step(REMOVE, userAnswers[row][col], row, col )) ;
        }

        userAnswers[row][col] = tiles[selectedTileIndex].value ;
        tiles[selectedTileIndex].selected = false ;
        tiles[selectedTileIndex].enabled = false ;
        steps.push(new Step(ADD, userAnswers[row][col], row, col )) ;

        updateBoard() ;
        updateTiles() ;
    }
}

function setBoardColor(position, color)
{
    if ( position == 1)
    {
        boardColors[0][1] = color ;
    }
    else if ( position == 2)
    {
        boardColors[2][0] = color ;
    }
    else
    {
        boardColors[2][2] = color ;
    }
}

function getSelectedTileIndex()
{
    for( let i = 0; i < 9 ; ++i)
    {
        if ( tiles[i].selected )
        {
            return i ;
        }
    }

    return -1 ;
}


function tileClicked(e)
{
    if (isAppLocked())
    {
        return ;
    }

    let result = !tiles[e.innerText-1].selected ;

    if (!tiles[e.innerText-1].enabled) return ;

    tiles.forEach(tile => {
        tile.selected = false ;
    });

    tiles[e.innerText-1].selected = result ;

    updateTiles() ;
}

function updateTiles()
{
    TILES.removeClass("tileSelected").removeClass("tileNotSelected").removeClass("tileEnabled").removeClass("tileDisabled") ;

    TILES.each(function(index) {
        this.innerText = tiles[index].value ;
        tiles[index].selected ? $(this).addClass("tileSelected") : $(this).addClass("tileNotSelected") ;
        tiles[index].enabled ? $(this).addClass("tileEnabled") : $(this).addClass("tileDisabled") ;
    }) ;
}

function updateBoard()
{
    showSteps() ;
    showAnswer(false) ; // show user answers on board
    markTotalFields() ; // mark total fields with correct/incorrect colors.
    checkAnswer(true) ; // check automatically
}

function markTotalFields()
{
    let result = markGridTotalField(0,0) ;
    
    result = markGridTotalField(0,1) && result ;
    result = markGridTotalField(1,0) && result ;
    result = markGridTotalField(1,1) && result ;

    result = markColorTotalField(1) && result ;
    result = markColorTotalField(2) && result ;
    result = markColorTotalField(3) && result ;

    return result ;
}

function markGridTotalField(row, col)
{
    if ( userAnswers[row][col] && userAnswers[row][col+1] && userAnswers[row+1][col] && userAnswers[row+1][col+1] )
    {
        let userTotal = userAnswers[row][col] + userAnswers[row][col+1] + userAnswers[row+1][col] + userAnswers[row+1][col+1] ;

        if ( sumBoard[row][col].text() == userTotal )
        {
            sumBoard[row][col].removeClass("incorrect").addClass("correct") ;

            return true ;
        }
        else
        {
            sumBoard[row][col].removeClass("correct").addClass("incorrect") ;
        }
    }
    else
    {
        sumBoard[row][col].removeClass("correct").removeClass("incorrect") ;
    }

    return false ;
}

function markColorTotalField(color)
{
    let userTotal = 0 ;
    let isColorComplete = true ;

    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            if ( boardColors[row][col] == color)
            {
                if ( userAnswers[row][col] == 0 )
                {
                    isColorComplete = false ;

                    break ;
                }
                else
                {
                    userTotal += userAnswers[row][col] ;
                }
            }
        }
    }

    if ( isColorComplete )
    {
        if ( board[3][color-1].text() == userTotal)
        {
            board[3][color-1].removeClass("incorrect").addClass("correct") ;

            return true ;
        }
        else
        {
            board[3][color-1].removeClass("correct").addClass("incorrect") ;
        }
    }
    else
    {
        board[3][color-1].removeClass("correct").removeClass("incorrect") ;
    }

    return false ;
}

function showAnswer(show)
{
    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            board[row][col].text(show ? solution[row][col] : userAnswers[row][col] ? userAnswers[row][col] : "") ;
        }
    }
}

function checkAnswer(autoCheck)
{
    let isComplete = true ;
    let isCorrect = true ;
    let wrongAnswers = 0 ;

    for (let row = 0; row < 3; ++row)
    {
        for (let col = 0; col < 3; ++col)
        {
            if ( userAnswers[row][col] == 0 )
            {
                isComplete = false ;

                break ;
            }
        }
    }

    if ( isComplete )
    {
        for (let row = 0; row < 3; ++row)
        {
            for (let col = 0; col < 3; ++col)
            {
                if ( userAnswers[row][col] != solution[row][col] )
                {
                    isCorrect = false ;
    
                    ++wrongAnswers ;
                }
            }
        }

        if ( isCorrect )
        {
            clearInterval(timerId) ;

            setTimeout(function() {
                    alert(`Congratulations, you completed puzzle in [${secondsToTimeString(timePastSec)}] !!!!`) ;
                 }, 500) ;
            
            logToPage(`Checking - Congratulations, you completed puzzle in [${secondsToTimeString(timePastSec)}]`) ;
            isPuzzleCorrect = true ;
        }
        else if (markTotalFields())
        {
            setTimeout(function() {
                alert(`Congratulations, You found alternative Solution in [${secondsToTimeString(timePastSec)}] !!!!`) ;
             }, 500) ;
        
            logToPage(`Checking - Congratulations. You have found alternative solution in [${secondsToTimeString(timePastSec)}] !!!!.`) ;
            isCorrect = true ;
        }
        else if (!autoCheck) // log & alert only if not auto check
        {
            alert(`Incorrect. You have ${wrongAnswers} wrong answers.`) ;
            logToPage(`Checking - Incorrect. You have ${wrongAnswers} wrong answers.`) ;
        }
    }
    else if (!autoCheck) // log only if not auto check
    {
        // alert("Please fill all boxes...") ;
        logToPage("Checking - Incomplete, fill all boxes.") ;

        return ;
    }
}

function toggleAnswer()
{
    answer = $("#answer") ;

    if ( !lockApp )
    {
        if (!confirm("Aer you sure you want to reveal answers?"))
        {
            return ;
        }
    }

    if ( answer.val() == "Show Answer" )
    {
        logToPage("Showing Answer.") ;
        showAnswer(true) ;
        answer.val("Hide Answer") ;
        lockApp = true ;
    }
    else
    {
        logToPage("Hiding answer...") ;
        showAnswer(false) ;
        answer.val("Show Answer") ;
        lockApp = false ;
    }
}

function isAppLocked()
{
    if ( lockApp )
    {
        alert("Board is locked while showing answer!!!") ;
        logToPage(`Board is locked while showing answer!!!`) ;

        return true ;
    }

    return false ;
}

function resetBoard()
{
    if (lockApp)
    {
        toggleAnswer() ;
    }
    else if (!confirm("Aer you sure you want to reset board?"))
    {
        return ;
    }

    userAnswers = [[0,0,0],[0,0,0],[0,0,0]] ;
    initializeTiles() ;
    steps.clear() ;
    updateBoard() ;
    updateTiles() ;

    logToPage("Resetting Board...") ;
}

function newPuzzle(ask)
{
    if (!isPuzzleCorrect && ask && !confirm("Aer you sure you want to discard current puzzle?"))
    {
        return ;
    }

    if (lockApp)
    {
        toggleAnswer() ;
    }

    if ( timerId )
    {
        clearInterval(timerId) ;
    }

    $("#log").text(GAME_INTRO) ;
    logToPage(`Setting new Puzzle.`) ;

    tiles = [] ;
    solution = [[],[],[]] ;
    userAnswers = [[0,0,0],[0,0,0],[0,0,0]] ;

    board = [[],[],[],[]] ;
    sumBoard = [[],[]] ;
 
    TILES.unbind("click") ;
    $("#board > div").unbind("click") ;
    $("#board > div").removeClass("cat1").removeClass("cat2").removeClass("cat3") ;

    setBoard() ;
}

function logToPage(message)
{
    let now = new Date() ;

    let dateString = `${leadingZero(now.getHours())}:${leadingZero(now.getMinutes())}:${leadingZero(now.getSeconds())}` ;
    let currentMessages = $("#log").text() ;

    $("#log").text(`${dateString} - ${message}\n${currentMessages}`) ;
}

function showSteps()
{
    $("#steps").text(steps.toString()) ;
}

function undoStep()
{
    if ( lockApp )
    {
        alert("Board is locked while showing answer!!!") ;
        logToPage(`Board is locked while showing answer!!!`) ;

        return true ;
    }

    if ( steps.count() <= 0 )
    {
        logToPage("No steps left to undo...") ;       
    }

    step = steps.pop() ;

    if ( step.action == ADD)
    {
        clearTileSelection() ;
        userAnswers[step.row][step.column] = 0 ;
        tiles[step.digit-1].enabled = true ;
        tiles[step.digit-1].selected = true ;
    }
    else if ( step.action == REMOVE)
    {
        userAnswers[step.row][step.column] = step.digit ;
        tiles[step.digit-1].enabled = false ;
        tiles[step.digit-1].selected = false ;
    }

    updateBoard() ;
    updateTiles() ;
}
