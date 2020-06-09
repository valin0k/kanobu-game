import React, { useState, useMemo } from 'react'
import {observer, useSession, useQueryDoc, useDoc} from 'startupjs'
import { ScrollView, Text } from 'react-native'
import { Button, Avatar, Div, Span, Collapse } from '@startupjs/ui'
import { Table } from 'components'
import './index.styl'

export default observer(function GameResult ({ gameId }) {
  const [open, setOpen] = useState(false)
  const [userId] = useSession('userId')
  const [user] = useQueryDoc('users', { sessionUserId: userId })
  const [game] = useDoc('games', gameId)
  const [professor] = useQueryDoc('users', {_id: game.professor})
  const isProfessor = professor.id === user.id
  const stringifyRounds = JSON.stringify(game.rounds)

  const columns = [
    {
      title: 'You',
      key: 'you',
      dataIndex: 'you',
      render: ({ you }) => pug`
        Div.field
          Span=you
      `
    },
    {
      title: 'Opponent',
      key: 'opponent',
      dataIndex: 'opponent',
      render: ({ opponent }) => pug`
        Div.field
          Span=opponent
      `
    },
    {
      title: 'Score',
      key: 'score',
      dataIndex: 'score',
      render: ({ score }) => {
        const yourScore = isProfessor ? score[0] : score[1]
        const opponentScore = isProfessor ? score[1] : score[0]
        console.info("__score__", score[0])
        return pug`
          Div.field
            Span #{yourScore} / #{opponentScore}
      `
      }
    }
  ]

  const data = useMemo(() => {
    return game.rounds.map((round, i) => {
      return {
        you: isProfessor ? round[0] : round[1],
        opponent: isProfessor ? round[1] : round[0],
        score: game.scores[i]
      }
    })
  }, [stringifyRounds])

  return pug`
    Div.root
      Collapse(title='game' open=open onChange=() => setOpen(!open))
        Table(columns=columns dataSource=data)
  `
})
