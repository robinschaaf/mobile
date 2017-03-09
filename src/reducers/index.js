import { append, merge, lensPath, set, view } from 'ramda'

export const InitialState = {
  user: {},
  registration: { global_email_communication: true },
  isFetching: false,
  errorMessage: null,
  isConnected: null,
  selectedDiscipline: null,
  projectList: [],
  projectWorkflows: {},
  webViewNavCounter: 0,
  notificationProject: {},
  notificationPayload: {},
  notifications: { general: true },
  settings: { promptForWorkflow: false },
  pushEnabled: false,
  pushPrompted: false,
  classifier: {
    currentWorkflowID: 0,
    currentProjectID: 0,
    tutorial: {},
    guide: {},
    classification: {},
    subject: {},
    workflow: {},
    annotations: [],
    upcomingSubjects: {},
    seenThisSession: {},
    needsTutorial: {},
  },
  device: {width: 0, height: 0}
}

export default function(state=InitialState, action) {
  switch (action.type) {
    case 'SET_STATE':
      return set(lensPath(action.stateKey.split('.')), action.value, state)
    case 'ADD_STATE':
      return set(lensPath(action.stateKey.split('.')),
        append(
          action.value,
          view(lensPath(action.stateKey.split('.')),
          state)
        ),state)
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
    case 'SET_PROJECT_LIST':
      return merge(state, {
        projectList: action.projectList
      })
    default:
      return InitialState;
  }
}
