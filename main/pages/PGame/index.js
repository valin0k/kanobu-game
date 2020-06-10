import React, { useEffect, useMemo } from 'react'
import {$root, observer, useDoc, useSession, emit, useQuery} from 'startupjs'
import { Text, ScrollView } from 'react-native'
import { Content, Div, H3, Icon, Button, Span } from '@startupjs/ui'
import { faScroll, faCut, faCube } from '@fortawesome/free-solid-svg-icons'
import { SURRENDER, PAPER, CUT, STONE } from 'model/GameModel'
import { GameResult } from 'components'
import './index.styl'

const ACTIONS = [
  {icon: faScroll, type: PAPER},
  {icon: faCut, type: CUT},
  {icon: faCube, type: STONE},
]

export default observer(function PGame ({match: {params: {gameId}}}) {
  const [userId] = useSession('userId')
  const [game, $game] = useDoc('games', gameId)
  const [users] = useQuery('users', { _id: { $in: game.userIds } })
  const userIndex = useMemo(() => {
    return game.userIds.findIndex(id => id === userId)
  }, [])

  const isProfessor = userId === game.professor
  const gameRounds = game.rounds
  const stringifyRounds = JSON.stringify(gameRounds)

  const selectedAction = useMemo(() => {
    const lastRoundIndex = (gameRounds.length - 1) < 1 ? 0 : gameRounds.length - 1
    const lastRound = gameRounds[lastRoundIndex] || []
    return lastRound[userIndex]
  }, [stringifyRounds])

  const canStartNextRound = useMemo(() => {
    if(!isProfessor) return false

    const lastRoundIndex = (gameRounds.length - 1) < 1 ? 0 : gameRounds.length - 1
    const lastRound = gameRounds[lastRoundIndex] || []
    return lastRound[0] && lastRound[1]
  }, [stringifyRounds])

  useEffect(() => {
    if(!isProfessor) {
      joinGame()
    }
  }, [])

  async function joinGame() {
    await $root.scope('games').join({ gameId, userId })
  }

  async function onActionPress(action) {
    await $root.scope('games').selectAction({gameId, userIndex, action})
  }

  async function onSurrender() {
    await $root.scope('games').surrender({ gameId, userId })
  }

  async function onNextRound() {
    await $root.scope('games').nextRound({ gameId })
  }

  async function onFinishGame() {
    await $root.scope('games').finishGame({ gameId })
  }

  function goBack() {
    emit('url', '/')
  }

  return pug`
    Div.root
      Div.backButton
        Button.goBack(onPress=goBack) Go back
      
      if game.open
        if game.userIds.length < 2
          Span.waitText(size='l') Waiting for players
        else if isProfessor
          Div.profButtons
            Div.buttonWrapper(styleName={first: true})
              Button.button(onPress=onFinishGame) Finish game
            if canStartNextRound
              Div.buttonWrapper
                Button.button(onPress=onNextRound) Next round
        else
          Div.content
            Text.text Select your action
            Div.actions
              each action, i in ACTIONS
                - const selected = selectedAction === action.type
                Div.action(
                  styleName={first: !i}
                  onPress=() => !selectedAction && onActionPress(action.type) 
                  key=action.type 
                  disabled=selectedAction
                )
                  Icon(icon=action.icon size=70 color=selected ? 'tomato' : '#36363c')
          Div.actions
            Div.buttonWrapper(styleName={first: true})
              Button.button(onPress=onSurrender) Surrender
            if canStartNextRound
              Div.buttonWrapper
                Button.button(onPress=onNextRound) Next round
            if isProfessor
              Div.buttonWrapper
                Button.button(onPress=onFinishGame) Finish game

      else
        if game.cause && game.cause.type === SURRENDER
          Span.surrenderText(size='xxl')=game.cause.userId === userId ? 'You lose' : 'Your opponent surrendered'

      Div.results
        GameResult(gameId=game.id)
  `
})
