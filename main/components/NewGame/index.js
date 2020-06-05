import React from 'react'
import {observer, useSession, useQueryDoc, $root} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button } from '@startupjs/ui'
import './index.styl'

export default observer(function NewGame () {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })

  async function createGame() {
    await $root.scope('games').add({ professor: user.id })
  }

  return pug`
    Button(onPress=createGame) Create a new game
  `
})
