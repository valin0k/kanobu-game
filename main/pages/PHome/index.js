import React from 'react'
import { observer, useSession, useDoc } from 'startupjs'
import { ScrollView } from 'react-native'
import { AuthForm, NewGame, GameList, ClosedGameList } from 'main/components'
import { Div, Span } from '@startupjs/ui'
import './index.styl'

export default observer(function PHome () {
  const [userId] = useSession('userId')
  const [user] = useDoc('users', userId)

  return pug`
    ScrollView.root
      Div.content
        Div.wrapper
          if user
            Span(size='xxl') Hi, #{user.name}
            NewGame
            GameList
            ClosedGameList
          else
            AuthForm
  `
})
