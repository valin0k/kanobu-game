import React from 'react'
import {observer, useSession, useQueryDoc, $root, useDoc, emit} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, Avatar, Div, Span } from '@startupjs/ui'
import './index.styl'

export default observer(function GameListItem ({ gameId }) {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [game] = useDoc('games', gameId)
  const [professor] = useQueryDoc('users', {_id: game.professor})


  async function joinGame() {
    await $root.scope('games').join({ gameId, userId })
    emit('url', `/game/${gameId}`)
  }

  return pug`
    Div.root
      Div.left
        Avatar(size='s')=professor.name
        Span.name(size='l') Professor: #{professor.name}
      Div.right
        Button(onPress=joinGame) Join
  `
})
