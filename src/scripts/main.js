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
const TTT_ROWS = 3
const TTT_COLUMNS = 3
const tttSquare = function (id) {
  this.id = id
  this.state = ''
}

const tttMoves = []
// { id: 0, state: ''|'x'|'o'}
let selectedPlayer

const qtyMovesCompleted = () => _.filter(tttMoves, move => move.state !== '').length

const qtyMovesRemaining = () => (TTT_ROWS * TTT_COLUMNS) - qtyMovesCompleted()

const availableMoves = () => {
  const moves = _.filter(tttMoves, move => move.state === '')
  return _.map(moves, move => move.id)
}

const movesByPlayer = player => {
  const moves =  _.filter(tttMoves, move => move.state === player.mark)
  // console.log('moves: ', moves)
  return _.map(moves, move => move.id)
}

const firstMove = opponent => {
  const centerSquare = 4
  const cornerSquares = [0, 2, 6, 8]
  //console.log('includes center: ', _.includes(movesByPlayer(opponent), centerSquare))
  if(_.includes(movesByPlayer(opponent), centerSquare)) {
    return cornerSquares[Math.floor(Math.random() * cornerSquares.length)]
  } else {
    return centerSquare
  }
}

// what winning patterns match one player move AND 1 or more available moves?
const moveCandidates = (playerMoves, opponentMoves) => {
  const winningMovePatterns = _.filter(TTT_WINNERS, pattern => _.intersection(pattern, playerMoves).length > 0 && _.intersection(pattern, opponentMoves).length === 0)
  const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
  // console.log('moves: ', _.flatten(moves))
  return _.flatten(moves)
}
// {
//     const winningMovePatterns = _.filter(TTT_WINNERS, winner =>  _.intersection(winner, playerMoves).length > 0
//     {
//       const winWithPlayerMoves = _.intersection(winner, playerMoves).length > 0
//       const winWithAvailableMoves = _.intersection(winner, availableMoves()).length > 0
//         //  console.log('winWithOnePlayerMove: ', winWithOnePlayerMove)
//         //  console.log('winWithOneAvailableMove: ', winWithOneAvailableMove)
//       return winWithPlayerMoves && winWithAvailableMoves
//     })
//     console.log('winningMovePatterns: ', winningMovePatterns)
//     const moves = _.map(winningMovePatterns, pattern => _.pullAll(pattern, availableMoves()))
//     // console.log('moves: ', moves)
//     return moves
// }

