import React, { Component } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import StyledMarkdown from './StyledMarkdown'
import TaskHelp from './TaskHelp'
import ClassifierTabs from './ClassifierTabs'
import { addIndex, map, find, indexOf, isEmpty, reverse } from 'ramda'
import clamp from 'clamp'
import Icon from 'react-native-vector-icons/FontAwesome'

const SWIPE_THRESHOLD = 120

class Classifier extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pan: new Animated.ValueXY(),
      enterAnim: new Animated.Value(0.9),
    }
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y + 100},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        var velocity;

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
          //negative=left (no)
          //positive=right (yes)
          const answer = ( this.state.pan.x._value < 0 ? 0 : 1 )
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
    this.props.onAnswered(answer)
  }

  render() {
    //console.log('this subject', this.props.subject)
    // or seenThisSession.check @props.workflow, @props.subject
    const alreadySeen = this.props.subject.already_seen || indexOf(this.props.subject.id, this.props.seenThisSession) >= 0

    const key = this.props.workflow.first_task
    const helpText = this.props.workflow.tasks[key].help
    const question = this.props.workflow.tasks[key].question
    const answers = reverse(this.props.workflow.tasks[key].answers)

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
    let leftOverlayStyle = {backgroundColor: 'red', opacity: opacityLeft};
    let rightOverlayStyle = {backgroundColor: 'green', opacity: opacityRight};
    let leftOverlayTextStyle = {opacity: opacityLeftText};
    let rightOverlayTextStyle = {opacity: opacityRightText};


    const alreadySeenBanner =
      <View style={styles.alreadySeen}>
        <StyledText additionalStyles={[styles.alreadySeenText]} text={ 'ALREADY SEEN!' } />
      </View>

    const renderAnswer = (answer, idx) => {
      const side = (idx === 0 ? 'left' : 'right')
      const color = (side === 'right' ? 'green' : 'red')
      return (
        <TouchableOpacity
          key={idx}
          onPress={ this.onAnswered.bind(this, idx) }
          activeOpacity={0.5}
          style={[styles.button, {borderColor: color}]}>
          <StyledText textStyle={'large'} additionalStyles={[{color}]} text={ answer.label } />
        </TouchableOpacity>
      )
    }

    const answersContainer =
      <View style={styles.answerContainer}>
        { addIndex(map)(
          (answer, idx) => {
            return renderAnswer(answer, idx)
          },
          answers
        ) }
      </View>

    return (
      <View style={styles.viewContainer}>
        <View style={styles.questionContainer}>
          <StyledMarkdown markdown={question} />
          <TaskHelp text={helpText} />
        </View>

        <Animated.View
          style={[styles.imageContainer, animatedCardStyles]}
          {...this._panResponder.panHandlers}>

          <Image source={{uri: this.props.subject.display.src}} style={[styles.image, imageSizeStyle]} />
          { alreadySeen ? alreadySeenBanner : null }
          <Animated.View style={[styles.overlayContainer, leftOverlayStyle, imageSizeStyle]} />
          <Animated.View style={[styles.overlayContainer, leftOverlayTextStyle, imageSizeStyle]}>
            <StyledText additionalStyles={[styles.answerOverlayText]} text={ answers[0].label } />
          </Animated.View>

          <Animated.View style={[styles.overlayContainer, rightOverlayStyle, imageSizeStyle]} />
          <Animated.View style={[styles.overlayContainer, rightOverlayTextStyle, imageSizeStyle]}>
            <StyledText additionalStyles={[styles.answerOverlayText]} text={ answers[1].label } />
          </Animated.View>
        </Animated.View>

        <View style={styles.instructionContainer}>
          <Icon name='info-circle' style={styles.icon} />
          <View>
            <View style={styles.instructionLineContainer}>
              <StyledText
                additionalStyles={[styles.instructionText, styles.bold]}
                text='Swipe Left' />
              <StyledText
                additionalStyles={[styles.instructionText]}
                text=' to answer ' />
              <StyledText
                additionalStyles={[styles.instructionText, styles.bold]}
                text='No' />
            </View>
            <View style={styles.instructionLineContainer}>
              <StyledText
                additionalStyles={[styles.instructionText, styles.bold]}
                text='Swipe Right' />
              <StyledText
                additionalStyles={[styles.instructionText]}
                text=' to answer ' />
              <StyledText
                additionalStyles={[styles.instructionText, styles.bold]}
                text='Yes' />
            </View>
          </View>
        </View>
        { answersContainer }
      </View>
    )
  }
}
//<ClassifierTabs projectTutorialText={head(this.props.tutorial)} />
const styles = EStyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  alreadySeen: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: '$darkOrange',
    paddingVertical: 2,
    paddingHorizontal: 5,
    transform: [{ rotate: '15deg'}]
  },
  alreadySeenText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  imageContainer: {
    borderRadius: 2,
    marginVertical: 10,
    justifyContent: 'flex-start',
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      height: 1,
      width: 2,
    },
  },
  image: {
    borderRadius: 2
  },
  answerContainer: {
    marginTop: 20,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  button: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 26
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
    justifyContent: 'center'
  },
  answerOverlayText: {
    fontSize: 30,
    color: 'white'
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  instructionLineContainer: {
    flexWrap: 'wrap',
    flexDirection:'row',
    marginHorizontal: 15,
    marginVertical: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '$greyTextColor',
  },
  bold: {
    fontWeight: 'bold'
  },
  icon: {
    fontSize: 40,
    color: '$beckyGray',
  },
})

Classifier.propTypes = {
  subject: React.PropTypes.object,
  workflow: React.PropTypes.object,
  onAnswered: React.PropTypes.func,
  seenThisSession: React.PropTypes.array,
}

export default Classifier
