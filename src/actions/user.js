//Use for user-specific data
import apiClient from 'panoptes-client/lib/api-client'
import store from 'react-native-simple-store'
import { Actions } from 'react-native-router-flux'
import { add, addIndex, filter, fromPairs, head, isNil, keys, map, reduce } from 'ramda'

import {
  fetchProjectsByParms,
  loadNotificationSettings,
  loadSettings,
  setState
} from '../actions/index'
import { getAuthUser } from '../actions/auth'
import { setSession } from './session'

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
        dispatch(setState('user', json.user))
        return resolve()
      }).catch(() => {
        return reject()
      })
    })
  }
}

export function loadUserData() {
  return (dispatch, getState) => {
    dispatch(setUserFromStore()).then(() => {
      dispatch(setSession())
      if (getState().user.isGuestUser) {
        return Promise.all([
          dispatch(loadNotificationSettings()),
          dispatch(loadSettings())
        ])
      } else {
        return Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
          dispatch(loadSettings()),
          dispatch(loadNotificationSettings()),
        ])
      }
    }).then(() => {
      dispatch(syncUserStore())
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
    dispatch(setState('loadingText', 'Loading Projects...'))
    return new Promise ((resolve, reject) => {
      dispatch(getAuthUser()).then((userResourse) => {
        userResourse.get('project_preferences').then((forCount) => {
          return forCount.length > 0 ? forCount[0].getMeta().count : 0
        }).then((preferenceCount) => {
          return userResourse.get('project_preferences', {page_size: preferenceCount, sort: '-updated_at'})
        }).then((projectPreferences) => {
          const activePreferences = filterActivePreferences(projectPreferences)
          const projectIDs = map((pref) => { return pref.links.project }, activePreferences)
          const classifications = classificationCounts(activePreferences)
          const sortOrders = orderProjects(activePreferences)
          const completedTutorials = getCompletedTutorials(activePreferences)

          return apiClient.type('projects').get({ id: projectIDs, page_size: activePreferences.length }).catch(() => {
            return null
          }).then((projects) => {
            map((project) => {
              dispatch(setState(`user.projects.${project.id}`, {
                  name: project.display_name,
                  slug: project.slug,
                  activity_count: classifications[project.id],
                  sort_order: sortOrders[project.id],
                  tutorials_completed_at: completedTutorials[project.id]
                }
              ))
            }, projects)
          }).then(() => {
            dispatch(calculateTotalClassifications())
            dispatch(fetchProjectsByParms('recent'))
            dispatch(setState('loadingText', 'Loading...'))
            return resolve()
          })
        })
      }).catch((error) => {
        dispatch(setState('errorMessage', error.message))
        return reject()
      })
    })
  }
}

export function calculateTotalClassifications() {
  return (dispatch, getState) => {
    const getCounts = (key) => getState().user.projects[key]['activity_count']
    const totalClassifications = reduce(add, 0, map(getCounts, keys(getState().user.projects)))
    dispatch(setState('user.totalClassifications', totalClassifications))
  }
}

function filterActivePreferences(projectPreferences){
    const activePreferences = filter((pref) => { return pref.activity_count > 0 }, projectPreferences)
    return addIndex(map)((preference, i) => {
      preference.sort_order = i
      return preference
    }, activePreferences)
}

function getCompletedTutorials(projectPreferences){
  const preferencesWithTutorials = filter((pref) => { return !isNil(pref.preferences.tutorials_completed_at) }, projectPreferences)
  const extractPreference = (pref) => { return [ pref.links.project, pref.preferences.tutorials_completed_at ] }
  return fromPairs(map(extractPreference, preferencesWithTutorials))
}

function classificationCounts(projectPreferences) {
  return reduce((counts, projectPreference) => {
    counts[projectPreference.links.project] = projectPreference.activity_count
    return counts;
  }, {}, projectPreferences)
}

function orderProjects(projectPreferences) {
  return reduce((orders, projectPreference) => {
    orders[projectPreference.links.project] = projectPreference.sort_order
    return orders;
  }, {}, projectPreferences)
}
