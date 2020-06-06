import React, { useEffect, useMemo } from 'react'
import {$root, observer, useDoc, useQueryDoc, useSession, emit} from 'startupjs'
import { Text, ScrollView } from 'react-native'
import { Content, Div, H3, Icon, Button } from '@startupjs/ui'
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

  const gameRounds = game.rounds

  const selectedAction = useMemo(() => {
    const lastRoundIndex = (gameRounds.length - 1) < 1 ? 0 : gameRounds.length - 1
    const lastRound = gameRounds[lastRoundIndex]
    return lastRound[isProfessor ? 0 : 1]
  }, [JSON.stringify(gameRounds)])

  useEffect(() => {
    if(!user || !game) return

    if(!isProfessor) {
      joinGame(game.professor, user.id)
    }
  }, [])

  async function joinGame() {
    await $root.scope('games').join({ gameId, userId: user.id })
  }

  async function onActionPress(action) {
    await $root.scope('games').selectAction({gameId, isProfessor, action})
  }

  async function onSurrender() {
    await $root.scope('games').surrender({ gameId, userId: user.id })
  }

  async function onNextRound() {

  }

  function goBack() {
    emit('url', '/')
  }

  return pug`
    Div.root
      Button(onPress=goBack) Go back
      if !game.opponent
        H3 Waiting for your opponent
      else
        Content
          Text.text Select your action
          Div.actions
            each action in ACTIONS
              - const selected = selectedAction === action.type
              Div.action(
                onPress=() => !selectedAction && onActionPress(action.type) 
                key=action.type 
                disabled=selectedAction
              )
                Icon(icon=action.icon size=70 color=selected ? 'tomato' : '#36363c')
      Div.actions
        Button(onPress=onSurrender) Surrender
        if isProfessor
          Button(onPress=onNextRound) Next round
  `
})
