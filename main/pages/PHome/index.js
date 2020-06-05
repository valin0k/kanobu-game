import React from 'react'
import { observer, useSession, useQueryDoc } from 'startupjs'
import { ScrollView } from 'react-native'
import { TestComponent } from 'components'
import { AuthForm, NewGame, GameList } from 'main/components'
import './index.styl'
import { Content, H3 } from '@startupjs/ui'

export default observer(function PHome () {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })

  return pug`
    ScrollView.root
      Content
        if user
          H3 Hi, #{user.name}
          NewGame
          GameList
        else
          AuthForm
  `
})
