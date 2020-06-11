import React, { useMemo } from 'react'
import { observer, useSession, $root, useDoc, useQueryDoc, emit } from 'startupjs'
import { Button, Avatar, Div, Span } from '@startupjs/ui'
import './index.styl'

export default observer(function GameListItem ({ gameId }) {
  const [userId] = useSession('userId')
  const [game] = useDoc('games', gameId)
  const [isPlayer] = useQueryDoc('players', { gameId, userId })
  const [professor] = useDoc('users', game.profId)

  const inGame = useMemo(() => {
    const playerIds = game.playerIds || []
    return isPlayer || game.profId === userId
  }, [JSON.stringify(game.playerIds)])

  async function joinGame() {
    if(!inGame) {
      const playerId = await $root.scope('players').addPlayer({ gameId, userId })
      await $root.scope('games').join({ gameId, playerId })
    }

    emit('url', `/game/${gameId}`)
  }

  const professorName = professor && professor.name
  return pug`
    Div.root
      Div.left
        Avatar(size='s')=professorName
        Span.name(size='l') Professor: #{professorName}
      Div.right
        Button(onPress=joinGame)=inGame ? 'Open' : 'Join'
  `
})
