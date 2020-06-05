import React from 'react'
import {observer, useSession, useQueryDoc, $root} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, Avatar, Div, Span } from '@startupjs/ui'
import './index.styl'

export default observer(function GameListItem ({ gameId }) {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })

  async function joinGame() {
    await $root.scope('games').join({ gameId, userId })
  }

  return pug`
    Div.root
      Div.left
        Avatar(size='s')=user.name
        Span.name(size='l') Professor: #{user.name}
      Div.right
        Button(onPress=joinGame) Join
  `
})
