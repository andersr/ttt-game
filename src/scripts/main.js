'use strict'

// UTILS
const randomSelection = arr => arr[Math.floor(Math.random() * arr.length)]

const TTT = function () {
  this.rows = 3
  this.columns = 3
  this.winners = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ]
  this.moves = [] // { id: 0, state: ''|'x'|'o'}
  this.humanPlayer = null
  this.botPlayer = null
  this.boardCreated = false

  const addGameSquares = totalSquares => {
    function GameSquare (id) {
      this.id = id
      this.state = ''
    }
    let squareId = 0

    while(squareId <= totalSquares) {
      const square = new GameSquare(squareId)
      this.moves.push(square)
      squareId++
    }
  }
  addGameSquares(this.rows * this.columns)

  this.setBotPlayer = humanPlayer => this.botPlayer = humanPlayer === 'x' ? 'o' : 'x'

  this.qtyMovesCompleted = () => _.filter(this.moves, move => move.state !== '').length

  this.qtyMovesRemaining = () => (this.rows * this.columns) - this.qtyMovesCompleted()

  this.availableMoves = () => {
    const moves = _.filter(this.moves, move => move.state === '')
    return _.map(moves, move => move.id)
  }

  this.movesByPlayer = player => {
    const moves = _.filter(this.moves, move => move.state === player)
    return _.map(moves, move => move.id)
  }

  this.firstMove = opponent => {
    const centerSquare = 4
    const cornerSquares = [0, 2, 6, 8]
    if(_.includes(this.movesByPlayer(opponent), centerSquare)) {
      return randomSelection(cornerSquares)
    } else {
      return centerSquare
    }
  }

  this.moveCandidates = (playerMoves, opponentMoves) => {
    // const matchingPlayerMoves = winningMove? 2 : 0
    const winningMovePatterns = _.filter(this.winners, pattern => _.intersection(pattern, playerMoves).length > 0 && _.intersection(pattern, opponentMoves).length === 0)
    const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(this.availableMoves(), move)))
    return _.flatten(moves)
  }

  this.winningMove = (playerMoves, opponentMoves) => {
    const winningMovePatterns = _.filter(this.winners, pattern => _.intersection(pattern, playerMoves).length == 2 && _.intersection(pattern, opponentMoves).length === 0)

    const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(this.availableMoves(), move)))
    return _.flatten(moves)
  }

  this.isWinner = player => {
    const winningMove = _.filter(this.winners, pattern => _.intersection(pattern, this.movesByPlayer(player)).length == 3)
    //console.log('winner: ', winner)
    if (winningMove.length > 0) {
      console.log('winner: ')
      // return { this.winningPattern: _.flatten(winningMove), winningPlayer: player }
    } else {
      return null
    }
  }
}

