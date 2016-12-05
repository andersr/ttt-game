(function ($) {
  'use strict'
  // Globals
  let humanPlayer = null
  let tttGame, tttBoard

  // Utils
  const randomSelection = arr => arr[Math.floor(Math.random() * arr.length)]

  // Dom
  $(function () {
    const $messages = $('.messages')

    // Ttt game
    const TicTacToe = {
      config: {
        rows: 3,
        columns: 3,
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

        const addGameSquares = totalSquares => {
          const squares = []
          let squareId = 0

          function GameSquare (id) {
            this.id = id
            this.state = ''
          }

          while(squareId <= totalSquares) {
            const square = new GameSquare(squareId)
            squares.push(square)
            squareId++
          }
          return squares
        }

        this.squares = addGameSquares(TicTacToe.config.rows * TicTacToe.config.columns)

      },
      Board: function (squares) {
        // create or reset board
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

        $messages.text('Which player would you like to be?')
        $messages.show()
        $playerOptions.show()
      },
      newBoard: done => {
        const $board = $('.ttt-board')
        let squareId = 0
        const $emptySquare = $(document.createElement('button')).addClass('empty-square')
        const $square = $(document.createElement('div')).addClass('ttt-square grid-cell').append($emptySquare)
        const $row = $(document.createElement('div')).addClass('grid-row')

        function addRow () {
          let $boardRow = $row.clone()
          for (let i = 0; i < TicTacToe.config.columns; i++) {
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
        for (let i = 0; i < TicTacToe.config.rows; i++) {
          $(addRow()).appendTo($board)
        }
        // tttBoard.boardCreated = true
        done()
      },
      resetBoard: done => {

      },
      runGame: () => {

      }
    }
    TicTacToe.init()
  })

}(jQuery))
