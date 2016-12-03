'use strict'

const TTT = {
  rows: 3,
  columns: 3,
  winners: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ],
  humanPlayer: null,
  botPlayer: null,
  gameSquare: function (id) {
    this.id = id
    this.state = ''
  },
  moves: [], // { id: 0, state: ''|'x'|'o'}
}

const randomSelection = arr => arr[Math.floor(Math.random() * arr.length)]

const qtyMovesCompleted = () => _.filter(TTT.moves, move => move.state !== '').length

const qtyMovesRemaining = () => (TTT.rows * TTT.columns) - qtyMovesCompleted()

const availableMoves = () => {
  const moves = _.filter(TTT.moves, move => move.state === '')
  return _.map(moves, move => move.id)
}

const movesByPlayer = player => {
  const moves =  _.filter(TTT.moves, move => move.state === player)
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
  const winningMovePatterns = _.filter(TTT.winners, pattern => _.intersection(pattern, playerMoves).length > 0 && _.intersection(pattern, opponentMoves).length === 0)
  const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
  return _.flatten(moves)
}

const winningMove = (playerMoves, opponentMoves) => {
  const winningMovePatterns = _.filter(TTT.winners, pattern => _.intersection(pattern, playerMoves).length == 2 && _.intersection(pattern, opponentMoves).length === 0)

  const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
  return _.flatten(moves)
}

const isWinner = player => {
  const winningMove = _.filter(TTT.winners, pattern => _.intersection(pattern, movesByPlayer(player)).length == 3)
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
      TTT.humanPlayer = $(this).data('player')
      $('.select-player').off()
      $playerOptions.hide()
      $messages.hide()
      $newGame.hide()
      createBoard(runGame)
    }
  }

  function runGame() {
    function botMove () {
      if(movesByPlayer(TTT.botPlayer).length === 0) {
        playerMove(TTT.botPlayer, firstMove(TTT.humanPlayer))
      } else {

        const winningBotMove = winningMove(movesByPlayer(TTT.botPlayer), movesByPlayer(TTT.humanPlayer))
        // console.log('winningBotMove: ', winningBotMove)

        const winningHumanMove = winningMove(movesByPlayer(TTT.humanPlayer), movesByPlayer(TTT.botPlayer))
        // console.log('winningBotMove: ', winningBotMove)

        if(winningBotMove.length > 0) {
          playerMove(TTT.botPlayer, winningBotMove[0])
        } else if (winningHumanMove.length > 0) {
          playerMove(TTT.botPlayer, winningHumanMove[0])
        } else {
          const botMoveCandidates = moveCandidates(movesByPlayer(TTT.botPlayer), movesByPlayer(TTT.humanPlayer))
          // console.log('botMoveCandidates: ', botMoveCandidates)
          const humanMoveCandidates = moveCandidates(movesByPlayer(TTT.humanPlayer), movesByPlayer(TTT.botPlayer))
          // console.log('humanMoveCandidates: ', humanMoveCandidates)
          const blockingMoves = _.intersection(botMoveCandidates, humanMoveCandidates)

          if(blockingMoves.length > 0) {
            playerMove(TTT.botPlayer, randomSelection(blockingMoves))
          } else if (botMoveCandidates.length > 0) {
              playerMove(TTT.botPlayer, randomSelection(botMoveCandidates))
          } else {
              playerMove(TTT.botPlayer, randomSelection(availableMoves()))
          }
        }
      }
    }

    function humanMove () {
      const $emptySquare = $('.empty-square')
      $emptySquare.on('click', function(){
        var selectedSquare = $(this).parent().data('square-id')
        $emptySquare.off()
        playerMove(TTT.humanPlayer, selectedSquare)
      })
    }

    function playerMove (player, selectedSquare) {
      const $square = $(`div[data-square-id=${selectedSquare}]`)
      const $button = $square.children('.empty-square')
      const $playedSquare = $(document.createElement('div')).addClass('played-square')
      $button.replaceWith($playedSquare.append(player))
      const square = _.find(TTT.moves, move => move.id === selectedSquare)
      square.state = player

      if (movesByPlayer(player).length > 2) {
        if(!!isWinner(player)){
          console.log('isWinner(player): ', isWinner(player))
          resetGame(runGame)
          // return
        }
      }

     if (qtyMovesRemaining() > 0) {
        if(player === TTT.humanPlayer) {
          botMove()
        } else {
          humanMove()
        }
      } else {
        console.log('no moves remaining - check for tied game or win')
        resetGame(runGame)
      }
    }

    function startGame() {
      TTT.botPlayer = TTT.humanPlayer === 'x' ? 'o' : 'x'
      if(TTT.humanPlayer === 'x') {
        humanMove()
      } else {
        botMove()
      }
    }
    startGame()
  }

  function resetGame (done) {
    TTT.moves = []
    // let squareId = 0
    const $tttBoard = $('.ttt-board')
    const $tttSquares = $tttBoard.find('.ttt-square')
    //const $emptySquare = $(document.createElement('button')).addClass('empty-square')
    //console.log('$tttSquares: ', $tttSquares)
    $.each($tttSquares, function () {
      const $emptySquare = $(document.createElement('button')).addClass('empty-square')
      console.log("$(this).children('.played-square'): ",$(this).children('.played-square'))
      $(this).children('.played-square').replaceWith($emptySquare)
    })
    // createBoard (done)
    // const gameSquares = TTT.rows * TTT.columns
    // const $emptySquare = $(document.createElement('button')).addClass('empty-square')
    //
    // for(var i = 0; i < $tttSquares.length; i++) {
    //     console.log('$tttSquares[i]: ', $tttSquares[i])
    //   let $playedSquare = $tttSquares[i].children('.played-square')
    //   console.log('$playedSquare: ', $playedSquare)
    //   $playedSquare.replaceWith($emptySquare)
    // }
    done()
  }

  function createBoard (done) {
    const $board = $('.ttt-board')
    let squareId = 0
    const $emptySquare = $(document.createElement('button')).addClass('empty-square')
    const $square = $(document.createElement('div')).addClass('ttt-square grid-cell').append($emptySquare)
    const $row = $(document.createElement('div')).addClass('grid-row')
    function addRow() {
      var $boardRow = $row.clone()
      for (var i = 0; i < TTT.columns; i++) {
        $(addSquare()).appendTo($boardRow)
      }
      return $boardRow
    }
    function addSquare() {
      var $boardSquare = $square.clone()
      $boardSquare.attr('data-square-id', squareId)
      const square = new TTT.gameSquare(squareId)
      // console.log('new square: ', square)
      TTT.moves.push(square)
      squareId++
      return $boardSquare
    }
    for (var i = 0; i < TTT.rows; i++) {
      $(addRow()).appendTo($board)
    }
    done()
  }
  newGame()
})

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
// ttt.humanPlayer
// ttt.rows / ttt.columns
// ttt.winnners
/// ttt.moves = []
// gameWinner / winningPattern
// gameSquare
// if humanplayer is null, infer first game, and show select player

// const TTT.winners = [
//   [0, 1, 2],
//   [3, 4, 5],
//   [6, 7, 8],
//   [0, 3, 6],
//   [1, 4, 7],
//   [2, 5, 8],
//   [0, 4, 8],
//   [2, 4, 6]
// ]
// const TTT.rows = 3
// const TTT_COLUMNS = 3
// const TTT.gameSquare = function (id) {
//   this.id = id
//   this.state = ''
// }
