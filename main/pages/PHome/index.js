import React from 'react'
import { observer, useSession, useQueryDoc } from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { TestComponent } from 'components'
import { AuthForm } from 'main/components'
import './index.styl'
import { Content } from '@startupjs/ui'

export default observer(function PHome () {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })

  return pug`
    ScrollView.root
      Content
        if user
          Text tada
        else
          AuthForm
  `
})
