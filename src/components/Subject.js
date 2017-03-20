import React, { Component } from 'react';
import {
  Image,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { indexOf } from 'ramda'


class Subject extends Component {
  render() {
    const alreadySeenThisSession = indexOf(this.props.subject.id, this.props.seenThisSession) >= 0
    const alreadySeen = this.props.subject.already_seen || alreadySeenThisSession

    const alreadySeenBanner =
      <View style={styles.alreadySeen}>
        <StyledText additionalStyles={[styles.alreadySeenText]} text={ 'ALREADY SEEN!' } />
      </View>

    const imageSizeStyle = { width: this.props.subject.sizes.resizedWidth, height: this.props.subject.sizes.resizedHeight }

    return (
      <View style={styles.container}>
        <Image source={{uri: this.props.subject.display.src}} style={[styles.image, imageSizeStyle]} />
        { alreadySeen ? alreadySeenBanner : null }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  image: {
    borderRadius: 2
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

Subject.propTypes = {
  subject: React.PropTypes.shape({
    id: React.PropTypes.string,
    already_seen: React.PropTypes.bool,
    display: React.PropTypes.shape({
      src: React.PropTypes.string
    }),
    sizes: React.PropTypes.shape({
      resizedWidth: React.PropTypes.number,
      resizedHeight: React.PropTypes.number,
    })
  }),
  seenThisSession: React.PropTypes.array,
}
export default Subject
