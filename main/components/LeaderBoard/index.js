import React, { useMemo } from 'react'
import { observer, useSession, useQuery } from 'startupjs'
import { H4, Div } from '@startupjs/ui'
import { GameListItem } from 'components'
import LeaderBoardTable from './LeaderBoardTable'
import './index.styl'

export default observer(function LeaderBoard () {
  const [userId] = useSession('userId')
  const [games] = useQuery('games', {
    $limit: 50,
    userIds: { $size: 2 }
  })

  const sortedUsers = useMemo(() => {
    const users = {}
    games.forEach(game => {
      const lastIndex = (game.rounds.length - 1) < 1 ? 0 : game.rounds.length - 1
      const beforeLastScores = game.scores[lastIndex - 1]
      if(!beforeLastScores) return

      const firstId = game.userIds[0]
      const secondId = game.userIds[1]

      users[firstId] = users[firstId] ?
        users[firstId] + beforeLastScores[0] :
        beforeLastScores[0]

      users[secondId] = users[secondId] ?
        users[secondId] + beforeLastScores[1] :
        beforeLastScores[1]
    })
    const usersArr = []

    for(let id in users) {
      usersArr.push({id, scores: users[id]})
    }
    return usersArr.sort((a, b) => b.scores - a.scores)
  }, [])

  return pug`
    Div.root
      H4 Leader board
      LeaderBoardTable(userScores=sortedUsers)
          
  `
})
