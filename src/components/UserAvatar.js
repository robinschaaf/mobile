import React, { Component } from 'react';
import {
  Image
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'


class UserAvatar extends Component {
  render() {
    if (this.props.avatar) {
      return (
        <Image
          defaultSource={require('../../images/simple-avatar.jpg')}
          source={{uri: this.props.avatar}}
          style={styles.avatar}
        />
      )
    } else {
      return (
        <Image source={require('../../images/simple-avatar.jpg')} style={styles.avatar} />
      )
    }
  }
}

const styles = EStyleSheet.create({
  $size: 100,
  avatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '$size',
    height: '$size',
    borderRadius: '0.5 * $size',
  },
});

UserAvatar.propTypes = {
  avatar: React.PropTypes.string
}

export default UserAvatar
