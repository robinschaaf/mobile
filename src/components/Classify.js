//on component mount: loadAppropriateClassification
//on swipe (answer): saveClassificationAndLoadAnother

//TODO:  Code Project component to evaluate workflow
//For now hardcode workflows for each project
//TODO: Code tutorial completion on close, automatically open

//TODO: Add "Helper question" ? like Stellar Sea Lions

//TODO:  getLocale, device info needed? (in lieu of user_agent)
//TODO: implement react-native-webview-crypto for session ID generation (requires webview-bridge)

//TODO: Add proptypes Shapes

//TODO??? persist_annotations (looks like workflow configuration - probably can ignore)
//TODO??? nonloadedsubjcts



//ignoring demo mode
//ignoring experimental mode
//ignoring frame (for now)
//ignoring geordi (for now)
//ignoring minicourse (for now)
//ignoring grouped workflow (for now)
//ignoring promptWorkflowAssignmentDialog (for now - for gravity spy only)
//ignoring SKIP_CELLECT (for now - for gravity spy only)


import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { isEmpty } from 'ramda'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import Classifier from './Classifier'
import NavBar from './NavBar'
import Tutorial from './Tutorial'
import FieldGuide from './FieldGuide'
import OverlaySpinner from './OverlaySpinner'
import StyledText from './StyledText'
import {
  startNewClassification,
  saveThenStartNewClassification,
  setImageSizes,
} from '../actions/classifier'

//GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
//GoogleAnalytics.trackEvent('view', 'Home')

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.isFetching,
  workflow: state.classifier.workflow[ownProps.workflowID] || {},
  classification: state.classifier.classification[ownProps.workflowID] || {},
  tutorial: state.classifier.tutorial[ownProps.workflowID] || {},
  guide: state.classifier.guide[ownProps.workflowID] || {},
  subject: state.classifier.subject[ownProps.workflowID] || {},
  seenThisSession: state.classifier.seenThisSession[ownProps.workflowID] || [],
})

const mapDispatchToProps = (dispatch) => ({
  startNewClassification(workflowID) {
    dispatch(startNewClassification(workflowID))
  },
  saveThenStartNewClassification(answerIndex) {
    dispatch(saveThenStartNewClassification(answerIndex))
  },
  setImageSizes() {
    dispatch(setImageSizes())
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
    return <NavBar title={'Classify!'} showBack={true} />;
  }

  //onLayout = () => this.props.setImageSizes()
  onLayout = () => {}

  onAnswered = (answerIndex) => {
    this.props.saveThenStartNewClassification(answerIndex)
  }

  render() {
    const classifier =
      <Classifier
        subject={this.props.subject}
        workflow={this.props.workflow}
        onAnswered={this.onAnswered}
        seenThisSession={this.props.seenThisSession}
      />

    const tutorial =
      <Tutorial
        tutorial={this.props.tutorial}
        switchToQuestion={() => this.setQuestionVisibility(true)} />

    const classifierOrTutorial = this.state.isQuestionVisible ? classifier : tutorial

    console.log('>>>items???', this.props.guide.items !== undefined)
    return (
      <View style={styles.container} onLayout={this.onLayout}>
        <View style={styles.panelContainer}>
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
          { this.props.isFetching || isEmpty(this.props.classification) ? <OverlaySpinner /> : classifierOrTutorial }
        </View>
        { this.props.guide.icons !== undefined ? <FieldGuide guide={this.props.guide} /> : null }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $tabHeight: 40,
  $panelMargin: 15,
  container: {
    backgroundColor: '$beckyGray',
    flex: 1,
    marginTop: 70,
    paddingBottom: 10,
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
  projectID: React.PropTypes.string,
  workflowID: React.PropTypes.string,
  classification: React.PropTypes.object,
  workflow: React.PropTypes.object,
  guide: React.PropTypes.object,
  tutorial: React.PropTypes.object,
  subject: React.PropTypes.object,
  startNewClassification: React.PropTypes.func,
  saveThenStartNewClassification: React.PropTypes.func,
  setImageSizes: React.PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Classify)
