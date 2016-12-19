(function ($, _) {
  'use strict'
  // Globals
  let humanPlayer = null
  let tttGame

  // Utils
  const randomSelection = arr => arr[Math.floor(Math.random() * arr.length)]

  const delay = (duration, done) => setTimeout(done, duration)

  // Dom
  $(function () {
    const $messages = $('.messages')
    const $tttBoard = $('.ttt-board')
    const $newGameBtn = $('.new-game-btn')

    // const $modal = $('#modal')
    // const $playerInfo = $('.player-info')

    // const showModal = () => {
    //   $modal.modal('show')
    // }

    const showMessage = msg => {
      $messages.text(msg)
    }

    // Ttt game
    const TicTacToe = {
      settings: {
        rows: 3,
        columns: 3,
        centerSquare: 4,
        cornerSquares: [0, 2, 6, 8],
        winners: [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ]
      },
      messages: {
        welcomeMsg: "Let's Play Tic Tac Toe!",
        newGame: "New Game",
        botWon: "Sorry, you lost :-/ Try again?",
        humanWon: "You won! Play again?",
        tiedGame: "It's a tie :-/ Try again?"
      },
      init: () => {
        if (humanPlayer === null) {
          TicTacToe.newGame(TicTacToe.messages.welcomeMsg)
        } else {
          tttGame = new TicTacToe.Game(humanPlayer)
          // showMessage(TicTacToe.playerInfo())
          TicTacToe.newBoard(TicTacToe.runGame)
        }
      },
      Game: function (humanPlayer) {
        this.humanPlayer = humanPlayer
        this.botPlayer = humanPlayer === 'x' ? 'o' : 'x'
        this.moves = []

        const addEmptySquares = totalSquares => {
          // const squares = []
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
      newGame: (msg = TicTacToe.messages.newGame, allowClose = false) => {
        const $newGame = $('.new-game')
        const $newGameTitle = $('.new-game .modal-title')
        $newGameTitle.text(msg)
        const closeModal = humanPlayer !== null && allowClose ? true : 'static'
        $newGame.modal({show: true, backdrop: closeModal})
        const $selectPlayer = $('.select-player')
        $selectPlayer.on('click', function () {
          humanPlayer = $(this).data('player')
          $selectPlayer.off()
          $newGame.modal('hide')
          $newGame.on('hidden.bs.modal', function () {
            TicTacToe.init()
          })
        })
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
      playerInfo: () => `You: ${tttGame.humanPlayer.toUpperCase()} / Computer: ${tttGame.botPlayer.toUpperCase()}`,
      runGame: () => {
        showMessage(TicTacToe.playerInfo())
        $newGameBtn.show()
        $newGameBtn.on('click', () => {
          TicTacToe.newGame(TicTacToe.messages.newGame, true)
        //  $newGameBtn.show()
        })

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

        const firstBotMove = () => {
          if(_.includes(movesByPlayer(human), TicTacToe.settings.centerSquare)) {
            return randomSelection(TicTacToe.settings.cornerSquares)
          } else {
            return TicTacToe.settings.centerSquare
          }
        }

        const isTie = player => {
          let isTie = false
          const noWinners = !isWinner(bot) && !isWinner(human)
          if (qtyMovesRemaining() === 0){
            isTie = true
          } else if (qtyMovesRemaining() === 1) {
            const simulatedMoves = tttGame.moves
            const lastMove = availableMoves()[0]
            const lastSquare = _.find(simulatedMoves, move => move.id === lastMove)
            lastSquare.state = opponent(player)
            const opponentMoves = movesByPlayer(opponent(player), simulatedMoves)
            if(!isWinner(opponent(player), opponentMoves)){
              isTie = true
            }
          }
          return isTie
        }

        const movesByPlayer = (player, game = tttGame.moves) => {
          const moves = _.filter(game, move => move.state === player)
          return _.map(moves, move => move.id)
        }

        const isWinner = (player, moves = movesByPlayer(player)) => {
          const winningMove = _.filter(TicTacToe.settings.winners, pattern => _.intersection(pattern, moves).length === 3)
          return winningMove.length > 0
        }

        const moveCandidates = (player, isWinner = false) => {
          const playerMoves = movesByPlayer(player)
          const opponentMoves = movesByPlayer(opponent(player))
          const matchesNeeded = isWinner ? 2 : 1
          const matchingPatterns = _.filter(TicTacToe.settings.winners, pattern => _.intersection(pattern, playerMoves).length === matchesNeeded && _.intersection(pattern, opponentMoves).length === 0)
          const moves = _.map(matchingPatterns, pattern => _.filter(pattern, move => _.includes(availableMoves(), move)))
          return _.flatten(moves)
        }

        const botMove = () => {
          if(movesByPlayer(bot).length === 0) {
            playerMove(bot, firstBotMove())
          } else {
            const winningBotMove = moveCandidates(bot, true)
            const winningHumanMove = moveCandidates(human, true)
            if(winningBotMove.length > 0) {
              playerMove(bot, winningBotMove[0])
            } else if (winningHumanMove.length > 0) {
              playerMove(bot, winningHumanMove[0])
            } else {
              const botMoveCandidates = moveCandidates(bot)
              const humanMoveCandidates = moveCandidates(human)
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
            if (player === human) {
              showMessage(TicTacToe.messages.humanWon)
            } else {
              showMessage(TicTacToe.messages.botWon)
            }
            delay(3000, TicTacToe.resetGame)
          } else if(isTie(player)) {
            showMessage(TicTacToe.messages.tiedGame)
            delay(3000, TicTacToe.resetGame)
          } else {
            if(player === human) {
            delay(500, botMove)
            } else {
              humanMove()
            }
          }
        }
        startingMove()
      }
    }
    TicTacToe.init()
  })

}(jQuery, _))
