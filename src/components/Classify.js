//TODO:  getLocale, device info needed? (in lieu of user_agent)

//TODO: Add proptypes Shapes

//TODO??? nonloadedsubjcts

//ignoring demo mode
//ignoring experimental mode
//ignoring frame (for now)
//ignoring geordi (for now)
//ignoring minicourse (for now)
//ignoring grouped workflow (for now)
//ignoring promptWorkflowAssignmentDialog (for now - for gravity spy only)
//ignoring SKIP_CELLECT (for now - for gravity spy only)
//ignoring persist_annotations (looks like for multi steps)


import React from 'react'
import {
  Platform,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { append, contains, isEmpty, uniq } from 'ramda'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import Classifier from './Classifier'
import NavBar from './NavBar'
import Tutorial from './Tutorial'
import FieldGuide from './FieldGuide'
import OverlaySpinner from './OverlaySpinner'
import StyledText from './StyledText'
import {
  removeAnnotationValue,
  saveAnnotation,
  startNewClassification,
  saveThenStartNewClassification,
  setImageSizes,
  setTutorialCompleted,
} from '../actions/classifier'

const topPadding = (Platform.OS === 'ios') ? 10 : 0

//GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
//GoogleAnalytics.trackEvent('view', 'Home')

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.isFetching,
  workflow: state.classifier.workflow[ownProps.workflowID] || {},
  classification: state.classifier.classification[ownProps.workflowID] || {},
  annotations: state.classifier.annotations[ownProps.workflowID] || {},
  tutorial: state.classifier.tutorial[ownProps.workflowID] || {},
  guide: state.classifier.guide[ownProps.workflowID] || {},
  subject: state.classifier.subject[ownProps.workflowID] || {},
  seenThisSession: state.classifier.seenThisSession[ownProps.workflowID] || [],
  needsTutorial: state.classifier.needsTutorial[ownProps.workflowID] || false,
})

const mapDispatchToProps = (dispatch) => ({
  startNewClassification(workflowID) {
    dispatch(startNewClassification(workflowID))
  },
  saveAnnotation(task, value) {
    dispatch(saveAnnotation(task, value))
  },
  saveThenStartNewClassification(answerIndex) {
    dispatch(saveThenStartNewClassification(answerIndex))
  },
  setImageSizes() {
    dispatch(setImageSizes())
  },
  setTutorialCompleted() {
    dispatch(setTutorialCompleted())
  },
  removeAnnotationValue(task, value) {
    dispatch(removeAnnotationValue(task, value))
  },
})

class Classify extends React.Component {
  constructor(props) {
    super(props)
    this.setQuestionVisibility = this.setQuestionVisibility.bind(this)
    this.state = {
      isQuestionVisible: true,
    }
  }

  setQuestionVisibility(isVisible) {
    this.setState({isQuestionVisible: isVisible})
  }

  componentWillMount() {
    if (isEmpty(this.props.classification)) {
      this.props.startNewClassification(this.props.workflowID)
    }
  }

  static renderNavigationBar() {
    return <NavBar title={'Classify'} showBack={true} />;
  }

  finishTutorial() {
    if (this.props.needsTutorial) {
      this.props.setTutorialCompleted()
    } else {
      this.setQuestionVisibility(true)
    }
  }

  onAnswered = (task, value) => {
    this.props.saveAnnotation(task, value)
    this.props.saveThenStartNewClassification()
  }

  onUnlinkedTaskAnswered = (task, value) => {
    const taskAnnotations = this.props.annotations[task] || []
    if (contains(value, taskAnnotations)) {
      this.props.removeAnnotationValue(task, value)
    } else {
      this.props.saveAnnotation(task, uniq(append(value, taskAnnotations)))
    }
  }

  render() {
    const classifier =
      <Classifier
        seenThisSession={this.props.seenThisSession}
        subject={this.props.subject}
        workflow={this.props.workflow}
        onAnswered={this.onAnswered}
        onUnlinkedTaskAnswered={this.onUnlinkedTaskAnswered}
        annotations={this.props.annotations}
      />

    const tutorial =
      <Tutorial
        isInitialTutorial={this.props.needsTutorial}
        tutorial={this.props.tutorial}
        finishTutorial={() => this.finishTutorial()} />

    const classifierOrTutorial = this.state.isQuestionVisible ? classifier : tutorial

    const tabs =
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={ () => { this.setQuestionVisibility(true) } }
          style={ this.state.isQuestionVisible ? [styles.tab] : [styles.tab, styles.deselectedTab] }>
          <StyledText text={ 'QUESTION' } />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => { this.setQuestionVisibility(false) } }
          style={ this.state.isQuestionVisible ? [styles.tab, styles.deselectedTab] : [styles.tab] }>
          <StyledText text={ 'TUTORIAL' } />
        </TouchableOpacity>
      </View>

    const classificationPanel =
      <View style={styles.panelContainer}>
        { !isEmpty(this.props.tutorial) ? tabs : null }
        { this.props.isFetching || isEmpty(this.props.classification) ? <OverlaySpinner /> : classifierOrTutorial }
      </View>

    return (
      <View style={styles.container} onLayout={this.onLayout}>
        { this.props.needsTutorial ? tutorial : classificationPanel}
        { this.props.guide.icons !== undefined && !this.props.needsTutorial ? <FieldGuide guide={this.props.guide} /> : null }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $tabHeight: 32,
  $panelMargin: 13,
  container: {
    backgroundColor: '$beckyGray',
    flex: 1,
    marginTop: 60,
    paddingTop: topPadding,
    paddingBottom: 3,
  },
  panelContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: '$panelMargin',
  },
  tabContainer: {
    height: '$tabHeight',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$tabHeight',
    width: '50% - $panelMargin',
    marginTop: 1,
  },
  deselectedTab: {
    backgroundColor: '$beckyGray',
  }
});

Classify.propTypes = {
  isFetching: React.PropTypes.bool,
  workflowID: React.PropTypes.string,
  classification: React.PropTypes.object,
  annotations: React.PropTypes.object,
  seenThisSession: React.PropTypes.array,
  workflow: React.PropTypes.object,
  guide: React.PropTypes.object,
  tutorial: React.PropTypes.object,
  needsTutorial: React.PropTypes.bool,
  subject: React.PropTypes.object,
  startNewClassification: React.PropTypes.func,
  saveThenStartNewClassification: React.PropTypes.func,
  setImageSizes: React.PropTypes.func,
  setTutorialCompleted: React.PropTypes.func,
  saveAnnotation: React.PropTypes.func,
  removeAnnotationValue: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Classify)
