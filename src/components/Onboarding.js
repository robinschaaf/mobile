import React from 'react'
import {
  Animated,
  Image,
  StatusBar,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Button from './Button'
import { Actions } from 'react-native-router-flux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Onboarding')

class Onboarding extends React.Component {
  constructor(props) {
    super(props)
    this.handlePress = this.handlePress.bind(this)
  }

  handlePress() {
    Actions.SignIn()
  }

  componentWillMount() {
    StatusBar.setHidden(true)
  }

  componentWillUnmount() {
    StatusBar.setHidden(false)
  }

  render() {

    const introText = 'The Zooniverse enables everyone to take part in real cutting edge research in many fields across the sciences, humanities, and more.'

    //{{uri: 'app_icon'}}
    //{require('../../images/Planet.jpg')}
    return (
      <Image source={require('../../images/Planet.jpg')} style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../images/logo.png')} style={styles.logo} />
          <StyledText
            additionalStyles={[styles.text]}
            text={introText} />
        </View>
        <View style={styles.footerContainer}>
          <Button
            additionalStyles={[styles.button]}
            additionalTextStyles={[styles.buttonText]}
            handlePress={this.handlePress}
            text={'Get Started'} />
        </View>
      </Image>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    width: null,
    height: null,
  },
  logoContainer: {
    flex: 1,
    height: '30%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '15%'
  },
  logo: {
    width: '80%',
    height: '10%',
    resizeMode: 'contain',
  },
  subheader: {
    fontSize: 24,
    backgroundColor: 'transparent',
    color: 'white'
  },
  textContainer: {
    flex: 1,
    height: '30%',
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    width: '80%',
  },
  footerContainer: {
    flex: 1,
    height: '30%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: '10%',
  },
  button: {
    backgroundColor: 'white',
    width: '70%',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '$darkTeal',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 24,
    letterSpacing: 1
  }


})

export default Onboarding
