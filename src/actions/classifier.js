import apiClient from 'panoptes-client/lib/api-client'
import { Image } from 'react-native'
import { isEmpty, forEach, head, length, remove } from 'ramda'
import { addState, setState, setIsFetching } from '../actions/index'
import { getAuthUser } from '../actions/auth'
import getSubjectLocation from '../utils/get-subject-location'

export function startNewClassification(workflowID) {
  return (dispatch, getState) => {
    dispatch(setIsFetching(true))
    dispatch(setState('classifier.currentWorkflowID', workflowID))
    dispatch(getAuthUser()).then(() => {
      return dispatch(fetchWorkflow(workflowID))
    }).then(() => {
      if (getState().classifier.tutorial[workflowID] !== undefined) {
        return
      }
      return dispatch(fetchTutorials(workflowID))
    }).then(() => {
      if (getState().classifier.guide[workflowID] !== undefined) {
        return
      }
      const projectID = getState().classifier.workflow[workflowID].links.project
      return dispatch(fetchFieldGuide(projectID))
    }).then(() => {
      console.log('>>>>loading subjects')
      return dispatch(loadSubjects())
    }).then(() => {
      console.log('>>>>getting current subject')
      return dispatch(getCurrentSubject())
    }).then(() => {
      console.log('>>>>creating current classification')
      //now we can create the classification!!
      let subject = getState().classifier.subject[workflowID]
      let workflow = getState().classifier.workflow[workflowID]
      return apiClient.type('classifications').create({
        annotations: [],
        metadata: {
          workflow_version: workflow.version,
          started_at: (new Date).toISOString(),
          user_agent: 'iOS',
          user_language: 'en',
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
      dispatch(setIsFetching(false))
    })
  }
}

export function fetchWorkflow(workflowID) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      //apiClient.type('projects').get(projectID).then((project) => {
      //  project.get('workflows',  {active: true, page_size: 100}).then((workflows) => {

      //    const isFriendly = (workflow) => {
      //      const firstTask = workflow.tasks[workflow.first_task]
      //      console.log('answers count', length(firstTask.answers))
      //      console.log('tasks length', length(keys(workflow.tasks)))

      //      const isTaskOfTypeSingle = () => firstTask.type === 'single'
      //      const hasTwoAnswers = () => equals(length(firstTask.answers), 2)
      //      const hasOneTask = () => equals(length(keys(workflow.tasks)), 1)

      //      if ((isTaskOfTypeSingle) && (hasTwoAnswers) && (hasOneTask)){
      //        return true
      //      }
      //    }
      //    const friendlyWorkflows = filter(isFriendly, workflows)
      //    console.log('workflowcount', length(workflows))
      //    console.log('friendlyworkflowcount', length(friendlyWorkflows))
      //  })
      //})

      apiClient.type('workflows').get({id: workflowID}).then((workflow) => {
        dispatch(setState(`classifier.workflow.${workflowID}`, head(workflow)))
        return resolve()
      }).catch(() => {
        return reject()
      })
   })
  }
}

export function loadSubjects() {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      const workflowID = getState().classifier.currentWorkflowID
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowID] || []
      let retrieveSubjects = Promise.resolve()

      console.log('IN LOADING SUBJECTS:  Current length! ', length(upcomingSubjects))
      if (length(upcomingSubjects) <= 1){
        retrieveSubjects = dispatch(fetchUpcomingSubjects(workflowID))
      }

      retrieveSubjects.then(() => {
        return resolve()
      }, (error) => {
        dispatch(setState('error', error))
        return reject()
      })
    })
  }
}

export function getCurrentSubject() {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      const workflowID = getState().classifier.currentWorkflowID
      let allSubjects = getState().classifier.upcomingSubjects[workflowID]
      let subject = allSubjects[0]
      let nextSubject = allSubjects[1]
      subject.display = getSubjectLocation(subject)
      nextSubject.display = getSubjectLocation(nextSubject)

      dispatch(setState(`classifier.subject.${workflowID}`, subject))

      dispatch(setImageSizes(subject)).then(() => {
        //try to preload next image, but if it fails nbd
        Image.prefetch(nextSubject.display.src)
        return resolve()
      }, (error) => {
        dispatch(setState('error', error))
        return reject()
      })
    })
  }
}

