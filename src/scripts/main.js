// import View from 'views/view';

// const g = 9.81;

'use strict'
const TTT_WINNERS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

let selectedPlayer
let allMoves = []

function qtyMatches(pattern, playerMoves){
  //console.log('pattern: ', pattern, 'playerMoves: ', playerMoves)
  var qty = 0
  for(var i = 0; i < pattern.length ; i++) {
    if(_.includes(playerMoves, pattern[i])){
      qty++
    }
  }
  return qty
}

function isWinner(playerMoves){
  if(playerMoves.length < 3) { return false }

  for(var i = 0; i < TTT_WINNERS.length ; i++){
    //console.log('isWinner: TTT_WINNERS pattern: ', TTT_WINNERS[i], 'playerMoves: ', playerMoves)
    if(qtyMatches(TTT_WINNERS[i], playerMoves) === 3){
      console.log('is winner')
      return true
    }
  }
  console.log('not a winner')
  return false
}

function openingMove(humanMoves){
  const centerSquare = 4
  const cornerSquares = [0,2,6,8]
  if(humanMoves.indexOf(centerSquare) === -1){
    return centerSquare
  } else {
    return cornerSquares[Math.floor(Math.random() * cornerSquares.length)]
  }
}

const matchingWinners = playerMove => TTT_WINNERS.filter(winner => winner.indexOf(playerMove) >= 0)
const availableWinners = availableMoves => TTT_WINNERS.filter(winner => _.intersection(winner, availableMoves).length > 0)
const availablePlayerWinners = (winnerCandidates, playerMoves) => winnerCandidates.filter(winner => {
  for(var i = 0; i < playerMoves.length ; i++){
    if(_.includes(winner, playerMoves[i])){
      return winner
    }
  }
})

