import React from 'react'
import {
  Dimensions,
  Image,
  Modal,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import ZoomableImage from './ZoomableImage'
import Icon from 'react-native-vector-icons/FontAwesome'

class FullScreenImage extends React.Component {
  constructor(props) {
    super(props)
     this.state = {
       height: 0,
       width: 0
     }
  }

  componentWillMount() {
    const deviceWidth = Dimensions.get('window').width
    const deviceHeight = Dimensions.get('window').height

    Image.getSize(this.props.source, (width, height) => {
      const aspectRatio = Math.min(deviceWidth / width, deviceHeight / height)
      const resizedHeight = height * aspectRatio
      const resizedWidth = width * aspectRatio
      this.setState({ height: resizedHeight, width: resizedWidth })
    })
  }


  render() {
    console.log('allowpan and zoom on FullScreenImage', this.props.allowPanAndZoom)

    const zoomable =
      <ZoomableImage
        source={this.props.source}
        handlePress={this.props.handlePress}
        imageWidth={this.state.width}
        imageHeight={this.state.height} />

    const staticImage =
      <Image
        source={this.props.source}
        style={{width: this.state.width, height: this.state.height}} />

    return (
      <Modal
        animationType={'fade'}
        transparent={true}
        onRequestClose={() => {}}
        visible={this.props.isVisible}>
        <View style={styles.container}>
          { this.props.allowPanAndZoom ? zoomable : staticImage }
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
