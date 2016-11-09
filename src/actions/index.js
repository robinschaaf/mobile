export const SET_STATE = 'SET_STATE'
export const SET_USER = 'SET_USER'
export const SET_ERROR = 'SET_ERROR'
export const SET_IS_FETCHING = 'SET_IS_FETCHING'
export const SET_IS_CONNECTED = 'SET_IS_CONNECTED'
export const SET_PROJECT_LIST = 'SET_PROJECT_LIST'

import auth from 'panoptes-client/lib/auth'
import apiClient from 'panoptes-client/lib/api-client'
import store from 'react-native-simple-store'
import { NativeModules, NetInfo } from 'react-native'
import { head, forEach, keys, map } from 'ramda'
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

export function setIsConnected(isConnected) {
  return { type: SET_IS_CONNECTED, isConnected }
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
    dispatch(setIsFetching(true))
    store.get('@zooniverse:user')
      .then(json => {
        dispatch(setUser(json.user))
        dispatch(setIsFetching(false))
      })
      .catch(() => { //nothing here, send user to login screen
        Actions.SignIn()
        dispatch(setIsFetching(false))
      });
  }
}

export function checkIsConnected() {
  return () => {
    return new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (!isConnected) {
          return reject('Sorry, but you must be connected to the internet to use Zooniverse')
        }
        return resolve()
      })
    })
  }
}

export function signIn(login, password) {
  return dispatch => {
    dispatch(setIsFetching(true))
    dispatch(setError(''))
    dispatch(checkIsConnected()).then(() => {
      auth.signIn({login: login, password: password}).then((user) => {
        user.apiClientHeaders = apiClient.headers
        dispatch(setUser(user))
        return Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadNotificationSettings())
        ])
      }).then(() => {
        dispatch(syncUserStore())
        dispatch(setIsFetching(false))
        Actions.ZooniverseApp({type: ActionConst.RESET})  // Go to home screen
      })
      .catch((error) => {
        dispatch(setError(error.message))
        dispatch(setIsFetching(false))
      })
    })
    .catch((error) => {
      dispatch(setError(error))
      dispatch(setIsFetching(false))
    })
  }
}


export function loadUserAvatar() {
  return (dispatch) => {
    return new Promise ((resolve) => {
      dispatch(getUserResource()).then((user) => {
        user.get('avatar').then((avatar) => {
          user.avatar = head(avatar)
        }).catch(() => {
          user.avatar = {}
        }).then(() => {
          dispatch(setUser(user))
          return resolve()
        })
      })
    })
  }
}


export function loadNotificationSettings() {
  return (dispatch) => {
    dispatch(setError(''))
    return new Promise ((resolve, reject) => {
      dispatch(getUserResource()).then((user) => {
        user.get('project_preferences').then((projectPreferences) => {
          var promises = []
          forEach( (preference) => {
            var promise = preference.get('project').then((project) => {
              dispatch(setState(`user.userPreferences.${preference.id}`, {
                  projectID: project.id,
                  name: project.display_name,
                  notify: preference.email_communication
                }
              ))
            })
            promises.push(promise)
          }, projectPreferences )
          Promise.all(promises).then(() => {
            dispatch(syncInterestSubscriptions())
            return resolve()
          })
        })
      })
      .catch((error) => {
        dispatch(setError(error.message))
        return reject()
      })
    })
  }
}

export function getUserResource() {
  return (dispatch, getState) => {
    apiClient.headers = getState().user.apiClientHeaders
    return apiClient.type('users').get(getState().user.id)
  }
}

export function signOut() {
  return dispatch => {
    store.delete('@zooniverse:user')
    dispatch(setUser({}))
    Actions.SignIn()
  }
}

export function fetchProjects(parms) {
  return dispatch => {
    dispatch(setError(''))
    dispatch(setIsFetching(false))
    apiClient.type('projects').get(parms)
      .then((projects) => {
        dispatch(setProjectList(projects))
      })
      .catch((error) => {
        dispatch(setError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
      })
      .then(() => {
        dispatch(setIsFetching(false))
      })
  }
}

export function updateProjectNotification(id, value) {
  return (dispatch, getState) => {
    apiClient.headers = getState().user.apiClientHeaders
    apiClient.type('project_preferences').get(id).then((preference) => {
      preference.update({email_communication: value}).save()
      dispatch(setState(`user.userPreferences.${id}.notify`, value))
      dispatch(updateInterestSubscription(getState().user.userPreferences[id].projectID, value))
      dispatch(syncUserStore())
    })
    .catch((error) => {
      dispatch(setError(error.message))
    })
  }
}

export function updateUser(attr, value) {
  return (dispatch, getState) => {
    apiClient.headers = getState().user.apiClientHeaders

    apiClient.type('users').get(getState().user.id)
      .then((user) => {
        user.update({[attr]: value}).save()
        dispatch(setState(`user.${attr}`, value))
        dispatch(syncUserStore())
      })
      .catch((error) => {
        dispatch(setError(error.message))
      })
  }
}

export function syncInterestSubscriptions() {
  return (dispatch, getState) => {
    var preferences = []

    map((key) => { preferences.push(getState().user.userPreferences[key]) }, keys(getState().user.userPreferences))

    preferences.reduce(function(promise, preference) {
      return promise.then(function() {
        return dispatch(updateInterestSubscription(preference.projectID, preference.notify))
      });
    }, Promise.resolve())
  }
}

export function updateInterestSubscription(interest, subscribed) {
  var NotificationSettings = NativeModules.NotificationSettings

  return () => {
    return new Promise((resolve) => {
      NotificationSettings.setInterestSubscription(interest, subscribed).then((message) => {
        //Timeout needed or crashes ios.  Open issue: https://github.com/pusher/libPusher/issues/230
        setTimeout(()=> {
          return resolve(message)
        }, 100)

      })

    })
  }
}
