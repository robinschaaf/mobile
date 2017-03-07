import React from 'react'
import {
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'

class ZoomableImage extends React.Component {
  render() {
    return (
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={this.props.imageWidth}
        imageHeight={this.props.imageHeight}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.props.handlePress}>
          <Image
            source={ this.props.source }
            style={{width: this.props.imageWidth, height: this.props.imageHeight}} />
        </TouchableOpacity>
      </ImageZoom>
    )
  }
}


ZoomableImage.propTypes = {
  source: React.PropTypes.object,
  handlePress: React.PropTypes.func,
  imageWidth: React.PropTypes.number,
  imageHeight: React.PropTypes.number,
}

export default ZoomableImage