$(function() {
  const $messages = $('.messages')
  let tttGame
  let selectedPlayer = null
  // let selectPlayer = null

  // when resetting the game after it ends, pass in tttGame.humanPlayer
  function resetGame (selectedPlayer) {
    tttGame = new TTT()
    //console.log('tttGame.moves: ', tttGame.moves)

    if (selectedPlayer === null) {
      selectPlayer(startGame)
    } else {
      startGame(runGame)
    }
  }

  function startGame (cb) {
    // console.log('starting game')
    tttBoard(cb)
  }

  function selectPlayer(done) {
    const $newGame = $('.new-game')
    const $playerOptions = $('.player-options')
    $messages.text('Which player would you like to be?')
    $messages.show()
    $playerOptions.show()
    $('.select-player').on('click', function () {
      tttGame.humanPlayer = $(this).data('player')
      $('.select-player').off()
      $playerOptions.hide()
      $messages.hide()
      $newGame.hide()
      done(runGame)
    })
  }

  function tttBoard (done) {
    if (tttBoard.boardCreated) {
      resetBoard(done)
    } else {
      createBoard(done)
    }
  }

  function createBoard (done) {
    const $board = $('.ttt-board')
    let squareId = 0
    const $emptySquare = $(document.createElement('button')).addClass('empty-square')
    const $square = $(document.createElement('div')).addClass('ttt-square grid-cell').append($emptySquare)
    const $row = $(document.createElement('div')).addClass('grid-row')
    function addRow() {
      let $boardRow = $row.clone()
      for (let i = 0; i < tttGame.columns; i++) {
        $(addSquare()).appendTo($boardRow)
      }
      return $boardRow
    }
    function addSquare() {
      let $boardSquare = $square.clone()
      $boardSquare.attr('data-square-id', squareId)
      squareId++
      return $boardSquare
    }
    for (let i = 0; i < tttGame.rows; i++) {
      $(addRow()).appendTo($board)
    }
    tttBoard.boardCreated = true
    done()
  }

  function resetBoard (done) {
    const $tttBoard = $('.ttt-board')
    const $tttSquares = $tttBoard.find('.ttt-square')
    $.each($tttSquares, function () {
      const $emptySquare = $(document.createElement('button')).addClass('empty-square')
      $(this).children('.played-square').replaceWith($emptySquare)
    })
    done()
  }


  function runGame() {

    function startingPlayer() {
      if(tttGame.humanPlayer === 'x') {
        tttGame.botPlayer = 'o'
        humanMove()
      } else {
        tttGame.botPlayer = 'x'
        botMove()
      }
    }

    function botMove () {
      if(tttGame.movesByPlayer(tttGame.botPlayer).length === 0) {
        playerMove(tttGame.botPlayer, tttGame.firstMove(tttGame.humanPlayer))
      } else {

        const winningBotMove = tttGame.winningMove(tttGame.movesByPlayer(tttGame.botPlayer), tttGame.movesByPlayer(tttGame.humanPlayer))
        // console.log('winningBotMove: ', winningBotMove)

        const winningHumanMove = tttGame.winningMove(tttGame.movesByPlayer(tttGame.humanPlayer), tttGame.movesByPlayer(tttGame.botPlayer))
        // console.log('winningBotMove: ', winningBotMove)

        if(winningBotMove.length > 0) {
          playerMove(tttGame.botPlayer, winningBotMove[0])
        } else if (winningHumanMove.length > 0) {
          playerMove(tttGame.botPlayer, winningHumanMove[0])
        } else {
          const botMoveCandidates = tttGame.moveCandidates(tttGame.movesByPlayer(tttGame.botPlayer), tttGame.movesByPlayer(tttGame.humanPlayer))
          // console.log('botMoveCandidates: ', botMoveCandidates)
          const humanMoveCandidates = tttGame.moveCandidates(tttGame.movesByPlayer(tttGame.humanPlayer), tttGame.movesByPlayer(tttGame.botPlayer))
          // console.log('humanMoveCandidates: ', humanMoveCandidates)
          const blockingMoves = _.intersection(botMoveCandidates, humanMoveCandidates)

          if(blockingMoves.length > 0) {
            playerMove(tttGame.botPlayer, randomSelection(blockingMoves))
          } else if (botMoveCandidates.length > 0) {
              playerMove(tttGame.botPlayer, randomSelection(botMoveCandidates))
          } else {
              playerMove(tttGame.botPlayer, randomSelection(tttGame.availableMoves()))
          }
        }
      }
    }

    function humanMove () {
      const $emptySquare = $('.empty-square')
      $emptySquare.on('click', function(){
        var selectedSquare = $(this).parent().data('square-id')
        $emptySquare.off()
        playerMove(tttGame.humanPlayer, selectedSquare)
      })
    }

    function playerMove (player, selectedSquare) {
      const $square = $(`div[data-square-id=${selectedSquare}]`)
      const $button = $square.children('.empty-square')
      const $playedSquare = $(document.createElement('div')).addClass('played-square')
      $button.replaceWith($playedSquare.append(player))
      const square = _.find(tttGame.moves, move => move.id === selectedSquare)
      //console.log('square: ', square)
      square.state = player

      if (tttGame.movesByPlayer(player).length > 2) {
        if(!!tttGame.isWinner(player)){
          console.log('isWinner(player): ', tttGame.isWinner(player))
          resetGame(tttGame.humanPlayer)
          // return
        }
      }

     if (tttGame.qtyMovesRemaining() > 0) {
        if(player === tttGame.humanPlayer) {
          botMove()
        } else {
          humanMove()
        }
      } else {
        console.log('no moves remaining - check for tied game or win')
        resetGame(tttGame.humanPlayer)
      }
    }
    startingPlayer()
  }

  resetGame(selectedPlayer)
})


