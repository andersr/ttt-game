(function ($, _) {
  'use strict'
  // Globals
  let humanPlayer = null
  let tttGame

  // Utils
  const randomSelection = arr => arr[Math.floor(Math.random() * arr.length)]
  const qtyMatches = (arr1, arr2) => _.intersection(arr2, arr2).length

  // Dom
  $(function () {
    const $messages = $('.messages')
    const $tttBoard = $('.ttt-board')
    // Ttt game
    const TicTacToe = {
      settings: {
        rows: 3,
        columns: 3,
        centerSquare: 4,
        cornerSquares: [0, 2, 6, 8],
        winners: [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ]
      },
      init: function () {
        if (humanPlayer === null) {
          this.selectPlayerMenu()
        } else {
          tttGame = new TicTacToe.Game(humanPlayer)
          this.newBoard(this.runGame)
        }
      },
      Game: function (humanPlayer) {
        this.humanPlayer = humanPlayer
        this.botPlayer = humanPlayer === 'x' ? 'o' : 'x'
        this.moves = []

        const addEmptySquares = totalSquares => {
          const squares = []
          let squareId = 0

          function GameSquare (id) {
            this.id = id
            this.state = ''
          }

          while(squareId <= totalSquares) {
            const square = new GameSquare(squareId)
            this.moves.push(square)
            squareId++
          }
        }
        addEmptySquares(TicTacToe.settings.rows * TicTacToe.settings.columns)
      },
      selectPlayerMenu: () => {
        const $playerOptions = $('.player-options')
        const $selectPlayer = $('.select-player')

        $selectPlayer.on('click', function () {
          humanPlayer = $(this).data('player')
          $selectPlayer.off()
          $playerOptions.hide()
          $messages.hide()
          TicTacToe.init()
        })

        $messages.append("<p>Which player would you like to be?</p> <p class='secondary-text'>(Ps. 'X' goes first in Tic Tac Toe)</p>")
        $messages.show()
        $playerOptions.show()
      },
      newBoard: done => {

        let squareId = 0
        const $emptySquare = $(document.createElement('button')).addClass('empty-square')
        const $square = $(document.createElement('div')).addClass('ttt-square grid-cell').append($emptySquare)
        const $row = $(document.createElement('div')).addClass('grid-row')

        function addRow () {
          let $boardRow = $row.clone()
          for (let i = 0; i < TicTacToe.settings.columns; i++) {
            $(addSquare()).appendTo($boardRow)
          }
          return $boardRow
        }
        function addSquare () {
          let $boardSquare = $square.clone()
          $boardSquare.attr('data-square-id', squareId)
          squareId++
          return $boardSquare
        }
        for (let i = 0; i < TicTacToe.settings.rows; i++) {
          $(addRow()).appendTo($tttBoard)
        }
        done()
      },
      resetGame: () => {
        humanPlayer = tttGame.humanPlayer
        tttGame = new TicTacToe.Game(humanPlayer)
        TicTacToe.resetBoard(TicTacToe.runGame)
      },
      resetBoard: done => {
        const $tttSquares = $tttBoard.find('.ttt-square')
        $.each($tttSquares, function () {
          const $emptySquare = $(document.createElement('button')).addClass('empty-square')
          $(this).children('.played-square').replaceWith($emptySquare)
        })
        done()
      },
      playerInfo: () => {
        const $playerInfo = $('.player-info')
        $playerInfo.text(`You: ${tttGame.humanPlayer.toUpperCase()} / Computer: ${tttGame.botPlayer.toUpperCase()} `)
        $playerInfo.show()
      },
      runGame: () => {
        const bot = tttGame.botPlayer
        const human = tttGame.humanPlayer
        const opponent = player => player === human ? bot : human
        const startingMove = () => human === 'x' ? humanMove() : botMove()

        const qtyMovesCompleted = () => _.filter(tttGame.moves, move => move.state !== '').length

        const qtyMovesRemaining = () => (TicTacToe.settings.rows * TicTacToe.settings.columns) - qtyMovesCompleted()

        const availableMoves = () => {
          const moves = _.filter(tttGame.moves, move => move.state === '')
          return _.map(moves, move => move.id)
        }

        const movesByPlayer = player => {
          const moves = _.filter(tttGame.moves, move => move.state === player)
          return _.map(moves, move => move.id)
        }

        const firstBotMove = () => {
          if(_.includes(movesByPlayer(human), TicTacToe.settings.centerSquare)) {
            return randomSelection(TicTacToe.settings.cornerSquares)
          } else {
            return TicTacToe.settings.centerSquare
          }
        }

        const isTie = player => {
          // no remaining moves? true
          if (qtyMovesRemaining() === 0){
            return true
          } else if (qtyMovesRemaining() === 1){
            // 1 remaining move?

            // make a copy of current moves
            const simulatedMoves = tttGame.moves

            // get the last remaining move
            const lastMove = availableMoves()[0]
            console.log('lastMove: ', lastMove)

            // simulate next player making last move
            const square = _.find(simulatedMoves, move => move.id === lastMove)
            square.state = opponent(player)

            // get opponents moves

            const movesByPlayer = _.filter(simulatedMoves, move => move.state === player)
            const movedIds = _.map(movesByPlayer, move => move.id)

            const winningMove = _.filter(TicTacToe.settings.winners, pattern => _.intersection(pattern, movedIds).length === 3)
            return winningMove.length === 0
          } else {
            return false
          }
        }

        const moveCandidates = (player, isWinner = false) => {
          const playerMoves = movesByPlayer(player)
          const opponentMoves = movesByPlayer(opponent(player))
          const matchesNeeded = isWinner ? 2 : 1
          const matchingPatterns = _.filter(TicTacToe.settings.winners, pattern => _.intersection(pattern, playerMoves).length === matchesNeeded && _.intersection(pattern, opponentMoves).length === 0)

          // const twoMatches = _.filter(TicTacToe.settings.winners, pattern => qtyMatches(pattern, playerMoves) === 2)

          // console.log('twoMatches: ', twoMatches)

          const moves = _.map(matchingPatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
          return _.flatten(moves)
        }

        const isWinner = player => {
          const winningMove = _.filter(TicTacToe.settings.winners, pattern => _.intersection(pattern, movesByPlayer(player)).length === 3)
          return winningMove.length > 0
        }

        const botMove = () => {
          // console.log('moves by human: ', movesByPlayer(human))
          if(movesByPlayer(bot).length === 0) {
            playerMove(bot, firstBotMove())
          } else {

            const winningBotMove = moveCandidates(bot, true)
            const winningHumanMove = moveCandidates(human, true)
            // console.log('winningHumanMove: ', testWin())

            if(winningBotMove.length > 0) {
              playerMove(bot, winningBotMove[0])
            } else if (winningHumanMove.length > 0) {
              playerMove(bot, winningHumanMove[0])
            } else {
              const botMoveCandidates = moveCandidates(bot)
              // console.log('botMoveCandidates: ', botMoveCandidates)
              const humanMoveCandidates = moveCandidates(human)
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
          }
        }

        const humanMove = () => {
          const $emptySquare = $('.empty-square')
          $emptySquare.on('click', function(){
            const selectedSquare = $(this).parent().data('square-id')
            $emptySquare.off()
            playerMove(human, selectedSquare)
          })
        }

        const playerMove = (player, selectedSquare) => {
          const $square = $(`div[data-square-id=${selectedSquare}]`)
          const $button = $square.children('.empty-square')
          const $playedSquare = $(document.createElement('div')).addClass('played-square')
          $button.replaceWith($playedSquare.append(player))
          const square = _.find(tttGame.moves, move => move.id === selectedSquare)
          square.state = player
          if(isWinner(player)) {
            console.log('Player ', player, ' is the winner!')
            TicTacToe.resetGame()
          } else if(isTie(player)) {
            // no remaining moves? true
            // 1 remaining move? simulate opponent making next move - if no winner, return true
            // else return false
            console.log('the game is a tie')
            TicTacToe.resetGame()
          } else {
            if(player === human) {
              botMove()
            } else {
              humanMove()
            }
          }
        }
        TicTacToe.playerInfo()
        startingMove()
      }
    }
    TicTacToe.init()
  })

}(jQuery, _))


// const testWin = () => {
//   const humanMoves = movesByPlayer(human)
//   const botMoves = movesByPlayer(opponent(human))
//   console.log('moves by bot: ', botMoves)
//   console.log('moves by human: ', humanMoves)
//   const winningPatterns = _.filter(TicTacToe.settings.winners, pattern => {
//     const matches = _.intersection(pattern, humanMoves)
//     // const humanMatches = qtyMatches(pattern, humanMoves)
//     // const botMatches = qtyMatches(pattern, botMoves)
//     console.log('pattern: ', pattern, 'humanMoves: ', humanMoves, ' matches: ', matches)
//     return matches.length === 2
//   })
//
//   return _.flatten(winningPatterns)
//
//   // console.log('winningPatterns: ',)
//   //
//   // const moves = _.map(winningPatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
//   // return _.flatten(moves)
// }
// check for winner for tie, for no remaining moves, else next move
//  else if (isTie()) {
//   // if there is 1 remaining move,
// }

// if (movesByPlayer(player).length > 2) {
//   if(!!isWinner(player)) {
//
//     TicTacToe.resetGame()
//   }
// }

//  if (qtyMovesRemaining() > 0) {
//     if(player === human) {
//       botMove()
//     } else {
//       humanMove()
//     }
//   } else {
//     console.log('no moves remaining - check for tied game or win')
//     TicTacToe.resetGame()
//   }


// const remainingMoves = availableMoves().length
// const noWinner = remainingMoves.length === 0 && !!isWinner(opponent(player)) === false
// if (noWinner) {
//   return true
// } else if (remainingMoves.length > 1) {
//   return false
// }
//  else if (remainingMoves.length <= 1 && ) {
//   const remainingMove = _.intersection()
//
//   // are there any remaining moves?
// } else {
//
// }
