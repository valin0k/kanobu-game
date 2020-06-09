import React from 'react'
import {
  observer,
  useDoc,
  useSession,
  useValue,
  $root
} from 'startupjs'
import './index.styl'
import { Div, Button, H3, TextInput, Span } from '@startupjs/ui'

export default observer(function TestComponent ({ style }) {
  const [userName, $userName] = useSession('userName')
  const [userId, $userId] = useSession('userId')
  const [nameValue, $nameValue] = useValue('')

  async function onSubmit() {
    if(!nameValue) return
    await $root.scope('users').add({name: nameValue, sessionUserId: userId })
  }

  function onChangeText(value) {
    $nameValue.set(value)
  }

  return pug`
    Div.root
      Span.title(size='xxl') Please, type your name
      Div.form
        TextInput(placeholder='Type your name...' onChangeText=onChangeText value=nameValue)
        Button(onPress=onSubmit).button Take me in
  `
})
