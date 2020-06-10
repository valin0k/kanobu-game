import React, { useState, useMemo } from 'react'
import { observer, useSession, useDoc, useQuery } from 'startupjs'
import { Div, Span, Collapse, Icon } from '@startupjs/ui'
import { Table } from 'components'
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

  const userIds = useMemo(() => {
    const ids = [...game.userIds]
    ids.push(userId)
    return ids.filter(Boolean)
  }, [JSON.stringify(game.userIds)])

  const [users] = useQuery('users', { _id: { $in: userIds } })
  const isProfessor = userId === game.professor

  const players = users.filter(user => (game.userIds || []).includes(user.id))

  const userIndex = useMemo(() => {
    return game.userIds.findIndex(id => id === userId)
  }, [])

  const firstPlayerName = players[0] && players[0].name || '-'
  const secondPlayerName = (players[1] && players[1].name) || '-'

  const stringifyRounds = JSON.stringify(game.rounds)

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
        const yourScore = isProfessor ? score[0] : score[1]
        const opponentScore = isProfessor ? score[1] : score[0]
        return pug`
          Div.field
            Span #{score[0]} / #{score[1]}
      `
      }
    }
  ]

  const data = useMemo(() => {
    return game.rounds.slice(0, -1).map((round, i) => {
      return {
        first: round[0],
        second: round[1],
        score: game.scores[i]
      }
    })
  }, [stringifyRounds])

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
            - const lastRound = game.scores[game.scores.length - 1]
            - const draw = game.scores[lastRound[0]] === game.scores[lastRound[1]]
            - const isFirstPlayerWin = game.scores[lastRound[0]] > game.scores[lastRound[1]]
            if draw
              Span Draw
            else if isProfessor
              Span=isFirstPlayerWin ? firstPlayerName + ' win ' + secondPlayerName : secondPlayerName +  ' win ' + firstPlayerName
            else if (userIndex === 0 && isFirstPlayerWin) || (userIndex === 1 && !isFirstPlayerWin)
              Span You won
            else
              Span You lost
          else if game.userIds.length < 2
            Span Waiting for players
          else
            Span Game in progress
        CollapseContent
          Table(columns=columns dataSource=data)
  `
})
