import React, { Component } from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from './StyledModal'
import StyledMarkdown from './StyledMarkdown'
import StyledText from './StyledText'
import Tutorial from './Tutorial'
import FieldGuide from './FieldGuide'
import Button from './Button'
import Icon from 'react-native-vector-icons/FontAwesome'
import { length } from 'ramda'

export class ClassifierTabs extends Component {
  constructor(props) {
    super(props)
    this.setGuideVisibility = this.setGuideVisibility.bind(this)
    this.setTutorialVisibility = this.setTutorialVisibility.bind(this)
    this.setTaskHelpVisibility = this.setTaskHelpVisibility.bind(this)
    this.state = {
      isGuideVisible: false,
      isTutorialVisible: false,
      isTaskHelpVisible: false
    }
  }

  setGuideVisibility(isVisible) {
    this.setState({isGuideVisible: isVisible})
  }
  setTutorialVisibility(isVisible) {
    this.setState({isTutorialVisible: isVisible})
  }
  setTaskHelpVisibility(isVisible) {
    this.setState({isTaskHelpVisible: isVisible})
  }

  render() {

    const taskHelpButton =
      <TouchableOpacity
        onPress={() => this.setTaskHelpVisibility(true)}
        activeOpacity={0.5}
        style={ styles.button }>
        <Icon name='question-circle' style={styles.icon} />
        <StyledText additionalStyles={[styles.title]} text={ 'Task Help' } />
      </TouchableOpacity>

    const tutorialButton =
      <TouchableOpacity
        onPress={() => this.setTutorialVisibility(true)}
        activeOpacity={0.5}
        style={ styles.button }>
        <Icon name='play-circle' style={styles.icon} />
        <StyledText additionalStyles={[styles.title]} text={ 'Project Tutorial' } />
      </TouchableOpacity>

    const fieldGuideButton =
      <TouchableOpacity
        onPress={() => this.setGuideVisibility(true)}
        activeOpacity={0.5}
        style={ styles.button }>
        <Icon name='map-o' style={styles.icon} />
        <StyledText additionalStyles={[styles.title]} text={ 'Field Guide' } />
      </TouchableOpacity>

    const tutorial =
      <Tutorial
        tutorial={this.props.tutorial}
        device={this.props.device}
        setVisibility={this.setTutorialVisibility}
        isVisible={this.state.isTutorialVisible} />

    const fieldGuide =
      <FieldGuide
        guide={this.props.guide}
        setVisibility={this.setGuideVisibility}
        isVisible={this.state.isGuideVisible} />

      const taskHelp =
        <StyledModal
          isVisible={this.state.isTaskHelpVisible}
          setVisibility={this.setTaskHelpVisibility}>
          <View>
            <StyledMarkdown markdown={this.props.helpText} />
          </View>
          <Button
            handlePress={() => this.setTaskHelpVisibility(false)}
            buttonStyle={'navyButton'}
            text={'Close'} />
        </StyledModal>


    return (
      <View style={styles.container}>
        { this.props.helpText ? taskHelpButton : null }
        { this.props.tutorial ? tutorialButton : null }
        { length(this.props.guide.items) > 0 ? fieldGuideButton : null }
        { this.state.isTutorialVisible ? tutorial : null}
        { this.state.isTaskHelpVisible ? taskHelp : null}
        { fieldGuide }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $containerHeight: 50,
  container: {
    backgroundColor: '$beckyDarkGray',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '$containerHeight',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '$containerHeight',
  },
  icon: {
    fontSize: 20,
    color: 'white',
    padding: 3
  },
  title: {
    fontSize: 11,
    color: 'white',
  },
})

ClassifierTabs.propTypes = {
  tutorial: React.PropTypes.object,
  guide: React.PropTypes.object,
  device: React.PropTypes.object,
}

export default ClassifierTabs
