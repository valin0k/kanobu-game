import React, { useEffect } from 'react'
import {$root, observer, useDoc, useQueryDoc, useSession} from 'startupjs'
import { Text, ScrollView } from 'react-native'
import qs from 'qs'
import { Content, Div, H3 } from '@startupjs/ui'
import './index.styl'

export default observer(function PGame ({match: {params: {gameId}}}) {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [game] = useDoc('games', gameId)

  useEffect(() => {
    if(!user || !game) return

    if(user.id !== game.professor) {
      joinGame(game.professor, user.id)
    }
  }, [])

  async function joinGame() {
    await $root.scope('games').join({ gameId, userId })
  }

  return pug`
    Div.root
      if !game.opponent
        H3 Waiting for your opponent
      else
        Content
          Text.text Lets start
  `
})
