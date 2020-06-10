import React, { useMemo } from 'react'
import { observer, useSession, $root, useDoc, emit } from 'startupjs'
import { Button, Avatar, Div, Span } from '@startupjs/ui'
import './index.styl'

export default observer(function GameListItem ({ gameId }) {
  const [userId] = useSession('userId')
  const [game] = useDoc('games', gameId)
  const [professor] = useDoc('users', game.profId)

  const inGame = useMemo(() => {
    const userIds = game.userIds || []
    return userIds.includes(userId) || game.profId === userId
  }, [JSON.stringify(game.userIds)])

  async function joinGame() {
    !inGame && await $root.scope('games').join({ gameId, userId })
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
