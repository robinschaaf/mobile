export const SET_STATE = 'SET_STATE'
export const SET_USER = 'SET_USER'
export const SET_ERROR = 'SET_ERROR'
export const SET_IS_FETCHING = 'SET_IS_FETCHING'
export const SET_IS_CONNECTED = 'SET_IS_CONNECTED'
export const SET_PROJECT_LIST = 'SET_PROJECT_LIST'

export const STORE_USER = 'STORE_USER'
export const GET_USER_STORE = 'GET_USER_STORE'
export const SIGN_IN = 'SIGN_IN'

import auth from 'panoptes-client/lib/auth'
import apiClient from 'panoptes-client/lib/api-client'
import store from 'react-native-simple-store'
import { PUBLICATIONS } from '../constants/publications'
import { MOBILE_PROJECTS } from '../constants/mobile_projects'
import { GLOBALS } from '../constants/globals'
import { Alert, NetInfo } from 'react-native'
import { addIndex, filter, forEach, head, keys, map, propEq } from 'ramda'
import { Actions, ActionConst } from 'react-native-router-flux'

export function setState(stateKey, value) {
  return { type: SET_STATE, stateKey, value }
}

export function setUser(user) {
  return { type: SET_USER, user }
}

export function setIsFetching(isFetching) {
  return { type: SET_IS_FETCHING, isFetching }
}

export function setError(errorMessage) {
  return { type: SET_ERROR, errorMessage }
}

export function setProjectList(projectList) {
  return { type: SET_PROJECT_LIST, projectList }
}

export function syncUserStore() {
  return (dispatch, getState) => {
    const user = getState().user
    return store.save('@zooniverse:user', {
      user
    })
  }
}

export function setUserFromStore() {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      store.get('@zooniverse:user').then(json => {
        dispatch(setUser(json.user))
        return resolve()
      }).catch(() => {
        return reject()
      })
    })
  }
}

export function syncProjectStore() {
  return (dispatch, getState) => {
    const projectList = getState().projectList
    return store.save('@zooniverse:projects', {
      projectList
    })
  }
}

export function setProjectListFromStore() {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      store.get('@zooniverse:projects').then(json => {
        dispatch(setProjectList(json.projects))
        return resolve()
      }).catch(() => {
        return reject()
      })
    })
  }
}

export function continueAsGuest() {
  return dispatch => {
    dispatch(setState('user.isGuestUser', true))
    dispatch(syncUserStore())
    Actions.ZooniverseApp({type: ActionConst.RESET})
  }
}

export function checkIsConnected() {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      if (getState().isConnected) {
        return resolve()
      } else {
        return reject('Sorry, but you must be connected to the internet to use Zooniverse')
      }

    })
  }
}

export function signIn(login, password) {
  return dispatch => {
    dispatch(setError(''))
    dispatch(checkIsConnected()).then(() => {
      dispatch(setIsFetching(true))
      auth.signIn({login: login, password: password}).then((user) => {
        user.isGuestUser = false
        dispatch(setUser(user))

        return Promise.all([
          dispatch(loadUserAvatar()) //will have more added
        ])
      }).then(() => {
        dispatch(syncUserStore())
        dispatch(setIsFetching(false))
        Actions.ZooniverseApp({type: ActionConst.RESET})  // Go to home screen
      }).catch((error) => {
        dispatch(setError(error.message))
        dispatch(setIsFetching(false))
      })
    }).catch((error) => {
      dispatch(displayError(error))
    })
  }
}

export function getAuthUser() {
  return () => {
    return new Promise ((resolve, reject) => {
      auth.checkCurrent().then ((user) => {
        return resolve(user)
      }).catch(() => {
        return reject('User auth token not found.  Please log in again.')
      })
    })
  }
}

export function loadUserData() {
  return (dispatch, getState) => {
    dispatch(setUserFromStore()).then(() => {
      if (getState().user.isGuestUser) {
        return
      } else {
        return Promise.all([
          dispatch(loadUserAvatar()), //will have more added
        ])
      }
    }).then(() => {
      dispatch(syncUserStore())
    }).catch(() => {
      Actions.SignIn()
    })
  }
}

export function loadUserAvatar() {
  return (dispatch) => {
    return new Promise ((resolve) => {
      dispatch(getAuthUser()).then((userResource) => {
        userResource.get('avatar').then((avatar) => {
          dispatch(setState('user.avatar', head(avatar)))
        }).catch(() => {
          dispatch(setState('user.avatar', {}))
        }).then(() => {
          return resolve()
        })
      })
    })
  }
}

export function signOut() {
  return dispatch => {
    store.delete('@zooniverse:user')
    dispatch(setUser({}))
    Actions.SignIn()
  }
}

export function fetchProjects() {
  return dispatch => {
    dispatch(setProjectListFromStore())
    var callFetchProjects = tag => dispatch(fetchProjectsByTag(tag.value))
    forEach(callFetchProjects, filter(propEq('display', true), GLOBALS.DISCIPLINES))
  }
}


export function fetchProjectsByTag(tag) {
  const parms = {id: MOBILE_PROJECTS, cards: true, tags: tag, sort: 'display_name'}
  return dispatch => {
    apiClient.type('projects').get(parms).then((projects) => {
      dispatch(setState(`projectList.${tag}`,projects))
      dispatch(syncProjectStore())
      dispatch(setIsFetching(false))
    }).catch((error) => {
      dispatch(displayError('error from here' + error))
    })
  }
}

export function fetchPublications() {
  return dispatch => {
    map((key) => {
      addIndex(forEach)(
        (project, idx) => {
          dispatch(setState(`publications.${key}.projects.${idx}.publications`, project.publications))
          dispatch(setState(`publications.${key}.projects.${idx}.slug`, project.slug))

          if (project.slug) {
            apiClient.type('projects').get({ slug: project.slug, cards: true }).then((project) => {
              dispatch(setState(`publications.${key}.projects.${idx}.display_name`, head(project).display_name))
              dispatch(setState(`publications.${key}.projects.${idx}.avatar_src`, head(project).avatar_src))
            })
          } else {
            dispatch(setState(`publications.${key}.projects.${idx}.display_name`, 'Meta Studies'))
            dispatch(setState(`publications.${key}.projects.${idx}.avatar_src`, ''))
          }

        },
        PUBLICATIONS[key]
      )
    }, keys(PUBLICATIONS))
  }
}

export function setIsConnected(isConnected) {
  return (dispatch) => {
    dispatch(setState('isConnected', isConnected))
    if (isConnected === false) {
      dispatch(displayError('Oh no!  It appears you\'ve gone offline.  Please reconnect to use Zooniverse.'))
    }
  }
}

export function displayError(errorMessage) {
  return () => {
    Alert.alert( 'Error', errorMessage )
  }
}
