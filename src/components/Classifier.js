import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import StyledMarkdown from './StyledMarkdown'
import FullScreenImage from './FullScreenImage'
import UnlinkedTask from './UnlinkedTask'
import SwipeTabs from './SwipeTabs'
import Subject from './Subject'
import TaskHelp from './TaskHelp'
import { addIndex, clamp, map, reverse } from 'ramda'

const SWIPE_THRESHOLD = 120
const leftOverlayColor = '#E45950'
const rightOverlayColor = '#00979D'

class Classifier extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pan: new Animated.ValueXY(),
      enterAnim: new Animated.Value(0.9),
      showFullSize: false,
      questionContainerHeight: 0,
    }
  }

  isSwipeGesture(gestureState) {
    return gestureState.dx > 5 || gestureState.dx < -5
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetResponder: (evt, gestureState) => this.isSwipeGesture(gestureState),
      onMoveShouldSetPanResponder: (evt, gestureState) => this.isSwipeGesture(gestureState),

      onPanResponderGrant: () => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y + 100},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        let velocity

        if (vx >= 0) {
          velocity = clamp(3, 5, vx)
        } else if (vx < 0) {
          velocity = clamp(3, 5, vx * -1) * -1
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
          //negative=left (no = index 1)
          //positive=right (yes = index 0)
          const answer = ( this.state.pan.x._value < 0 ? 1 : 0 )
          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.98
          }).start(this.onAnswered(answer))
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  }

  componentDidMount() {
    this.animateEntrance();
  }

  animateEntrance() {
    Animated.spring(
      this.state.enterAnim,
      { toValue: 1, friction: 8 }
    ).start();
  }

  onAnswered = (answer) => {
    this.props.onAnswered(this.props.workflow.first_task, answer)
  }

  displayFull() {
    this.setState({ showFullSize: true })
  }

  onQuestionResize(newHeight) {
    this.setState({ questionContainerHeight: newHeight })
  }

  render() {
    const allowPanAndZoom = this.props.workflow.configuration.pan_and_zoom

    const key = this.props.workflow.first_task //always just one task
    const task = this.props.workflow.tasks[key]

    const unlinkedTask = task.unlinkedTask
      ? <UnlinkedTask
          unlinkedTaskKey={ task.unlinkedTask }
          unlinkedTask={ this.props.workflow.tasks[task.unlinkedTask] }
          annotation={ this.props.annotations[task.unlinkedTask] }
          onAnswered={ this.props.onUnlinkedTaskAnswered }/>
      : null

    const answers = reverse(task.answers)

    const imageSizeStyle = { width: this.props.subject.sizes.resizedWidth, height: this.props.subject.sizes.resizedHeight }

    let { pan, enterAnim, } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ['-30deg', '0deg', '30deg']});
    let opacityRight = pan.x.interpolate({inputRange: [0, 100, 200], outputRange: [0, .6, .8]})
    let opacityLeft = pan.x.interpolate({inputRange: [-200, -100, 0], outputRange: [.8, .6, 0]})
    let opacityRightText = pan.x.interpolate({inputRange: [0, 30], outputRange: [0, 1]})
    let opacityLeftText = pan.x.interpolate({inputRange: [-30, 0], outputRange: [1, 0]})
    let scale = enterAnim;

    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}]}
    let leftOverlayStyle = {backgroundColor: leftOverlayColor, opacity: opacityLeft}
    let rightOverlayStyle = {backgroundColor: rightOverlayColor, opacity: opacityRight}
    let leftOverlayTextStyle = {opacity: opacityLeftText}
    let rightOverlayTextStyle = {opacity: opacityRightText}

    return (
      <View style={styles.container}>
        <View style={[styles.questionContainer, { height: this.state.questionContainerHeight }]}>
          <View style={styles.question}>
            <StyledMarkdown
              extraCSS={ 'p {font-size: 14px; font-weight: 500; margin: 5px 0 0;}' }
              markdown={task.question}
              width={Dimensions.get('window').width - 100}
              onResize={ (newHeight) => this.setState({ questionContainerHeight: newHeight }) }
            />
          </View>
          { task.help ? <TaskHelp text={task.help} /> : null }
        </View>

        <Animated.View
          style={[styles.imageContainer, animatedCardStyles]}
          {...this._panResponder.panHandlers}>

          <TouchableOpacity onPress={() => this.setState({ showFullSize: true })}>
            <Subject subject={this.props.subject} seenThisSession={this.props.seenThisSession}/>

            <Animated.View style={[styles.overlayContainer, leftOverlayStyle, imageSizeStyle]} />
            <Animated.View style={[styles.overlayContainer, leftOverlayTextStyle, imageSizeStyle]}>
              <StyledText additionalStyles={[styles.answerOverlayText]} text={ answers[0].label } />
            </Animated.View>

            <Animated.View style={[styles.overlayContainer, rightOverlayStyle, imageSizeStyle]} />
            <Animated.View style={[styles.overlayContainer, rightOverlayTextStyle, imageSizeStyle]}>
              <StyledText additionalStyles={[styles.answerOverlayText]} text={ answers[1].label } />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
        { unlinkedTask }
        <SwipeTabs
          guide={this.props.guide}
          answers={answers}
          onAnswered={this.onAnswered}
          />
        <FullScreenImage
          source={{uri: this.props.subject.display.src}}
          isVisible={this.state.showFullSize}
          allowPanAndZoom={allowPanAndZoom}
          handlePress={() => this.setState({ showFullSize: false })} />
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $paddingToInner: 70,
  $helpIconSize: 30,
  $helpIconAndPadding: '$paddingToInner + $helpIconSize',
  container: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  question: {
    flex: 1,
    width: '100% - $helpIconAndPadding',
  },
  imageContainer: {
    elevation: 1,
    backgroundColor: 'white',
    borderRadius: 2,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      height: 1,
      width: 2,
    },
  },
  answerContainer: {
    width: '100% - $paddingToInner',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  button: {
    backgroundColor: '$beckyGray',
    borderColor: '$beckyDisabledIconColor',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '$beckyDarkGray',
  },
  swipeIcon: {
    height: 27,
    width: 20,
    marginRight: 10
  },
  overlayContainer: {
    borderRadius: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  answerOverlayText: {
    fontSize: 30,
    color: 'white'
  },
})

Classifier.propTypes = {
  subject: React.PropTypes.object,
  workflow: React.PropTypes.object,
  onAnswered: React.PropTypes.func,
  onUnlinkedTaskAnswered: React.PropTypes.func,
  seenThisSession: React.PropTypes.array,
  annotations: React.PropTypes.object,
}

export default Classifier