$(function() {
  const $messages = $('.messages')

  function newGame() {
    const $newGame = $('.new-game')
    const $playerOptions = $('.player-options')
    $messages.text('Which player would you like to be?')
    $messages.show()
    $playerOptions.show()
    $('.select-player').on('click', selectPlayer)

    function selectPlayer(){
      selectedPlayer = $(this).data('player')
      $('.select-player').off()
      $playerOptions.hide()
      $messages.hide()
      $newGame.hide()
      createBoard(runGame)
    }
  }

  function runGame(){
    const bot = {}
    const human = {}
    human.player = selectedPlayer
    bot.player = selectedPlayer === 'x' ? 'o' : 'x'
    bot.moves = []
    human.moves = []
    const totalMoves = () => bot.moves.length + human.moves.length
    const availableMoves = () => {
      const currentMoves = _.concat(bot.moves, human.moves)
      const avail = _.difference(allMoves, currentMoves)
      // console.log('available moves: ', avail)
      return avail
    }

    function botMove() {
      if(bot.moves.length === 0 ){
        playerMove(bot, openingMove(human.moves))
      } else {
        const currentAvailableMoves = availableMoves()

        // loop through available moves - goal is to eliminate and reduce to 1

        // is there an available move that matches a winning pattern with two matches for bot.moves? if, yes, select

        // is there an available move that matches a winning pattern with two matches for human.moves? if, yes, select

        // which available moves match a winning pattern with 1 bot move?

        const moveCandidates = TTT_WINNERS.filter(winner => {

          // select if winner has available moves
          const winWithAvailableMoves = _.intersection(winner, currentAvailableMoves).length > 0

          const winningPatternHasHumanMoves = winner => {
            for(var i = 0 ; i < human.moves.length ; i++){
              if(_.includes(winner, human.moves[i])){
                return true
              }
            }
            return false
          }

          const winningPatternIncludesBotMove = winner => {
            //  console.log('bot.moves: ', bot.moves)
            for(var i = 0 ; i < bot.moves.length ; i++){
              // console.log('winner: ', winner, ' bot.moves[i]: ', bot.moves[i])
              if(_.includes(winner, bot.moves[i])){
                return true
              }
            }
            return false
          }

          if(winWithAvailableMoves && winningPatternIncludesBotMove(winner) && !winningPatternHasHumanMoves(winner)){
            return winner
          }
        })
        const botMoveCandidates = _.pullAll(_.flatten(moveCandidates), bot.moves)

        // NEXT: get the human move candidates in the same way and see which pattern has one or more overlapping moves (not matching patterns)

         // find winning patterns with human moves
        const humanMoveWinners = TTT_WINNERS.filter(winner => {
          for(var i = 0; i < human.moves.length; i++) {
            // console.log('winner: ', winner, ' bot.moves[i]: ', bot.moves[i])
            if(_.includes(winner, human.moves[i])){
              return true
            }
          }
        })
        console.log('humanMoveWinners: ', humanMoveWinners)
          console.log('botMoveCandidates: ', botMoveCandidates)
        // if a botMoveCandidate is found in humanMoveWinners
        const blockingBotMoves = botMoveCandidates.filter(move => {
          for(var i = 0; i < humanMoveWinners.length; i++) {
              console.log('humanMoveWinners[i]: ', humanMoveWinners[i])
            // console.log('winner: ', winner, ' bot.moves[i]: ', bot.moves[i])
            if(_.includes(humanMoveWinners[i], move)) {
              return true
            }
          }
        })

        console.log('blockingBotMoves: ', blockingBotMoves)
        if(blockingBotMoves.length === 0) {
          playerMove(bot, botMoveCandidates[Math.floor(Math.random() * botMoveCandidates.length)])
        } else {
          playerMove(bot, blockingBotMoves[0])
        }


        // which available moves match a winning pattern with 1 human move?
        // if they intersect, select it
        // else select a random set from the single matches
        // else select a random available move



        // const candidates = availableWinners(availableMoves())
        // console.log('candidates: ', candidates)
        // const playerCandidates = availablePlayerWinners(candidates, bot.moves)
        // console.log('nextBotMove: ', nextBotMove)
        // console.log('playerCandidates: ', playerCandidates)

      }
    }

    function humanMove() {
      // const $board = $('.ttt-board')
      // $board.addClass('human-move')
      const $emptySquare = $('.empty-square')
      $emptySquare.on('click', function(){
        var selectedSquare = $(this).parent().data('square-id')
        $emptySquare.off()
        // $board.removeClass('human-move')
        playerMove(human, selectedSquare)
      })
    }

    function playerMove (player, selectedSquare) {
      const $square = $(`div[data-square-id=${selectedSquare}]`)
      const $button = $square.children('.empty-square')
      const $playedSquare = $(document.createElement('div')).addClass('played-square')
      $button.replaceWith($playedSquare.append(player.player))
      player.moves.push(selectedSquare)
      // console.log('player: ', player.player, ', moves: ', player.moves)
      if(totalMoves() > 2 && isWinner(player.moves)){
         console.log('we have a winner: ', player)
         return
       } else if(player === human){
         botMove()
      } else {
        humanMove()
      }
    }

    function startGame(){
      if(human.player === 'x'){
        humanMove()
      } else {
        botMove()
      }
    }
    startGame()
  }

  function createBoard (done) {
    const $board = $('.ttt-board')
    const rows = 3
    const columns = 3
    let squareId = 0
    const $emptySquare = $(document.createElement('button')).addClass('empty-square')
    const $square = $(document.createElement('div')).addClass('grid-cell').append($emptySquare)
    const $row = $(document.createElement('div')).addClass('grid-row')
    function addRow() {
      var $boardRow = $row.clone()
      for (var i = 0; i < columns; i++) {
        $(addSquare()).appendTo($boardRow)
      }
      return $boardRow
    }
    function addSquare() {
      var $boardSquare = $square.clone()
      $boardSquare.attr('data-square-id', squareId)
      allMoves.push(squareId)
      squareId++
      return $boardSquare
    }
    for (var i = 0; i < rows; i++) {
      $(addRow()).appendTo($board)
    }
    done()
  }
  newGame()
})

// loop through available moves
// which moves match a winning pattern?
// filter winning patterns by available moves
// if a winning pattern includes an available move



// function nextMove(playerMoves, availableMoves){
//   const candidatePatterns =
//   for(var i = 0; i < availableMoves.length ; i++){
//     //filter available moves for winning patterns
//     // find intersection between playerMoves and winning patterns

//     if(qtyMatches(TTT_WINNERS[i], playerMoves) === 3){
//       console.log('is winner')
//       return true
//     }
//   }
//   console.log('not a winner')
//   return false
// }
// {

//   if(winner.indexOf(playerMove) >= 0){
//     return winner
//   }
// })
// function nextMove(playerMoves, available){
//   for(var i = 0; i < TTT_WINNERS.length ; i++){
//     // do current moves include two from a winning pattern?
//     if(qtyMatches(TTT_WINNERS[i], playerMoves) === 2){
//       // which move in the pattern is the winning move?
//       const move = _.difference(TTT_WINNERS[i], playerMoves)
//      // is the move available?
//      if(_.includes(available, move[0])){
//        return move
//      }
//     }
//   }
//   return []
// }

    // else if(qtyMatches(TTT_WINNERS[i], playerMoves) === 1){
    //   const possibleMoves = _.difference(TTT_WINNERS[i], playerMoves)
    //   if(_.includes(available, possibleMoves[0])){
    //    return possibleMoves
    //   }
    // }
