export default (components = {}) => [
  {
    path: '/',
    exact: true,
    component: components.PHome
  },
  {
    path: '/game/:gameId',
    exact: true,
    component: components.PGame
  }
]