export function setImageSizes(subject) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      console.log('fetching image sizes for subject: ', subject.display.src)
      let workflowID = getState().classifier.currentWorkflowID
      var start = Date.now();
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

        var end = Date.now();
        var elapsed = end - start;
        console.log('Calculated time to load image Info', elapsed)
        dispatch(setState(`classifier.subject.${workflowID}.sizes`, subjectSizes))
        return resolve()
      }, (error) => {
        dispatch(setState(`classifier.subject.${workflowID}.sizes`, {}))
        dispatch(setState('error', error))
        return resolve()
      })
    })
  }

}

export function fetchUpcomingSubjects(workflowID) {
  console.log('FETCHING NEW UPCOMING SUBJECTS!!')
  return dispatch => {
    return new Promise ((resolve, reject) => {
      apiClient.type('subjects').get({workflow_id: workflowID, sort: 'queued'}).then((subjects) => {
        //TODO: need to test if we need nonLoadedSubjects - I think it's to avoid duplicates
        dispatch(setState(`classifier.upcomingSubjects.${workflowID}`, subjects))
        return resolve()
      }).catch((error) => {
        dispatch(setState('error', error))
        return reject()
      })
    })
  }
}

export function saveThenStartNewClassification(answerIndex) {
  return (dispatch, getState) => {
    const classifier = getState().classifier
    const workflowID = classifier.currentWorkflowID
    const classification = classifier.classification[workflowID]
    const subject = classifier.subject[workflowID]
    const workflow = classifier.workflow[workflowID]

    const annotations = [{
      value: answerIndex,
      task: workflow.first_task //hardcoded for "single" task types
    }]

    const subjectDimensions = {
      naturalWidth: subject.sizes.actualWidth,
      naturalHeight: subject.sizes.actualHeight,
      clientWidth: subject.sizes.resizedWidth,
      clientHeight: subject.sizes.resizedHeight
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
      //Remove from upcoming subjects to get a new one
      const workflowID = getState().classifier.currentWorkflowID
      const oldSubjectList = getState().classifier.upcomingSubjects[workflowID]
      const newSubjectList = remove(0, 1, oldSubjectList)
      dispatch(setState(`classifier.upcomingSubjects.${workflowID}`, newSubjectList))
      //Mark this subject as seen
      dispatch(addState(`classifier.seenThisSession.${workflowID}`, subject.id))
      dispatch(startNewClassification(workflowID))
    })

  }
}


export function fetchTutorials(workflowID) {
  return dispatch => {
    return new Promise ((resolve) => {
      apiClient.type('tutorials').get({workflow_id: workflowID}).then((tutorials) => {
        const tutorialResource = head(tutorials)
        dispatch(setState(`classifier.tutorial.${workflowID}`, tutorialResource))
        if (!isEmpty(tutorials)) {
          let mediaByID = {}
          tutorialResource.get('attached_images').then((mediaResources) => {
            forEach((mediaResource) => mediaByID[mediaResource.id] = mediaResource, mediaResources)
            dispatch(setState(`classifier.tutorial.${workflowID}.mediaResources`, mediaByID))
            return resolve()
          }).catch(() => {
            return resolve()
          })
        } else {
          return resolve()
        }
      }).catch(() => { //does not exist for this project
        return resolve()
      })
    })
  }
}

export function fetchFieldGuide(projectID) {
  return (dispatch, getState) => {
    const workflowID = getState().classifier.currentWorkflowID
    return new Promise ((resolve) => {
      apiClient.type('field_guides').get({project_id: projectID}).then((guide) => {
        const guideResource = head(guide)
        dispatch(setState(`classifier.guide.${workflowID}`, guideResource))
        if (!isEmpty(guide)) {
          let icons = {}
          guideResource.get('attached_images').then((images) => {
            forEach((image) => icons[image.id] = image, images)
            dispatch(setState(`classifier.guide.${workflowID}.icons`, icons))
            console.log('FINISHED GETTING ICONS FOR FIELD GUIDE')
            return resolve()
          }).catch(() => {
            return resolve()
          })
        } else {
          return resolve()
        }
      }).catch(() => { //does not exist for this project
        return resolve()
      })
    })
  }
}
