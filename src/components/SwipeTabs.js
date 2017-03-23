import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import FieldGuide from './FieldGuide'
import Icon from 'react-native-vector-icons/FontAwesome'
import { length } from 'ramda'

export class ClassifierTabs extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isFieldGuideVisible: false,
    }
  }
  render() {
    const leftButton =
      <TouchableOpacity
        onPress={this.props.onAnswered.bind(this, 1)}
        activeOpacity={0.5}
        style={ [styles.button, styles.tealButton] }>
        <Image source={require('../../images/swipe-left-white.png')} style={styles.swipeIcon} />
        <StyledText additionalStyles={[styles.tealButtonText]} text={ 'No' } />
      </TouchableOpacity>


    const rightButton =
      <TouchableOpacity
        onPress={this.props.onAnswered.bind(this, 0)}
        activeOpacity={0.5}
        style={ [styles.button, styles.tealButton] }>
        <Image source={require('../../images/swipe-right-white.png')} style={styles.swipeIcon} />
        <StyledText additionalStyles={[styles.tealButtonText]} text={ 'Yes' } />
      </TouchableOpacity>

    const fieldGuideButton =
      <TouchableOpacity
        onPress={() => this.setState({isFieldGuideVisible: true})}
        activeOpacity={0.5}
        style={ styles.button }>
        <Icon name='map-o' style={styles.icon} />
        <StyledText additionalStyles={[styles.buttonText]} text={ 'Field Guide' } />
      </TouchableOpacity>

    const fieldGuide =
      <FieldGuide
      guide={this.props.guide}
      isVisible={this.state.isFieldGuideVisible}
      onClose={() => this.setState({isFieldGuideVisible: false})}
      />

    return (
      <View style={styles.container}>
        { leftButton }
        { length(this.props.guide.items) > 0 ? fieldGuideButton : null }
        { rightButton }
        { this.state.isFieldGuideVisible ? fieldGuide : null }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $containerHeight: 60,
  container: {
    backgroundColor: '$beckyGray',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '$containerHeight',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    backgroundColor: 'white',
    borderColor: '$beckyDisabledIconColor',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  buttonText: {
    color: '$beckyDarkGray',
  },
  tealButton: {
    backgroundColor: '$buttonColor'
  },
  tealButtonText: {
    color: 'white'
  },
  icon: {
    fontSize: 16,
    color: '$beckyDarkGray',
    padding: 3,
    marginRight: 5
  },
  title: {
    fontSize: 11,
    color: 'white',
  },
  swipeIcon: {
    height: 27,
    width: 20,
    marginRight: 10,
  },
})

ClassifierTabs.propTypes = {
  tutorial: React.PropTypes.object,
  device: React.PropTypes.object,
}

export default ClassifierTabs
