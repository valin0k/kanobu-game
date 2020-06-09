import React, { useState, useMemo } from 'react'
import {observer, useSession, useQueryDoc, useDoc} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, Avatar, Div, Span, Collapse, Icon } from '@startupjs/ui'
import { Table } from 'components'
import './index.styl'
import { faCube, faCut, faScroll } from "@fortawesome/free-solid-svg-icons"
import { CUT, PAPER, STONE } from "model/GameModel"

const CollapseHeader = Collapse.Header
const CollapseContent = Collapse.Content

const ACTIONS = {
  paper: faScroll,
  cut: faCut,
  stone: faCube
}

const ICON_SIZE = 25
const ICON_COLOR = '#444'

export default observer(function GameResult ({ gameId, withJoin }) {
  const [open, setOpen] = useState(false)
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [game] = useDoc('games', gameId)
  const [professor] = useQueryDoc('users', {_id: game.professor})
  const isProfessor = professor.id === user.id
  const stringifyRounds = JSON.stringify(game.rounds)
  const opponentId = isProfessor ? professor.id : game.opponent
  const opponent = useQueryDoc('users', {_id: game.opponent})
  const playerName = Array.isArray(opponent) ? opponent[0].name : opponent.name

  const columns = [
    {
      title: 'You',
      key: 'you',
      dataIndex: 'you',
      render: ({ you }) => pug`
        Div.field
          Icon(icon=ACTIONS[you] size=ICON_SIZE color=ICON_COLOR)  
      `
    },
    {
      title: 'Opponent',
      key: 'opponent',
      dataIndex: 'opponent',
      render: ({ opponent }) => pug`
        Div.field
          Icon(icon=ACTIONS[opponent] size=ICON_SIZE color=ICON_COLOR)  
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
            Span #{yourScore} / #{opponentScore}
      `
      }
    }
  ]

  const data = useMemo(() => {
    return game.rounds.slice(0, -1).map((round, i) => {
      return {
        you: isProfessor ? round[0] : round[1],
        opponent: isProfessor ? round[1] : round[0],
        score: game.scores[i]
      }
    })
  }, [stringifyRounds])

  const opponentName = isProfessor ? playerName : professor.name
  return pug`
    Div.root
      Collapse(open=open onChange=() => setOpen(!open))
        CollapseHeader
          if !game.open && game.cause
            - const lose = game.cause.userId === user.id
            Span=lose ? 'You surrendered' : 'Your opponent ' + opponentName +  ' surrendered'
          else if !game.open
            - const lastRound = game.scores[game.scores.length - 1]
            - const isProfWin = game.scores[lastRound[0]] > game.scores[lastRound[1]]
            if (isProfWin && isProfessor) || (!isProfWin && !isProfessor)
              Span You won #{opponentName}
            else
              Span You lost #{opponentName}
          else
            Span You are playing vs #{opponentName}
        CollapseContent
          Table(columns=columns dataSource=data)
  `
})
