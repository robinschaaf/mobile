import { merge, lensPath, set } from 'ramda'

export const InitialState = {
  user: {},
  isFetching: false,
  errorMessage: null,
  isConnected: null,
  userPreferences: {},
  pushEnabled: false
}

export default function(state=InitialState, action) {

  switch (action.type) {
    case 'SET_STATE':
      return set(lensPath(action.stateKey.split('.')), action.value, state)
    case 'SET_USER':
      return merge(state, {
        user: action.user
      })
    case 'SET_IS_FETCHING':
      return merge(state, {
        isFetching: action.isFetching
      })
    case 'SET_ERROR':
      return merge(state, {
        errorMessage: action.errorMessage
      })
    case 'SET_IS_CONNECTED':
      return merge(state, {
        isConnected: action.isConnected
      })
    default:
      return InitialState;
  }
}
