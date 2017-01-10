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
import { Alert, Platform, PushNotificationIOS, NativeModules, NetInfo } from 'react-native'
import { add, addIndex, filter, forEach, head, intersection, keys, map, propEq, reduce } from 'ramda'
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
    dispatch(loadNotificationSettings()).then(() => {
      dispatch(setState('user.isGuestUser', true))
      dispatch(syncUserStore())
    })
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
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
          dispatch(loadNotificationSettings()),
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
        return Promise.all([
          dispatch(loadNotificationSettings())
        ])
      } else {
        return Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
          dispatch(loadNotificationSettings()),
        ])
      }
    }).then(() => {
      dispatch(syncUserStore())
      dispatch(syncInterestSubscriptions())
    }).catch(() => {
      Actions.Onboarding()
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

export function loadUserProjects() {
  return (dispatch) => {
    dispatch(setError(''))
    return new Promise ((resolve, reject) => {
      dispatch(getAuthUser()).then((userResourse) => {
        userResourse.get('project_preferences').then((forCount) => {
          return forCount.length > 0 ? forCount[0]._meta.project_preferences.count : 0
        }).then((preferenceCount) => {
          userResourse.get('project_preferences', {page_size: preferenceCount}).then((projectPreferences) => {
            var promises = []
            forEach((preference) => {
              var promise = preference.get('project').then((project) => {
                dispatch(setState(`user.projects.${project.id}`, {
                    preferenceID: preference.id,
                    name: project.display_name,
                    slug: project.slug,
                    notify: preference.email_communication,
                    activity_count: preference.activity_count
                  }
                ))
              })
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              promises.push(promise)
              },
              projectPreferences
            )

            Promise.all(promises).then(() => {
              console.log('>>>>All promises resolved')
              dispatch(updateTotalClassifications())
              dispatch(fetchProjectsByParms('recent'))
              return resolve()
            })
          })
        })
      }).catch((error) => {
        dispatch(setError(error.message))
        return reject()
      })
    })
  }
}

export function updateTotalClassifications() {
  return (dispatch, getState) => {
    const getCounts = (key) => getState().user.projects[key]['activity_count']
    const totalClassifications = reduce(add, 0, map(getCounts, keys(getState().user.projects)))
    dispatch(setState('user.totalClassifications', totalClassifications))
  }
}

export function register() {
  return (dispatch, getState) => {
    dispatch(setIsFetching(true))
    dispatch(setError(''))
    const values={
      login: getState().registration.login,
      password: getState().registration.password,
      email: getState().registration.email,
      credited_name: getState().registration.credited_name,
      global_email_communication: getState().registration.global_email_communication,
    }
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        auth.register(values)
          .then((user) => {
            user.avatar = {}
            user.isGuestUser = false
            dispatch(setUser(user))
            dispatch(syncUserStore())
            dispatch(setIsFetching(false))
            Actions.ZooniverseApp({type: ActionConst.RESET})
          })
          .catch((error) => {
            dispatch(setError(error.message))
            dispatch(setIsFetching(false))
          })
      } else {
        dispatch(setError('Sorry, but you must be connected to the internet to use Zooniverse'))
        dispatch(setIsFetching(false))
      }
    })
  }
}

export function signOut() {
  return dispatch => {
    store.delete('@zooniverse:user')
    dispatch(setUser({}))
    dispatch(setError(null))
    auth.signOut()
    Actions.SignIn()
  }
}

export function fetchProjects() {
  return dispatch => {
    dispatch(setProjectListFromStore())
    var callFetchProjects = tag => dispatch(fetchProjectsByParms(tag.value))
    forEach(callFetchProjects, filter(propEq('display', true), GLOBALS.DISCIPLINES))
  }
}

export function fetchProjectsByParms(tag) {
  return (dispatch, getState) => {
    let parms = {id: MOBILE_PROJECTS, cards: true, sort: 'display_name'}
    if (tag === 'recent') {
      parms.id = intersection(MOBILE_PROJECTS, keys(getState().user.projects) )
    } else {
      parms.tags = tag
    }

    apiClient.type('projects').get(parms).then((projects) => {
      dispatch(setState(`projectList.${tag}`,projects))
      dispatch(syncProjectStore())
    }).catch((error) => {
      dispatch(displayError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
    })
  }
}

export function fetchProject(projectID) {
  return dispatch => {
    apiClient.type('projects').get({id: projectID})
      .then((projects) => {
        dispatch(setState('notificationProject', head(projects)))
      })
      .catch((error) => {
        dispatch(displayError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
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

export function loadNotificationSettings() {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      if (getState().user.notifications === undefined) {
        dispatch(setState('user.notifications', {}))
      }
      if (getState().user.notifications.general === undefined) {
        dispatch(setState('user.notifications.general', true))
      }

      forEach((projectID) => {
        if (getState().user.notifications[projectID] === undefined) {
          dispatch(setState(`user.notifications.${projectID}`, true))
        }
      })(MOBILE_PROJECTS)

      return resolve()
    })
  }
}

export function syncInterestSubscriptions() {
  return (dispatch, getState) => {
    dispatch(checkPushPermissions())
    MOBILE_PROJECTS.reduce(function(promise, projectID) {
      return promise.then(function() {
        var subscribed = getState().user.notifications[projectID]
        if (getState().pushEnabled){
          return dispatch(updateInterestSubscription(projectID, subscribed))
        } else {
          return
        }

      })
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
        }, 500)
      })

    })
  }
}

export function checkPushPermissions() {
  return (dispatch) => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.checkPermissions((permissions) => {
        dispatch(setState('pushEnabled', (permissions.alert === 0) ? false : true))
      })
    } else {
      dispatch(setState('pushEnabled', true))
    }
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
