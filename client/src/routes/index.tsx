import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { BeaconLogo } from '../components/BeaconLogo'
import { GameLobby } from '../components/GameLobby'
import { WaitingRoom } from '../components/WaitingRoom'
import { GameBoard } from '../components/GameBoard'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { socket } = useSocket()
  const [nickname, setNickname] = useState<string | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'playing'>('lobby')
  const [player1Name, setPlayer1Name] = useState<string>('')
  const [player2Name, setPlayer2Name] = useState<string>('')

  const handleNicknameSubmit = (name: string) => {
    setNickname(name)
    socket.emit('register_user', { playerName: name })
  }

  const handleGameCreated = (id: string) => {
    setGameId(id)
    setGameState('waiting')
  }

  const handleGameJoined = (id: string) => {
    setGameId(id)
    setGameState('playing')
  }

  const handleGameEnd = () => {
    setGameState('lobby')
    setGameId(null)
  }

  // Listen for game_started at the parent level
  useEffect(() => {
    function handleGameStartedEvent(data: { player1: string; player2: string }) {
      console.log('Parent component received game_started:', data)
      setPlayer1Name(data.player1)
      setPlayer2Name(data.player2)
      
      // Only transition to playing when both players are ready
      if (data.player2 && data.player2 !== 'Waiting...') {
        console.log('Both players ready, transitioning to playing')
        setGameState('playing')
      }
    }

    socket.on('game_started', handleGameStartedEvent)

    return () => {
      socket.off('game_started', handleGameStartedEvent)
    }
  }, [socket])

  if (!nickname) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <BeaconLogo />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2 text-center">Tic-Tac-Toe</h1>
            <p className="text-gray-600 mb-6 text-center">Enter your nickname to start</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const name = formData.get('nickname') as string
                if (name.trim()) {
                  handleNicknameSubmit(name.trim())
                }
              }}
            >
              <input
                type="text"
                name="nickname"
                placeholder="Your nickname"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5622] focus:border-transparent text-gray-800 mb-4"
              />
              <button
                type="submit"
                className="w-full bg-[#ff5622] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'waiting' && gameId) {
    return <WaitingRoom gameId={gameId} playerName={nickname} />
  }

  if (gameState === 'playing' && gameId) {
    return <GameBoard gameId={gameId} playerName={nickname} player1Name={player1Name} player2Name={player2Name} onGameEnd={handleGameEnd} />
  }

  return (
    <GameLobby
      playerName={nickname}
      onGameCreated={handleGameCreated}
      onGameJoined={handleGameJoined}
    />
  )
}
