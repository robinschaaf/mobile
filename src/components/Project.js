import React, { Component } from 'react';
import {
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'

class Project extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      loading: true,
      fadeAnim: new Animated.Value(0)
    }
  }

  imageLoadEnd() {
    this.setState({ loading: false })
    Animated.timing(       // Uses easing functions
      this.state.fadeAnim, // The value to drive
      {
        toValue: 1,        // Target
        duration: 200,    // Configuration
      },
    ).start();             // Don't forget start!
  }


  handleClick() {
    GoogleAnalytics.trackEvent('view', this.props.project.display_name)
    Actions.ZooWebView({slug: this.props.project.slug, displayName: this.props.project.display_name})
  }

  render() {
    const imageURI = `https://${this.props.project.avatar_src}`
    const imageStyle = ( this.props.project.id === '55' ? [styles.avatar, styles.topAlignedAvatar] : [styles.avatar] )

    return (
      <Animated.View   // Special animatable View
        style={{
          opacity: this.state.fadeAnim,  // Binds
        }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={this.handleClick}
          style={styles.container}>
          <Image source={{uri: imageURI}} style={imageStyle} onLoadEnd={ ()=>{ this.imageLoadEnd() } } />
            <View style={styles.forBorderRadius} />
            <View style={styles.textContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{this.props.project.display_name}</Text>
                <Text style={styles.description} numberOfLines={2} ellipsizeMode={'tail'}>{this.props.project.description}</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: this.props.color }]}>
                <Icon name="angle-right" style={styles.icon} />
              </View>
            </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

const styles = EStyleSheet.create({
  $boxHeight: 232,
  $titleHeight: 88,
  $borderRadius: 5,
  $iconSize: 40,
  $sidePadding: 15,
  $totalSidePadding: '$sidePadding * 2',
  $subtractTextWidth: '48 + $iconSize',
  container: {
    height: '$boxHeight + 12',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 15,
    overflow: 'hidden'
  },
  avatar: {
    borderRadius: '$borderRadius',
    borderWidth: 1,
    borderColor: '$greyBorder',
    flex: 1,
    height: '$boxHeight',
    width: null
  },
  topAlignedAvatar: {
    height: '$boxHeight + 140',
  },
  forBorderRadius: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '$titleHeight',
    backgroundColor: '$lightGreyBackground'
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: '$borderRadius',
    borderBottomRightRadius: '$borderRadius',
    borderWidth: 1,
    borderColor: '$greyBorder',
    borderTopColor: 'transparent',
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    height: '$titleHeight',
  },
  titleContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingRight: 20,
    width: '100% - $subtractTextWidth',
  },
  title: {
    backgroundColor: '$transparent',
    color: '$darkGreyTextColor',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 18,
    paddingBottom: 3
  },
  description: {
    color: '$greyTextColor',
    fontFamily: 'OpenSans',
    fontSize: 12,
  },
  iconContainer: {
    borderRadius: '0.5 * $iconSize',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '$iconSize',
    height: '$iconSize'
  },
  icon: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 36,
    lineHeight: 37,
    paddingLeft: 4
  }
});

Project.propTypes = {
  project: React.PropTypes.object.isRequired,
  color:  React.PropTypes.string.isRequired,
}
export default Project
