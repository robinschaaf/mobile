import apiClient from 'panoptes-client/lib/api-client'
import { isNil, length, map, prepend, remove, toPairs } from 'ramda'
import { addState, setState } from '../actions/index'
import { Actions } from 'react-native-router-flux'
import { Alert, Image, Platform } from 'react-native'
import getSubjectLocation from '../utils/get-subject-location'

export function startNewClassification(workflowID) {
  return (dispatch, getState) => {
    dispatch(setState('loadingText', 'Loading Workflow...'))
    dispatch(setState('classifier.currentWorkflowID', workflowID))
    dispatch(fetchWorkflow(workflowID)).then(() => {
      dispatch(setState('loadingText', 'Loading Subjects...'))
      return dispatch(loadSubjects())
    }).then(() => {
      return dispatch(getSubjectsForDisplay())
    }).then(() => {
      dispatch(setState('loadingText', 'Creating Classification...'))
      //now we can create the first classification!!
      let subject = getState().classifier.subject[workflowID]
      let workflow = getState().classifier.workflow[workflowID]
      return apiClient.type('classifications').create({
        annotations: [],
        metadata: {
          workflow_version: workflow.version,
          started_at: (new Date).toISOString(),
          user_agent: `${Platform.OS} Mobile App`,
          user_language: 'en', //TODO: Will be fixed subsequent PR
          utc_offset: ((new Date).getTimezoneOffset() * 60).toString(),
          subject_dimensions: []
        },
        links: {
          project: workflow.links.project,
          workflow: workflow.id,
          subjects: [subject.id]
        }
      })
    }).then((classification) => {
      dispatch(setState(`classifier.classification.${workflowID}`, classification))
      dispatch(setState('classifier.isFetching', false))
    }).catch((e) => {
      console.log('Error in catch! ', e)
      Alert.alert('Error', 'Sorry, but there was an error loading this workflow.  Please try again later.',
        [{text: 'Go Back', onPress: () => { Actions.pop()}}]
      )
    })
  }
}

export function fetchWorkflow(workflowID) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      if (!isNil(getState().classifier.workflow[workflowID])) {
        return resolve()
      }

      return apiClient.type('workflows').get({id: workflowID}).then(([workflow]) => {
        dispatch(setState(`classifier.workflow.${workflowID}`, workflow))
        dispatch(setState(`classifier.tasks.${workflowID}`, workflow.tasks))
        return resolve()
      }).catch((e) => {
        return reject(e)
      })
   })
  }
}

export function loadSubjects() {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      const workflowID = getState().classifier.currentWorkflowID
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowID] || []

      let subjectToPrepend = false
      if (length(upcomingSubjects) <= 1) {
        if (length(upcomingSubjects) === 1){
          subjectToPrepend = upcomingSubjects[0]
        }

        dispatch(fetchUpcomingSubjects(workflowID, subjectToPrepend)).then(() => {
          return resolve()
        }, (error) => {
          dispatch(setState('error', error))
          return reject()
        })
      } else {
        return resolve()
      }
    })
  }
}

export function getSubjectsForDisplay() {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().classifier.currentWorkflowID
      const allSubjects = getState().classifier.upcomingSubjects[workflowID]
      let subject = allSubjects[0]
      let nextSubject = allSubjects[1]

      nextSubject.display = getSubjectLocation(nextSubject)
      subject.display = getSubjectLocation(subject)

      let isFirstSubject = isNil(getState().classifier.subjectSizes[workflowID])
      function doDispatch(){
        dispatch(setState(`classifier.nextSubject.${workflowID}`, nextSubject))
      }
      function doPromise(){
        setTimeout(()=> {
          dispatch(setState(`classifier.nextSubject.${workflowID}`, nextSubject))
        }, 300)
        return Promise.resolve()
      }
      function dispatchOrReturn(){
        return isFirstSubject ? doDispatch() : doPromise()
      }

      dispatchOrReturn().then(() => {
        dispatch(setState(`classifier.subject.${workflowID}`, subject))
        return resolve()
      })
    })
  }
}

export function setImageSizes(subject) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().classifier.currentWorkflowID

      Image.getSize(subject.display.src, (width, height) => {
        const subjectDisplayWidth = getState().device.subjectDisplayWidth
        const subjectDisplayHeight = getState().device.subjectDisplayHeight
        const aspectRatio = Math.min(subjectDisplayWidth / width, subjectDisplayHeight / height)

        const subjectSizes = {
          actualWidth: width,
          actualHeight: height,
          resizedWidth: width * aspectRatio,
          resizedHeight: height * aspectRatio
        }

        dispatch(setState(`classifier.subjectSizes.${workflowID}`, subjectSizes))
        return resolve()
      }, (error) => {
        dispatch(setState(`classifier.subjectSizes.${workflowID}`, {}))
        dispatch(setState('error', error))
        return resolve()
      })
    })
  }
}

export function prefetchNextSubject() {
  return (dispatch, getState) => {
    return new Promise (() => {
      const workflowID = getState().classifier.currentWorkflowID
      const nextSubject = getState().classifier.nextSubject[workflowID]

      return Image.prefetch(nextSubject.display.src)
    })
  }
}


export function fetchUpcomingSubjects(workflowID, subjectToPrepend) {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      apiClient.type('subjects').get({workflow_id: workflowID, sort: 'queued'}).then((subjects) => {
        const subjectList = subjectToPrepend ? prepend(subjectToPrepend, subjects) : subjects
        dispatch(setState(`classifier.upcomingSubjects.${workflowID}`, subjectList))
        return resolve()
      }).catch((error) => {
        dispatch(setState('error', error))
        return reject(error)
      })
    })
  }
}

export function saveAnnotation(task, value) {
  return (dispatch, getState) => {
    const workflowID = getState().classifier.currentWorkflowID
    dispatch(setState(`classifier.annotations.${workflowID}.${task}`, value))
  }
}

export function saveThenStartNewClassification() {
  return (dispatch, getState) => {
    const classifier = getState().classifier
    const workflowID = classifier.currentWorkflowID
    const classification = classifier.classification[workflowID]
    const subject = classifier.subject[workflowID]
    const subjectSizes = classifier.subjectSizes[workflowID]

    const structureAnnotation = (a) => { return { task: a[0], value: a[1] } }
    const annotations = map(structureAnnotation, toPairs(classifier.annotations[workflowID]))

    const subjectDimensions = {
      naturalWidth: subjectSizes.actualWidth,
      naturalHeight: subjectSizes.actualHeight,
      clientWidth: subjectSizes.resizedWidth,
      clientHeight: subjectSizes.resizedHeight
    }
    const updates = {
      annotations: annotations,
      completed: true,
      'metadata.session': getState().session.id,
      'metadata.finished_at': (new Date).toISOString(),
      'metadata.viewport': { width: getState().device.width, height: getState().device.height},
      'metadata.subject_dimensions.0': subjectDimensions
    }

    classification.update(updates)

    classification.save().then(() => {
      //Remove this subject just saved from upcoming subjects
      const workflowID = getState().classifier.currentWorkflowID
      const oldSubjectList = getState().classifier.upcomingSubjects[workflowID]
      const newSubjectList = remove(0, 1, oldSubjectList)
      dispatch(setState(`classifier.upcomingSubjects.${workflowID}`, newSubjectList))
      //Mark this subject as seen
      dispatch(addState(`classifier.seenThisSession.${workflowID}`, subject.id))
      dispatch(startNewClassification(workflowID))

      dispatch(setState(`classifier.annotations.${workflowID}`, {}))
    })
  }
}
