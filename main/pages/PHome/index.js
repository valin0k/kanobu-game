import React from 'react'
import {observer, useSession} from 'startupjs'
import { ScrollView } from 'react-native'
import { TestComponent } from 'components'
import { AuthForm } from 'main/components'
import './index.styl'
import { Content } from '@startupjs/ui'

export default observer(function PHome () {
  const [userId] = useSession('userId')
  return pug`
    ScrollView.root
      Content
        AuthForm
  `
})
