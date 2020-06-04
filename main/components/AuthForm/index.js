// import React, { useState, useEffect } from 'react'
// import {
//   observer,
//   useDoc,
//   useApi,
//   useSession,
//   useValue
// } from 'startupjs'
// import axios from 'axios'
// import './index.styl'
// import { Div, Span, Button, Br, Row, Card, H3, TextInput } from '@startupjs/ui'
// import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
//
// export default observer(function TestComponent ({ style }) {
//   const [userName, $userName] = useSession('userName')
//   const [nameValue, $nameValue] = useValue('')
//
//   function onSubmit() {
//     if(!nameValue) return
//
//       $userName.set(nameValue)
//   }
//
//   function onChangeText(value) {
//     $nameValue.set(value)
//   }
//
//   return pug`
//     H3 Welcome ${userName || ''}
//     Div.form
//       TextInput(placeholder='Type your name...' onChangeText=onChangeText value=nameValue)
//       Button(onPress=onSubmit) Take me in
//   `
// })
//
// async function getApi () {
//   try {
//     let res = await axios.get('/api/test-thing')
//     if (res.status !== 200 || !res.data) {
//       throw new Error('No data. Status: ' + res.status)
//     }
//     return res.data
//   } catch (err) {
//     return err.message
//   }
// }



import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
// import { BASE_URL, GOOGLE_WEB_CLIENT_ID } from 'clientHelpers'
import { RegisterForm } from '@dmapper/auth'
import qs from 'qs'
import { Div, Span, Button, Br, Row, Card, H3, TextInput } from '@startupjs/ui'
import { observer, emit } from 'startupjs'
import './index.styl'

export default observer(function PSignUp () {
  const [success, setSuccess] = useState()

  function onSuccess (redirectUrl) {
    setSuccess(true)
    window.location.href = redirectUrl || '/'
  }
  return pug`
    View.root
      View.header
        Text.title Sign up
      View.content
        View.form
          if success
            Text.success
              | Register successfully.
              | You will receive emails from lingua.dev@gmail.com
              //- | You’ll receive an e-mail shortly with a
              //- | link to confirm your registration.
          else
            RegisterForm(
              testID='PSignUp_RegisterForm'
              baseUrl=BASE_URL
              onSuccess=onSuccess
              query=query
            )
            Br
            Row.row
              View.hr
              Text.text or
              View.hr
            Br

      Row(center)
        Text Already have an account?
        Text= ' '
        TouchableOpacity(testID='PSignUp_SignInBtn' onPress=() => {
          emit('url', '/sign-in')
        })
          Text.button Sign in
  `
})
