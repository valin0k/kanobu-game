import React from 'react'
import { observer, useSession, useQueryDoc } from 'startupjs'
import { ScrollView } from 'react-native'
import { AuthForm, NewGame, GameList, ClosedGameList } from 'main/components'
import './index.styl'
import { Content, H3, Div, Span } from '@startupjs/ui'

export default observer(function PHome () {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })

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