// TTT.moves = []
// let squareId = 0
// const $tttBoard = $('.ttt-board')
// const $tttSquares = $tttBoard.find('.ttt-square')
// $.each($tttSquares, function () {
//   const $emptySquare = $(document.createElement('button')).addClass('empty-square')
//   console.log("$(this).children('.played-square'): ",$(this).children('.played-square'))
//   $(this).children('.played-square').replaceWith($emptySquare)
// })
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
// this.firstMove = opponent => {
//   const centerSquare = 4
//   const cornerSquares = [0, 2, 6, 8]
//   if(_.includes(movesByPlayer(opponent), centerSquare)) {
//     return randomSelection(cornerSquares)
//   } else {
//     return centerSquare
//   }
// }
// this.moveCandidates = (playerMoves, opponentMoves) => {
//   // const matchingPlayerMoves = winningMove? 2 : 0
//   const winningMovePatterns = _.filter(this.winners, pattern => _.intersection(pattern, playerMoves).length > 0 && _.intersection(pattern, opponentMoves).length === 0)
//   const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
//   return _.flatten(moves)
// }
// this.winningMove = (playerMoves, opponentMoves) => {
//   const winningMovePatterns = _.filter(this.winners, pattern => _.intersection(pattern, playerMoves).length == 2 && _.intersection(pattern, opponentMoves).length === 0)
//
//   const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
//   return _.flatten(moves)
// }
// this.isWinner = player => {
//   const winningMove = _.filter(this.winners, pattern => _.intersection(pattern, movesByPlayer(player)).length == 3)
//   //console.log('winner: ', winner)
//   if (winningMove.length > 0) {
//     console.log('winner: ')
//     // return { this.winningPattern: _.flatten(winningMove), winningPlayer: player }
//   } else {
//     return null
//   }
// }
// const qtyMovesCompleted = () => _.filter(TTT.moves, move => move.state !== '').length

// const qtyMovesRemaining = () => (TTT.rows * TTT.columns) - qtyMovesCompleted()

// const availableMoves = () => {
//   const moves = _.filter(TTT.moves, move => move.state === '')
//   return _.map(moves, move => move.id)
// }
//
// const movesByPlayer = player => {
//   const moves =  _.filter(TTT.moves, move => move.state === player)
//   return _.map(moves, move => move.id)
// }
//
// const firstMove = opponent => {
//   const centerSquare = 4
//   const cornerSquares = [0, 2, 6, 8]
//   if(_.includes(movesByPlayer(opponent), centerSquare)) {
//     return randomSelection(cornerSquares)
//   } else {
//     return centerSquare
//   }
// }
//
// const moveCandidates = (playerMoves, opponentMoves) => {
//   // const matchingPlayerMoves = winningMove? 2 : 0
//   const winningMovePatterns = _.filter(TTT.winners, pattern => _.intersection(pattern, playerMoves).length > 0 && _.intersection(pattern, opponentMoves).length === 0)
//   const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
//   return _.flatten(moves)
// }
//
// const winningMove = (playerMoves, opponentMoves) => {
//   const winningMovePatterns = _.filter(TTT.winners, pattern => _.intersection(pattern, playerMoves).length == 2 && _.intersection(pattern, opponentMoves).length === 0)
//
//   const moves = _.map(winningMovePatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
//   return _.flatten(moves)
// }
//
// const isWinner = player => {
//   const winningMove = _.filter(TTT.winners, pattern => _.intersection(pattern, movesByPlayer(player)).length == 3)
//   //console.log('winner: ', winner)
//   if (winningMove.length > 0) {
//     return { winningPattern: _.flatten(winningMove), winningPlayer: player }
//   } else {
//     return null
//   }
//   // return { winningPattern: winner, winningPlayer: player }
//   //return _.flatten(moves)
// }
