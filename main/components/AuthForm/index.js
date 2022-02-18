import React from 'react'
import { observer, useSession, useValue, $root } from 'startupjs'
import { Div, Button, TextInput, Span } from '@startupjs/ui'
import './index.styl'

export default observer(function TestComponent () {
  const [userId, $userId] = useSession('userId')
  const [nameValue, $nameValue] = useValue('')

  async function onSubmit() {
    if(!nameValue) return
    await $root.scope('users').addUser({name: nameValue, id: userId })
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
