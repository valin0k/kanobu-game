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
  const [players] = useQuery('players', { _id: { $in: game.playerIds } })

  const myPlayer = useMemo(() => {
    return players.find(player => player.userId === userId)
  }, [])

  const isProfessor = userId === game.profId
  const currentRound = game.currentRound

  const selectedAction = useMemo(() => {
    if(!myPlayer) return

    if(myPlayer.answers.length >= game.currentRound) {
      return myPlayer.answers[myPlayer.answers.length - 1]
    }

    return false
  }, [currentRound, myPlayer && myPlayer.answers.length])

  const canStartNextRound = isProfessor
    && players.length === 2
    &&  players.every(player => player.answers.length === currentRound)
  //
  // async function joinGame() {
  //   await $root.scope('games').join({ gameId, userId })
  // }

  async function onActionPress(action) {
    const playerId = myPlayer.id
    await $root.scope('players').addAnswer({ answer: action, playerId })
  }

  async function onSurrender() {
    const playerId = myPlayer.id
    await $root.scope('games').surrender({ gameId, playerId })
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
        if game.playerIds.length < 2
          Span.waitText(size='l') Waiting for #{2 - game.playerIds.length} more player#{!game.playerIds.length && 's'}
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
                  styleName={first: !i, active: selected}
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
          if isProfessor
            Span.surrenderText(size='xxl') Player surrendered
          else
            Span.surrenderText(size='xxl')=game.cause.playerId === myPlayer.id ? 'You lose' : 'Your opponent surrendered'
        
      Div.results
        GameResult(gameId=game.id)
  `
})
