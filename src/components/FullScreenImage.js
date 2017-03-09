import React from 'react'
import {
  Modal,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import ZoomableImage from './ZoomableImage'
import Icon from 'react-native-vector-icons/FontAwesome'

class FullScreenImage extends React.Component {
  render() {
    return (
      <Modal
        animationType={'fade'}
        transparent={true}
        onRequestClose={() => {}}
        visible={this.props.isVisible}>
        <View style={styles.container}>
          <ZoomableImage
            source={this.props.source}
            handlePress={this.props.handlePress}
            allowPanAndZoom={!!this.props.allowPanAndZoom} />

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.props.handlePress}
            style={styles.closeIcon}>
            <Icon name="times" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
    justifyContent: 'center',
  },
  closeIcon: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 13,
    right: 5
  },
  icon: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 24,
    padding: 15,
  },
})

FullScreenImage.propTypes = {
  source: React.PropTypes.object,
  isVisible: React.PropTypes.bool,
  handlePress: React.PropTypes.func,
  allowPanAndZoom: React.PropTypes.bool
}

export default FullScreenImage
