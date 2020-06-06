import React, { useEffect } from 'react'
import {$root, observer, useDoc, useQueryDoc, useSession} from 'startupjs'
import { Text, ScrollView } from 'react-native'
import qs from 'qs'
import { Content, Div, H3, Icon } from '@startupjs/ui'
import { faScroll, faCut, faCube } from '@fortawesome/free-solid-svg-icons'
import './index.styl'

const ACTIONS = [
  {icon: faScroll, type: 'paper'},
  {icon: faCut, type: 'cut'},
  {icon: faCube, type: 'stone'},
]

export default observer(function PGame ({match: {params: {gameId}}}) {
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [game, $game] = useDoc('games', gameId)
  const isProfessor = user.id === game.professor

  useEffect(() => {
    if(!user || !game) return

    if(!isProfessor) {
      joinGame(game.professor, user.id)
    }
  }, [])

  async function joinGame() {
    await $root.scope('games').join({ gameId, userId })
  }

  async function onActionPress(action) {
    await $root.scope('games').selectAction({gameId, isProfessor, action})
  }

  return pug`
    Div.root
      if !game.opponent
        H3 Waiting for your opponent
      else
        Content
          Text.text Select your action
          Div.actions
            each action in ACTIONS
              Div.action(onPress=() => onActionPress(action.type) key=action.type)
                Icon(icon=action.icon size=70)
  `
})
