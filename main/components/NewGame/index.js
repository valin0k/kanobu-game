import React from 'react'
import {observer, useSession, $root, emit, useDoc} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, Div } from '@startupjs/ui'
import './index.styl'

export default observer(function NewGame () {
  const [userId] = useSession('userId')
  const [user] = useDoc('users', userId)

  async function createGame() {
    const id = await $root.scope('games').addGame({ professor: user.id })
    emit('url', `/game/${id}`)
  }

  return pug`
    Div.root
      Button(onPress=createGame) Create a new game
  `
})
