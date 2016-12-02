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

function openingMove (humanMoves) {
  const centerSquare = 4
  const cornerSquares = [0, 2, 6, 8]
  if(humanMoves.indexOf(centerSquare) === -1) {
    return centerSquare
  } else {
    return cornerSquares[Math.floor(Math.random() * cornerSquares.length)]
  }
}


function isWinner (playerMoves) {
  if(playerMoves.length < 3) { return false }
  for(var i = 0; i < TTT_WINNERS.length; i++) {
    if(qtyMatches(TTT_WINNERS[i], playerMoves) === 3) {
      console.log('is winner')
      return true
    }
  }
  console.log('not a winner')
  return false
}
function isTie (botMoves, humanMoves) {
  if(!isWinner(botMoves) && !isWinner(humanMoves)) {
    return true
  } else {
    return false
  }
  // if 1 available move, test next player's move and see if it is a win, then return false, else return true
  // return false
}


function qtyMatches (pattern, playerMoves) {
  const qty = _.intersection(pattern, playerMoves).length
  //console.log('qty matches: ', qty, ' pattern: ', pattern, ' playerMoves: ', playerMoves)
  return qty
}

const winningMove = (playerMoves, availableMoves) => {
  let winningMove
  for(var i = 0; i < TTT_WINNERS.length; i++) {
     console.log('TTT_WINNERS[i]: ', TTT_WINNERS[i], 'playerMoves: ', playerMoves, 'avail: ', _.intersection(TTT_WINNERS[i], availableMoves))
    if(_.intersection(TTT_WINNERS[i], playerMoves).length === 2 && _.intersection(TTT_WINNERS[i], availableMoves).length === 1) {
      winningMove = _.intersection(TTT_WINNERS[i], availableMoves)
      console.log('winning move: ', winningMove)
      return winningMove
    }
  }
  return []
}
// function winningMove (playerMoves, availableMoves) {
//   const winningPattern = TTT_WINNERS.filter(pattern => {
//     //console.log('_.intersection(winner, availableMoves): ', _.intersection(winner, availableMoves), 'winner: ', winner)
//     //console.log('qtyMatches: ', qtyMatches(pattern, playerMoves), ' pattern: ', pattern, ' moves: ', playerMoves)
//     if(qtyMatches(pattern, playerMoves) === 2 && _.intersection(pattern, availableMoves).length > 0) {
//       return true
//     }
//   })
//   const winMove = _.intersection(winningPattern[0], availableMoves)
//   console.log('winningPattern: ', winningPattern[0])
//   return winMove
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
    human.player = selectedPlayer
    bot.player = selectedPlayer === 'x' ? 'o' : 'x'
    bot.moves = []
    human.moves = []
    const totalMoves = () => bot.moves.length + human.moves.length
    const availableMoves = () => {
      const currentMoves = _.concat(bot.moves, human.moves)
      const avail = _.difference(allMoves, currentMoves)
      return avail
    }
    function botMove () {
      if(bot.moves.length === 0) {
        console.log('opening move')
        playerMove(bot, openingMove(human.moves))
      } else if (bot.moves.length >= 2 && winningMove(bot.moves, availableMoves()).length > 0) {
        console.log('check if bot has winning move')
        playerMove(bot, winningMove(bot.moves, availableMoves()))
        return
      } else if(human.moves.length >= 2 && winningMove(human.moves, availableMoves()).length > 0) {
        console.log('check if human has winning move')
        playerMove(bot, winningMove(human.moves, availableMoves()))
        return
      } else {
        console.log('bot moves: ', bot.moves)
        console.log('winning move: ', winningMove(bot.moves, availableMoves()))
        const moveCandidates = TTT_WINNERS.filter(winner => {
          const winHasAvailableMoves = _.intersection(winner, availableMoves()).length > 0

          const patternHasBotMove = winner => {
            for(var i = 0; i < bot.moves.length; i++) {
              if(_.includes(winner, bot.moves[i])) {
                return true
              }
            }
            return false
          }

          const patternHasHumanMove = winner => {
            for(var i = 0; i < human.moves.length; i++) {
              if(_.includes(winner, human.moves[i])) {
                return true
              }
            }
            return false
          }

          if(winHasAvailableMoves && patternHasBotMove(winner) && !patternHasHumanMove(winner)) {
            return winner
          }
        })
        const botMoveCandidates = _.pullAll(_.flatten(moveCandidates), bot.moves)

        const humanMoveWinners = TTT_WINNERS.filter(winner => {
          for(var i = 0; i < human.moves.length; i++) {
            if(_.includes(winner, human.moves[i])) {
              return true
            }
          }
        })
        const blockingBotMoves = botMoveCandidates.filter(move => {
          for(var i = 0; i < humanMoveWinners.length; i++) {
            if(_.includes(humanMoveWinners[i], move)) {
              return true
            }
          }
        })

        if(blockingBotMoves.length > 0) {
          playerMove(bot, blockingBotMoves[0])
        } else {
          playerMove(bot, botMoveCandidates[Math.floor(Math.random() * botMoveCandidates.length)])
        }
      }
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
      $button.replaceWith($playedSquare.append(player.player))
      player.moves.push(selectedSquare)
      //console.log('totalMoves(): ', totalMoves())
      if(totalMoves() > 2 && isWinner(player.moves)) {
         console.log('we have a winner: ', player)
         return
       } else if(totalMoves() === 9 && isTie(bot.moves, human.moves)) {
        console.log('bot.moves: ', bot.moves)
         console.log('it is a tie')
         return
       } else {
         if(player === human) {
           botMove()
         } else {
           humanMove()
         }
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
