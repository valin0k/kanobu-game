import React, { useMemo } from 'react'
import { observer, useSession, useQuery } from 'startupjs'
import { Div, Span } from '@startupjs/ui'
import { Table } from 'components'
import './index.styl'

export default observer(function LeaderBoardTable ({ userScores }) {
  const userIds = userScores.map(user => user.id)
  const [users] = useQuery('users', {
    _id: {$in: userIds}
  })

  const columns = [
    {
      title: 'User name',
      key: 'name',
      dataIndex: 'name',
      render: ({ name }) => pug`
        Div.field
          Span=name
      `
    },
    {
      title: 'Score',
      key: 'score',
      dataIndex: 'score',
      render: ({ scores }) => {
        return pug`
          Div.field
            Span=scores
      `
      }
    }
  ]

  const data = useMemo(() => {
    return userScores.map(userScore => {
      const name = users.find(user => user.id === userScore.id).name
      return {...userScore, name}

    })
  }, [JSON.stringify(userScores)])

  return pug`
    Div.root
      if userScores.length
        Table(columns=columns dataSource=data)
      else
        Span There is no leaders yet
  `
})
