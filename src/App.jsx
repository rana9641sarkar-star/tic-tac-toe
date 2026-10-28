import { useEffect, useMemo, useState } from 'react'
import './App.css'

const WINNING_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
const emptyBoard = () => Array(9).fill(null)

function getGameResult(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null
}

function getComputerMove(board, computerMark, humanMark) {
  const open = board.map((square, index) => (square === null ? index : null)).filter((index) => index !== null)
  const tacticalMove = (mark) => open.find((index) => {
    const next = [...board]
    next[index] = mark
    return getGameResult(next)?.winner === mark
  })
  const win = tacticalMove(computerMark)
  if (win !== undefined) return win
  const block = tacticalMove(humanMark)
  if (block !== undefined) return block
  return [4, 0, 2, 6, 8, 1, 3, 5, 7].find((index) => board[index] === null)
}

function App() {
  const [mode, setMode] = useState('computer')
  const [humanMark, setHumanMark] = useState('X')
  const [board, setBoard] = useState(emptyBoard)
  const [turn, setTurn] = useState('X')
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })

  const result = useMemo(() => getGameResult(board), [board])
  const computerMark = humanMark === 'X' ? 'O' : 'X'
  const gameOver = Boolean(result)
  const isComputerTurn = mode === 'computer' && turn === computerMark && !gameOver
  const newGame = () => { setBoard(emptyBoard()); setTurn('X') }
  const changeMode = (nextMode) => { setMode(nextMode); newGame() }
  const changeMark = (mark) => { setHumanMark(mark); newGame() }

  const finishMove = (nextBoard, playedMark) => {
    const nextResult = getGameResult(nextBoard)
    setBoard(nextBoard)
    if (nextResult) {
      setScores((current) => nextResult.winner === 'draw'
        ? { ...current, draws: current.draws + 1 }
        : { ...current, [nextResult.winner]: current[nextResult.winner] + 1 })
    } else setTurn(playedMark === 'X' ? 'O' : 'X')
  }

  const playSquare = (index) => {
    if (board[index] || gameOver || isComputerTurn) return
    const nextBoard = [...board]
    nextBoard[index] = turn
    finishMove(nextBoard, turn)
  }

  useEffect(() => {
    if (!isComputerTurn) return undefined
    const timer = window.setTimeout(() => {
      const move = getComputerMove(board, computerMark, humanMark)
      if (move === undefined) return
      const nextBoard = [...board]
      nextBoard[move] = computerMark
      finishMove(nextBoard, computerMark)
    }, 480)
    return () => window.clearTimeout(timer)
  }, [board, computerMark, humanMark, isComputerTurn])

  let status = `${turn}'s turn`
  if (result?.winner === 'draw') status = "It's a draw!"
  else if (result?.winner) status = `${result.winner} wins the game!`
  else if (isComputerTurn) status = 'Computer is thinking…'
  else if (mode === 'computer') status = `${humanMark === turn ? 'Your' : "Computer's"} turn (${turn})`

  return (
    <main className="game-shell">
      <section className="game-card" aria-labelledby="game-title">
        <div className="game-heading"><p className="eyebrow">Classic tabletop game</p><h1 id="game-title">Tic-Tac-Toe</h1><p className="subtitle">A little friendly competition, carved in wood.</p></div>
        <div className="mode-switch" aria-label="Choose game mode">
          <button className={mode === 'computer' ? 'active' : ''} type="button" onClick={() => changeMode('computer')} aria-pressed={mode === 'computer'}><span aria-hidden="true">⌘</span> Vs Computer</button>
          <button className={mode === 'local' ? 'active' : ''} type="button" onClick={() => changeMode('local')} aria-pressed={mode === 'local'}><span aria-hidden="true">♟</span> Two Players</button>
        </div>
        {mode === 'computer' && <div className="mark-picker" aria-label="Choose your symbol"><span>Play as</span>{['X', 'O'].map((mark) => <button key={mark} type="button" className={`mark-choice ${mark === humanMark ? 'selected' : ''} ${mark.toLowerCase()}`} onClick={() => changeMark(mark)} aria-pressed={mark === humanMark}>{mark}</button>)}</div>}
        <div className="scoreboard" aria-label="Current session scores"><div className="score score-x"><span>X wins</span><strong>{scores.X}</strong></div><div className="score score-draw"><span>Draws</span><strong>{scores.draws}</strong></div><div className="score score-o"><span>O wins</span><strong>{scores.O}</strong></div></div>
        <p className={`game-status ${gameOver ? 'complete' : ''}`} role="status" aria-live="polite"><span className={`turn-dot ${turn.toLowerCase()}`} aria-hidden="true"></span>{status}</p>
        <div className="board-frame"><div className="game-board" role="grid" aria-label="Tic-Tac-Toe board">{board.map((square, index) => <button key={index} className={`tile ${square ? `symbol-${square.toLowerCase()}` : ''} ${result?.line.includes(index) ? 'winner' : ''}`} type="button" role="gridcell" onClick={() => playSquare(index)} disabled={Boolean(square) || gameOver || isComputerTurn} aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${square ? `: ${square}` : ', empty'}`}><span aria-hidden="true">{square}</span></button>)}</div></div>
        <div className="game-actions"><button className="new-game" type="button" onClick={newGame}>New Game</button><button className="reset-scores" type="button" onClick={() => setScores({ X: 0, O: 0, draws: 0 })}>Reset Scores</button></div>
      </section>
    </main>
  )
}

export default App
