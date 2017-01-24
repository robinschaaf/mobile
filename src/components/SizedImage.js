import React from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
} from 'react-native'

class SizedImage extends React.Component {
  constructor(props) {
    super(props)
     this.state = {
       heightAnim: new Animated.Value(0),
       widthAnim: new Animated.Value(0),
       fadeAnim: new Animated.Value(0)
     }
  }

  componentWillMount() {
    const deviceWidth = Dimensions.get('window').width
    const deviceHeight = Dimensions.get('window').height

    const imageDisplayWidth = this.props.maxWidth ? this.props.maxWidth : deviceWidth
    const imageDisplayHeight = this.props.maxHeight ? this.props.maxHeight : deviceHeight

    console.log('width, height: ', imageDisplayWidth, imageDisplayHeight)

    Image.getSize(this.props.source, (width, height) => {

      const aspectRatio = Math.min(imageDisplayWidth / width, imageDisplayHeight / height)
      const resizedHeight = height * aspectRatio
      const resizedWidth = width * aspectRatio

      Animated.timing(
        this.state.heightAnim,
        {
          toValue: resizedHeight,
          easing: Easing.linear,
          duration: 50,
        }
      ).start()

      Animated.timing(
        this.state.widthAnim,
        {
          toValue: resizedWidth,
          easing: Easing.bezier(0, 1, 0.6, 1),
          duration: 50,
        }
      ).start()


    })
  }

  imageLoadEnd() {
    this.setState({ loading: false })
    Animated.timing(
      this.state.fadeAnim,
      { toValue: 1,
        duration: 200,
      },
    ).start();
  }


  render() {
    return (
      <Animated.Image
        source={ this.props.source }
        style={{width: this.state.widthAnim, height: this.state.heightAnim, opacity: this.state.fadeAnim}}
        onLoadEnd={ ()=>{ this.imageLoadEnd() } }
      />
    )
  }
}


SizedImage.propTypes = {
  source: React.PropTypes.object,
}

export default SizedImage
