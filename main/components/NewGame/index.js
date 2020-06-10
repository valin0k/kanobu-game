import React from 'react'
import { observer, useSession, $root, emit } from 'startupjs'
import { Button, Div } from '@startupjs/ui'
import './index.styl'

export default observer(function NewGame () {
  const [userId] = useSession('userId')

  async function createGame() {
    const id = await $root.scope('games').addGame({ professor: userId })
    emit('url', `/game/${id}`)
  }

  return pug`
    Div.root
      Button(onPress=createGame) Create a new game
  `
})
