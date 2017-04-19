import React from 'react'
import {
  StyleSheet,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import ClassificationPanel from './ClassificationPanel'
import Question from './Question'
import Swipeable from './Swipeable'
import SwipeSubject from './SwipeSubject'
import OverlaySpinner from './OverlaySpinner'
import NavBar from './NavBar'
import { setState } from '../actions/index'
import { startNewClassification } from '../actions/classifier'

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.classifier.isFetching,
  workflow: state.classifier.workflow[ownProps.workflowID] || {},
  subject: state.classifier.subject[ownProps.workflowID] || {},
  nextSubject: state.classifier.nextSubject[ownProps.workflowID] || {},
  subjectSizes: state.classifier.subjectSizes[ownProps.workflowID] || {},
  seenThisSession: state.classifier.seenThisSession[ownProps.workflowID] || [],
})

const mapDispatchToProps = (dispatch) => ({
  startNewClassification(workflowID) {
    dispatch(startNewClassification(workflowID))
  },
  setIsFetching(isFetching) {
    dispatch(setState('classifier.isFetching', isFetching))
  },
})

export class SwipeClassifier extends React.Component {
  componentWillMount() {
    this.props.setIsFetching(true)
    this.props.startNewClassification(this.props.workflowID)
  }

  static renderNavigationBar() {
    return <NavBar title={'Classify'} showBack={true} />;
  }

  render() {
    const renderClassifier = () => {
      const key = this.props.workflow.first_task //always just one task
      const task = this.props.workflow.tasks[key]
      return (
        <View style={{...StyleSheet.absoluteFillObject}}>
            <ClassificationPanel
              isFetching={ this.props.isFetching }
              hasTutorial = { false }>
              <Question question={task.question} workflowID={this.props.workflowID} />
                <View style={[styles.subjectContainer, { width: this.props.subjectSizes.resizedWidth, height: this.props.subjectSizes.resizedHeight }]}>
                  <SwipeSubject
                    inFront={false}
                    subject={this.props.nextSubject}
                    subjectSizes={this.props.subjectSizes}
                    seenThisSession={this.props.seenThisSession}
                    setImageSizes={() => {}}
                  />
                </View>
            </ClassificationPanel>
            <Swipeable
              key={this.props.subject.id}
              workflowID={this.props.workflowID}
            />
        </View>
      )
    }

    return (
        this.props.isFetching ? <OverlaySpinner overrideVisibility={this.props.isFetching} /> : renderClassifier()
    )
  }
}

const styles = EStyleSheet.create({
  subjectContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
})

SwipeClassifier.propTypes = {
  isFetching: React.PropTypes.bool,
  workflowID: React.PropTypes.string,
  workflow: React.PropTypes.shape({
    first_task: React.PropTypes.string,
    tasks: React.PropTypes.object,
  }),
  subject: React.PropTypes.shape({
    id: React.PropTypes.string,
  }),
  nextSubject: React.PropTypes.shape({
    id: React.PropTypes.string
  }),
  subjectSizes: React.PropTypes.object,
  seenThisSession: React.PropTypes.array,
  startNewClassification: React.PropTypes.func,
  setIsFetching: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwipeClassifier)
