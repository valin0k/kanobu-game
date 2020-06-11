import React, { useState, useMemo } from 'react'
import { observer, useSession, useDoc, useQuery } from 'startupjs'
import { Div, Span, Collapse, Icon } from '@startupjs/ui'
import { Table } from 'components'
import getScores from 'helpers/getScores'
import { faCube, faCut, faScroll } from "@fortawesome/free-solid-svg-icons"
import { CUT, PAPER, STONE } from "model/GameModel"
import './index.styl'

const CollapseHeader = Collapse.Header
const CollapseContent = Collapse.Content

const ACTIONS = {
  paper: faScroll,
  cut: faCut,
  stone: faCube
}

const ICON_SIZE = 25
const ICON_COLOR = '#444'

export default observer(function GameResult ({ gameId }) {
  const [open, setOpen] = useState(false)
  const [userId] = useSession('userId')
  const [game] = useDoc('games', gameId)
  const [players] = useQuery('players', { gameId })

  const userIds = useMemo(() => {
    const ids = players.map(player => player.userId)
    ids.push(userId)
    return ids.filter(Boolean)
  }, [JSON.stringify(game.playerIds)])

  const [users] = useQuery('users', { _id: { $in: userIds } })

  const currentRound = game.currentRound
  const isProfessor = userId === game.profId

  const data = useMemo(() => {
    if(game.playerIds.length < 2) return []

    const firstPlayer = getPlayer(users, game.playerIds[0])
    const secondPlayer = getPlayer(users, game.playerIds[1])
    if(!firstPlayer.answers || !secondPlayer.answers) return []

    const scores = getScores(firstPlayer, secondPlayer)
    return Array(currentRound).fill(1).map((_, i) => {
      return {
        first: firstPlayer.answers[i],
        second: secondPlayer.answers[i],
        score: scores[i]
      }
    })
  }, [currentRound])

  const userIndex = useMemo(() => {
    return game.playerIds.findIndex(id => id === userId)
  }, [])

  function getPlayer(users, playerId) {
    return players.find(p => p.id === playerId)
  }

  function getName(users, playerId) {
    const player = players.find(p => p.id === playerId)
    const user = player && users.find(user => user.id === player.userId)
    return user && user.name
  }


  const firstPlayerName = getName(users, game.playerIds[0]) || '-'
  const secondPlayerName = getName(users, game.playerIds[1]) || '-'

  const columns = [
    {
      title: firstPlayerName,
      key: 'first',
      dataIndex: 'first',
      render: ({ first }) => pug`
        Div.field
          Icon(icon=ACTIONS[first] size=ICON_SIZE color=ICON_COLOR)  
      `
    },
    {
      title: secondPlayerName,
      key: 'second',
      dataIndex: 'second',
      render: ({ second }) => pug`
        Div.field
          Icon(icon=ACTIONS[second] size=ICON_SIZE color=ICON_COLOR)  
      `
    },
    {
      title: 'Score',
      key: 'score',
      dataIndex: 'score',
      render: ({ score }) => {
        return pug`
          Div.field
            if score
              Span #{score[0]} / #{score[1]}
      `
      }
    }
  ]

  return pug`
    Div.root
      Collapse(open=open onChange=() => setOpen(!open))
        CollapseHeader
          if !game.open && game.cause && !isProfessor
            - const lose = game.cause.userId === userId
            Span=lose ? 'You surrendered' : 'Your opponent surrendered'
          else if !game.open && game.cause && isProfessor
            - const isFirstPlayerLose = players[0].id === game.cause.userId
            Span=isFirstPlayerLose ? firstPlayerName + ' surrendered' : secondPlayerName + ' surrendered'
          else if !game.open
            Span Game closed
          else if game.playerIds.length < 2
            Span Waiting for players
          else
            Span Game in progress
        CollapseContent
          Table(columns=columns dataSource=data)
  `
})
