import React, { Component } from 'react';
import {
  Animated,
  Easing,
  Image,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { indexOf } from 'ramda'

class SwipeSubject extends Component {
  constructor(props) {
    super(props)
    const enterVal = props.inFront ? 0.9 : 0.8
    this.state = {
      enterAnim: new Animated.Value(enterVal),
      topAnim: new Animated.Value(0),
      fadeAnim: new Animated.Value(0),
    }
  }

  //re-rendering the image was causing performance issues and flickering of the image
  //for large images being resized (such as here) is cpu-intensive
  // shouldComponentUpdate(nextProps) {
  //   if (this.props.subject.display.src === nextProps.subject.display.src) {
  //     //this.props.inFront ? console.log('returning false') : {}
  //     return false
  //   } else {
  //     //this.props.inFront ? console.log('returning true') : {}
  //     return true
  //   }
  // }

  imageLoadEnd() {
    const enterVal = this.props.inFront ? 1 : 0.9
      Animated.spring(
        this.state.enterAnim,
        { toValue: enterVal,
        easing: Easing.linear, duration: 300 }
      ).start()
      if (this.props.inFront) {
        Animated.timing(
          this.state.topAnim,
          {toValue: 20,
          easing: Easing.linear,
          duration: 300,
          }
        ).start(() => {
          //Wait for image to load before prefetching next.  Appears to free up cycles
          this.props.prefetchNextSubject()
        })
      }

    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 1,
        duration: 200,
      }
    ).start()
  }

  render() {
    const alreadySeenThisSession = indexOf(this.props.subject.id, this.props.seenThisSession) >= 0
    const alreadySeen = this.props.subject.already_seen || alreadySeenThisSession

    const alreadySeenBanner =
      <View style={styles.alreadySeen}>
        <StyledText additionalStyles={[styles.alreadySeenText]} text={ 'ALREADY SEEN!' } />
      </View>

    const imageSizeStyle = { width: this.props.subjectSizes.resizedWidth, height: this.props.subjectSizes.resizedHeight }
    const bcolor = { borderColor: this.props.inFront ? 'orange' : 'blue' }
    const tranformProperties = this.props.inFront
      ? [{scale: this.state.enterAnim}]
      : [{ translateY: -10 }, {scale: this.state.enterAnim}]

    const elevation = this.props.inFront ? 3 : 1

    return (
      <Animated.View
        key={this.props.subject.id}
        style={[styles.container, {top: this.state.topAnim, transform: tranformProperties, opacity: this.state.fadeAnim}]}>
        <View style={[styles.imageShadow,bcolor, imageSizeStyle, {elevation: elevation}]}>
          <Image
            onLoadEnd={ ()=>{ this.imageLoadEnd() } }
            source={{uri: this.props.subject.display.src}}
            style={[styles.image, imageSizeStyle]}
          />
        { alreadySeen ? alreadySeenBanner : null }
        </View>
      </Animated.View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  imageShadow: {
    borderWidth: 0,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 2,
    },
  },
  image: {
    borderRadius: 2,
  },
  alreadySeen: {
    elevation: 2,
    position: 'absolute',
    top: 16,
    right: 0,
    backgroundColor: '$darkOrange',
    paddingVertical: 2,
    paddingHorizontal: 5,
    transform: [{ rotate: '20deg'}]
  },
  alreadySeenText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
})

SwipeSubject.propTypes = {
  inFront: React.PropTypes.bool,
  subject: React.PropTypes.shape({
    id: React.PropTypes.string,
    already_seen: React.PropTypes.bool,
    display: React.PropTypes.shape({
      src: React.PropTypes.string
    }),
  }),
  subjectSizes: React.PropTypes.shape({
    resizedWidth: React.PropTypes.number,
    resizedHeight: React.PropTypes.number,
  }),
  seenThisSession: React.PropTypes.array,
  prefetchNextSubject: React.PropTypes.func
}

export default SwipeSubject
