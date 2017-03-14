import React, { Component } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledMarkdown from './StyledMarkdown'
import StyledText from './StyledText'
import SizedImage from './SizedImage'
import Button from './Button'
import Icon from 'react-native-vector-icons/FontAwesome'
import { addIndex, length, map } from 'ramda'

export class Tutorial extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      sizedHeight: 0,
      sizedWidth: 0,
    }
  }

  render() {
    const steps = this.props.tutorial.steps
    const step = steps[this.state.step]
    const totalSteps = length(steps)

    const mediaResource = (step.media ? this.props.tutorial.mediaResources[step.media] : null )
    const mediaImage = (mediaResource !== null ? <SizedImage source={{ uri: mediaResource.src }} /> : null)

    const hasPreviousStep = this.state.step > 0
    const previousStep =
      <TouchableOpacity
        onPress={() => this.setState({step: this.state.step - 1})}
        style={styles.navIconContainer}>
        <Icon name='chevron-left' style={styles.navIcon} />
      </TouchableOpacity>

    const disabledPrevious =
      <View style={styles.navIconContainer}>
        <Icon name='chevron-left' style={[styles.navIcon, styles.disabledIcon]} />
      </View>

    const hasNextStep = (this.state.step + 1) < totalSteps
    const nextStep =
      <TouchableOpacity
        onPress={() => this.setState({step: this.state.step + 1})}
        style={styles.navIconContainer}>
        <Icon name='chevron-right' style={styles.navIcon} />
      </TouchableOpacity>

    const disabledNext =
      <View style={styles.navIconContainer}>
        <Icon name='chevron-right' style={[styles.navIcon, styles.disabledIcon]} />
      </View>

    const renderCircle = (currentStep, idx) => {
      return (
        <Icon
          key={ idx }
          name={ currentStep === idx ? 'circle' : 'circle-thin'}
          style={styles.circleIcon} />
      )
    }

    const navigation =
      <View style={styles.navigation}>
        { hasPreviousStep ? previousStep : disabledPrevious }
        { addIndex (map)(
          (step, idx) => {
            return renderCircle(this.state.step, idx)
          },
          steps
        ) }
        { hasNextStep ? nextStep : disabledNext }
      </View>

    const continueButton =
      <Button
        handlePress={() => this.setState({step: this.state.step + 1})}
        additionalStyles={[styles.orangeButton]}
        text={'Continue'} />

    const finishedButton =
      <Button
        handlePress={this.props.finishTutorial}
        additionalStyles={[styles.orangeButton]}
        text={'Let\s Go!'} />

    const tutorialHeader =
      <StyledText
        text={'Project Tutorial'}
        additionalStyles={[styles.tutorialHeader]}/>

    return (
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          { this.props.isInitialTutorial ? tutorialHeader : null}
          { mediaImage }
          <StyledMarkdown
            width={ Dimensions.get('window').width - 80 }
            markdown={steps[this.state.step].content}
          />
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.line} />
          { hasNextStep ? continueButton : finishedButton }
          { totalSteps > 0 ? navigation : null }
        </View>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    height: '100% - 300',
    margin: 20,
    marginBottom: 0
  },
  footer: {
    height: 110,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  navigation: {
    alignSelf: 'stretch',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  circleIcon: {
    fontSize: 12,
    color: 'black',
    paddingHorizontal: 3,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  navIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 16,
    color: '$beckyIconColor',
    padding: 10,
    backgroundColor: 'transparent',
  },
  disabledIcon: {
    color: '$beckyDisabledIconColor',
  },
  emptyNav: {
    height: 36,
    width: 36
  },
  orangeButton: {
    backgroundColor: '$beckyOrange',
    marginBottom: 0,
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '$beckyLightGray',
  },
  tutorialHeader: {
    fontSize: 20,
    marginBottom: 10,
  }
})

Tutorial.propTypes = {
  tutorial: React.PropTypes.object,
  finishTutorial: React.PropTypes.func,
  isInitialTutorial: React.PropTypes.bool,
}

export default Tutorial
