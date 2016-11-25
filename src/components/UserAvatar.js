import React, { Component } from 'react';
import {
  Image
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'


class UserAvatar extends Component {
  render() {
    if (this.props.avatar) {
      return (
        <Image source={{uri: this.props.avatar}} style={styles.avatar} />
      )
    } else {
      return (
        <Image source={require('../../images/simple-avatar.jpg')} style={styles.avatar} />
      )
    }
  }
}

const styles = EStyleSheet.create({
  $size: 86,
  avatar: {
    borderWidth: 1,
    borderColor: 'white',
    width: '$size',
    height: '$size',
    borderRadius: '0.5 * $size',
    position: 'absolute',
    top: 17,
    left: 17,
  },
});

UserAvatar.propTypes = {
  avatar: React.PropTypes.string
}

export default UserAvatar
