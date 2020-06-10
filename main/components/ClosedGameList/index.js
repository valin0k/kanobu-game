import React from 'react'
import { observer, useSession, $root, useQuery } from 'startupjs'
import { Button, H4, Div, Avatar } from '@startupjs/ui'
import { GameResult } from 'components'
import './index.styl'

export default observer(function ClosedGameList () {
  const [userId] = useSession('userId')
  const [games] = useQuery('games', {
    open: false,
    $or: [
      {
        $nor: [
          { userIds: { $size: 2 } },
        ],
      },
      { profId: userId },
      { userIds: { $in: [userId] } }
    ]
  })

  if(!games.length) return null

  return pug`
    Div.root
      H4 Closed games list
      Div.games
        each game in games
          GameResult(gameId=game.id key=game.id)
  `
})
