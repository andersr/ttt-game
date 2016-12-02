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

const tttMoves = [] // { id: 0, state: ''|'x'|'o'}
let selectedPlayer

const randomSelection = arr => arr[Math.floor(Math.random() * arr.length)]

const qtyMovesCompleted = () => _.filter(tttMoves, move => move.state !== '').length

const qtyMovesRemaining = () => (TTT_ROWS * TTT_COLUMNS) - qtyMovesCompleted()

const availableMoves = () => {
  const moves = _.filter(tttMoves, move => move.state === '')
  return _.map(moves, move => move.id)
}

const movesByPlayer = player => {
  const moves =  _.filter(tttMoves, move => move.state === player.mark)
  return _.map(moves, move => move.id)
}

const firstMove = opponent => {
  const centerSquare = 4
  const cornerSquares = [0, 2, 6, 8]
  if(_.includes(movesByPlayer(opponent), centerSquare)) {
    return randomSelection(cornerSquares)
  } else {
    return centerSquare
  }
}

const moveCandidates = (playerMoves, opponentMoves) => {
  // const matchingPlayerMoves = winningMove? 2 : 0
  const winningMovePatterns = _.filter(TTT_WINNERS, pattern => _.intersection(pattern, playerMoves).length > 0 && _.intersection(pattern, opponentMoves).length === 0)
  const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
  return _.flatten(moves)
}

const winningMove = (playerMoves, opponentMoves) => {
  const winningMovePatterns = _.filter(TTT_WINNERS, pattern => _.intersection(pattern, playerMoves).length == 2 && _.intersection(pattern, opponentMoves).length === 0)

  const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
  return _.flatten(moves)
}

const isWinner = player => {
  const winningMove = _.filter(TTT_WINNERS, pattern => _.intersection(pattern, movesByPlayer(player)).length == 3)
  //console.log('winner: ', winner)
  if (winningMove.length > 0) {
    return { winningPattern: _.flatten(winningMove), winningPlayer: player }
  } else {
    return null
  }
  // return { winningPattern: winner, winningPlayer: player }
  //return _.flatten(moves)
}

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

    function botMove () {
      if(movesByPlayer(bot).length === 0) {
        playerMove(bot, firstMove(human))
      } else {

        const winningBotMove = winningMove(movesByPlayer(bot), movesByPlayer(human))
        console.log('winningBotMove: ', winningBotMove)

        const winningHumanMove = winningMove(movesByPlayer(human), movesByPlayer(bot))
        console.log('winningBotMove: ', winningBotMove)

        if(winningBotMove.length > 0) {
          playerMove(bot, winningBotMove[0])
        } else if (winningHumanMove.length > 0) {
          playerMove(bot, winningHumanMove[0])
        } else {
          const botMoveCandidates = moveCandidates(movesByPlayer(bot), movesByPlayer(human))
          // console.log('botMoveCandidates: ', botMoveCandidates)
          const humanMoveCandidates = moveCandidates(movesByPlayer(human), movesByPlayer(bot))
          // console.log('humanMoveCandidates: ', humanMoveCandidates)
          const blockingMoves = _.intersection(botMoveCandidates, humanMoveCandidates)

          if(blockingMoves.length > 0) {
            playerMove(bot, randomSelection(blockingMoves))
          } else if (botMoveCandidates.length > 0) {
              playerMove(bot, randomSelection(botMoveCandidates))
          } else {
              playerMove(bot, randomSelection(availableMoves()))
          }
        }
      // }
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

    // call check for win or tie, then if none, call playerMove()
    //function checkForWinOrTie (nextMove) {
      // const winner = checkForWinner()
      // const tie = checkForTie()
      //
      // if (tie) {
      //   console.log('game is a tie')
      // } else if (winner) {
      //   console.log('the winner is...')
      // }
      //nextMove(player, selectedSquare)
    //}

    function playerMove (player, selectedSquare) {
      const $square = $(`div[data-square-id=${selectedSquare}]`)
      const $button = $square.children('.empty-square')
      const $playedSquare = $(document.createElement('div')).addClass('played-square')
      $button.replaceWith($playedSquare.append(player.mark))
      const square = _.find(tttMoves, move => move.id === selectedSquare)
      square.state = player.mark

      if (movesByPlayer(player).length > 2) {
        if(!!isWinner(player)){
          console.log('isWinner(player): ', isWinner(player))
          return
        }
      }


     if (qtyMovesRemaining() > 0) {
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
      if(human.mark === 'x') {
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
