import AuthModel from './AuthModel'
import { LIKE, DISLIKE, SUPERLIKE } from './MatchModel'
import moment from 'moment'

export const DEFAULT_DISTANCE = 10
export const MIN_DISTANCE = 5
export const MAX_DISTANCE = 500
export const DEFAULT_AGE_FROM = 18
export const DEFAULT_AGE_TO = 50
export const MAX_AGE_TO = 100
export const DEFAULT_AVATARS_NUMBER = 6
export const DEFAULT_MATCH_LIMIT = 50
export const GENDER_MALE = 'male'
export const GENDER_FEMALE = 'female'
export const GENDER_ANY = 'any'
export const TYPE_SINGLE = 'single'
export const TYPE_FAMILY = 'family'
export const DEFAULT_LIMIT_SUPERLIKE = 1
export const SUBSCRIBE_LIMIT_SUPERLIKE = 5
export const ACCOUNT_EXP_TIME = 1000 * 60 * 60 * 24
export const ACCOUNT_REMINDER_TIME = 1000 * 60 * 60 * 72

const USER_ONLINE_TIME = 600000

export default class UserModel extends AuthModel {
  async like (userId) {
    await this._addMatch(LIKE, userId)
  }

  async dislike (userId) {
    await this._addMatch(DISLIKE, userId)
  }

  async superlike (userId) {
    await this._addMatch(SUPERLIKE, userId)
  }

  async _addMatch (like, userId) {
    const $matches = this.root.at('matches')
    await $matches.addOne(like, userId)

    if (!this.isSubscribed()) {
      await this.incrementAsync('limit', -1)
    }

    if (like === SUPERLIKE) {
      await this.incrementAsync('limitSuperlike', -1)
    }
  }

  restore () {
    this.del('deletedAt')
    this.del('restoreCode')
  }

  softDelete () {
    this.set('deletedAt', Date.now())
  }

  isSingle () {
    return this.get('type') === TYPE_SINGLE
  }

  hasFamily () {
    const familyMembers = this.get('familyUsers')
    return !!(familyMembers && familyMembers.length)
  }

  isFamily () {
    return this.get('type') === TYPE_FAMILY
  }

  isSubscribed () {
    return this.get('subscribeEndAt') > Date.now()
  }

  updateLimits () {
    const moment = require('moment')
    const tsStartNextDay = moment()
      .endOf('day')
      .valueOf()

    this.root.batch(() => {
      this.set('suggetionLimitEndAt', tsStartNextDay)
      this.set('limit', DEFAULT_MATCH_LIMIT)
      if (this.isSubscribed()) {
        this.set('limitSuperlike', SUBSCRIBE_LIMIT_SUPERLIKE)
      } else {
        this.set('limitSuperlike', DEFAULT_LIMIT_SUPERLIKE)
        this.set('isLikeTopUsers', true)
      }
    })
  }

  getOnlineStatus () {
    if (Date.now() <= this.get('lastVisitAt') + USER_ONLINE_TIME) {
      return 'online'
    } else {
      return moment(this.get('lastVisitAt')).fromNow()
    }
  }

  isOnline () {
    return Date.now() <= (this.get('lastVisitAt') + USER_ONLINE_TIME)
  }

  getAge () {
    return moment().diff(moment(this.get('birthday'), 'YYYY-MM-DD'), 'years')
  }

  getFamilyUserIds () {
    return this.get('familyUsers').map(familyUser => familyUser.id)
  }

  getFamilyRoleValue (userId) {
    const myFamilyUserData = this.get('familyUsers').find(item => item.id === userId)
    const familyDataIndex = this.get('familyUsers').indexOf(myFamilyUserData)
    return familyDataIndex >= 0 ? this.get('familyUsers')[familyDataIndex].role : ''
  }

  getFamilyRoleTitle (userId) {
    const role = this.getFamilyRoleValue(userId)
    return role[0].toUpperCase() + role.slice(1)
  }

  isFamilyMember (userId) {
    const myFamilyUserData = this.get('familyUsers').find(item => item.id === userId)
    return myFamilyUserData && myFamilyUserData.id
  }

  async removeFamilyMemberAsync (familyUserId) {
    // getting users
    const myUser = this.get()
    const $familyUser = this.root.at(`users.${familyUserId}`)
    await $familyUser.fetchAsync()
    const familyUser = $familyUser.get()

    // removing both of users from each other families
    this.remove('familyUsers', this.getFamilyUserIds().indexOf(familyUserId))
    const familyUserData = familyUser.familyUsers.find(familyUser => familyUser.id === myUser.id)
    $familyUser.remove(
      'familyUsers',
      familyUser.familyUsers.indexOf(familyUserData)
    )

    // setting current family user
    myUser.familyUsers.length
      ? this.set('currentFamilyUserId', myUser.familyUsers[0].id)
      : this.del('currentFamilyUserId')
    familyUser.familyUsers.length
      ? $familyUser.set('currentFamilyUserId', familyUser.familyUsers[0].id)
      : $familyUser.del('currentFamilyUserId')

    $familyUser.unfetch()
    // removing family user from dialogs
    const $dialogs = this.root.at('dialogs')
    $dialogs.removeFamilyUser(familyUserId)

    const $invites = this.query('invitations', {
      userId: familyUserId,
      targetUserId: myUser.id
    })
    await $invites.fetchAsync()
    const invites = $invites.get()
    invites.map(item => {
      this.root.at(`invitations.${item.id}`).del()
    })
  }

  async assignRole (userId, role) {
    const allFamilyUsers = this.get('familyUsers')
    const myFamilyUserData = allFamilyUsers.find(item => item.id === userId)
    const familyDataIndex = allFamilyUsers.indexOf(myFamilyUserData)

    this.set(`familyUsers.${familyDataIndex}.role`, role)
  }

  async addPushInfo (subscriptionId, state, platform) {
    const userId = this.getId()
    const $pushInfo = await this.scope(`pushs.${subscriptionId}`)
    await $pushInfo.fetchAsync()

    if ($pushInfo.get()) {
      $pushInfo.setDiff('state', state)
    } else {
      this.root.add('pushs', {
        id: subscriptionId,
        userId,
        state,
        platform
      })
    }
  }

  async updateLastVisit () {
    this.set('lastVisitAt', Date.now())
  }

  getAvatar (index = 0, defaultKey) {
    const avatars = this.get('avatars')

    return UserModel._getAvatar(avatars, defaultKey, index)
  }

  getDefaultAvatar (defaultKey) {
    const avatars = this.get('avatars')
    const defaultAvatarIndex = this.get('defaultAvatarIndex')

    return UserModel._getDefaultAvatar(avatars, defaultKey, defaultAvatarIndex)
  }

  static _getAvatar (avatars = [], defaultKey = 'avatar', index = 0) {
    function _getPath (avatar, defaultKey) {
      if (!avatar) return ''
      const avatarsPath = [defaultKey, 'crop', 'full', 'avatar']
      for (const path in avatarsPath) {
        if (avatar[avatarsPath[path]]) {
          return avatar[avatarsPath[path]]
        }
      }
    }

    if (Array.isArray(avatars)) {
      return _getPath(avatars[index], defaultKey)
    }
    return _getPath(avatars, defaultKey)
  }

  static _getDefaultAvatar (avatars = [], defaultKey = 'avatar', defaultAvatarIndex = 0) {
    return UserModel._getAvatar(avatars, defaultKey, defaultAvatarIndex)
  }
}