$(function() {
  const $messages = $('.messages')

  function newGame() {
    const $newGame = $('.new-game')
    const $playerOptions = $('.player-options')
    $messages.text('Which player would you like to be?')
    $messages.show()
    $playerOptions.show()
    $('.select-player').on('click', selectPlayer)

    function selectPlayer() {
      selectedPlayer = $(this).data('player')
      $('.select-player').off()
      $playerOptions.hide()
      $messages.hide()
      $newGame.hide()
      createBoard(runGame)
    }
  }

  function runGame() {
    const bot = {}
    const human = {}
    human.mark = selectedPlayer
    bot.mark = selectedPlayer === 'x' ? 'o' : 'x'
    // bot.moves = []
    // human.moves = []

    function botMove () {
      // console.log('movesByPlayer(bot): ', movesByPlayer(bot))
      if(movesByPlayer(bot).length === 0) {
        playerMove(bot, firstMove(human))
      } else {
        console.log('next bot move...')
        // what winning patterns match one bot move AND 1 or more available moves?
        // just return the available moves
      // console.log('movesByPlayer(bot): ', movesByPlayer(bot))
        const botMoveCandidates = moveCandidates(movesByPlayer(bot), movesByPlayer(human))
        console.log('botMoveCandidates: ', botMoveCandidates)

        // what winning patterns match one human move AND 1 or more available moves?
        // just return the available moves
        const humanMoveCandidates = moveCandidates(movesByPlayer(human), movesByPlayer(bot))
        console.log('humanMoveCandidates: ', humanMoveCandidates)
        // do moves for my winning pattern and a human winning pattern intersect?
        // if yes, select first overlapping value
        // if no, select first winning move
        // if none, select a random available move

      }
      // check for winning moves
      // if (movesByPlayer(bot).length >= 2 && winningMove(movesByPlayer(bot), availableMoves()).length > 0) {
      //   console.log('check if bot has winning move')
      //   playerMove(bot, winningMove(bot.moves, availableMoves()))
      //   return
      // } else if(movesByPlayer(human).length >= 2 && winningMove(human.moves, availableMoves()).length > 0) {
      //   console.log('check if human has winning move')
      //   playerMove(bot, winningMove(human.moves, availableMoves()))
      //   return
      // } else {
        // console.log('bot moves: ', bot.moves)


      //   const moveCandidates = TTT_WINNERS.filter(winner => {
      //     const winHasAvailableMoves = _.intersection(winner, availableMoves()).length > 0
      //
      //     const patternHasBotMove = winner => {
      //       for(var i = 0; i < bot.moves.length; i++) {
      //         if(_.includes(winner, bot.moves[i])) {
      //           return true
      //         }
      //       }
      //       return false
      //     }
      //
      //     const patternHasHumanMove = winner => {
      //       for(var i = 0; i < human.moves.length; i++) {
      //         if(_.includes(winner, human.moves[i])) {
      //           return true
      //         }
      //       }
      //       return false
      //     }
      //
      //     if(winHasAvailableMoves && patternHasBotMove(winner) && !patternHasHumanMove(winner)) {
      //       return winner
      //     }
      //   })
      //   const botMoveCandidates = _.pullAll(_.flatten(moveCandidates), bot.moves)
      //
      //   const humanMoveWinners = TTT_WINNERS.filter(winner => {
      //     for(var i = 0; i < human.moves.length; i++) {
      //       if(_.includes(winner, human.moves[i])) {
      //         return true
      //       }
      //     }
      //   })
      //   const blockingBotMoves = botMoveCandidates.filter(move => {
      //     for(var i = 0; i < humanMoveWinners.length; i++) {
      //       if(_.includes(humanMoveWinners[i], move)) {
      //         return true
      //       }
      //     }
      //   })
      //
      //   if(blockingBotMoves.length > 0) {
      //     playerMove(bot, blockingBotMoves[0])
      //   } else {
      //     playerMove(bot, botMoveCandidates[Math.floor(Math.random() * botMoveCandidates.length)])
      //   }
      // }
    }

    function humanMove () {
      const $emptySquare = $('.empty-square')
      $emptySquare.on('click', function(){
        var selectedSquare = $(this).parent().data('square-id')
        $emptySquare.off()
        playerMove(human, selectedSquare)
      })
    }

    function playerMove (player, selectedSquare) {
      const $square = $(`div[data-square-id=${selectedSquare}]`)
      const $button = $square.children('.empty-square')
      const $playedSquare = $(document.createElement('div')).addClass('played-square')
      $button.replaceWith($playedSquare.append(player.mark))
      const square = _.find(tttMoves, move => move.id === selectedSquare)
      square.state = player.mark
      //console.log('selected: ', square)
      //player.moves.push(selectedSquare)
      // console.log('playerMoves(): ', playerMoves(player))
      // if(qtyMovesCompleted() > 2 && isWinner(player.moves)) {
      //    console.log('we have a winner: ', player)
      //    return
      //  } else if(qtyMovesCompleted() === 9 && isTie(bot.moves, human.moves)) {
      //   console.log('bot.moves: ', bot.moves)
      //    console.log('it is a tie')
      //    return
      //  } else {
      // }
      // console.log('qtyMovesRemaining: ', qtyMovesRemaining())
      if(qtyMovesRemaining() > 0) {
        if(player === human) {
          botMove()
        } else {
          humanMove()
        }
      } else {
        console.log('no moves remaining - check for tied game or win')
      }
    }

    function startGame() {
      if(human.player === 'x') {
        humanMove()
      } else {
        botMove()
      }
    }
    startGame()
  }

  function createBoard (done) {
    const $board = $('.ttt-board')
    let squareId = 0
    const $emptySquare = $(document.createElement('button')).addClass('empty-square')
    const $square = $(document.createElement('div')).addClass('grid-cell').append($emptySquare)
    const $row = $(document.createElement('div')).addClass('grid-row')
    function addRow() {
      var $boardRow = $row.clone()
      for (var i = 0; i < TTT_COLUMNS; i++) {
        $(addSquare()).appendTo($boardRow)
      }
      return $boardRow
    }
    function addSquare() {
      var $boardSquare = $square.clone()
      $boardSquare.attr('data-square-id', squareId)
      const square = new tttSquare(squareId)
      // console.log('new square: ', square)
      tttMoves.push(square)
      squareId++
      return $boardSquare
    }
    for (var i = 0; i < TTT_ROWS; i++) {
      $(addRow()).appendTo($board)
    }
    done()
  }
  newGame()
})
// function isWinner (playerMoves) {
//   if(playerMoves.length < 3) { return false }
//   for(var i = 0; i < TTT_WINNERS.length; i++) {
//     if(qtyMatches(TTT_WINNERS[i], playerMoves) === 3) {
//       console.log('is winner')
//       return true
//     }
//   }
//   console.log('not a winner')
//   return false
// }
//
// function isTie (botMoves, humanMoves) {
//   if(!isWinner(botMoves) && !isWinner(humanMoves)) {
//     return true
//   } else {
//     return false
//   }
// }

// function qtyMatches (pattern, playerMoves) {
//   const qty = _.intersection(pattern, playerMoves).length
//   //console.log('qty matches: ', qty, ' pattern: ', pattern, ' playerMoves: ', playerMoves)
//   return qty
// }
// check if a move is a winning move
// get the current move, loop through ttt winners, filter for
// for each matching winner  is there a winner in which all three have a matching square.state?
// const isWinner = lastMoveId => {
//   const matchingWinners = _.filter(TTT_WINNERS, winner => _.includes(winner, lastMoveId))
// }


// check if a winning move exists for this player
// loop through winning patterns
// look for a patterns with two matches and one available move
// return available move
// if none. return false?

// const patternsWithPlayerMoves = player => _.filter(TTT_WINNERS, pattern => qtyMatches(pattern, movesByPlayer(player)) > 0)
//
//  {
//   const nextMoveCandidates =
//   console.log('winningMoveCandidates: ',winningMoveCandidates)
//   if (winningMoveCandidates.length > 0) {
//     return _.intersection(winningMoveCandidates[0], availableMoves)
//   } else {
//     return []
//   }
// }
