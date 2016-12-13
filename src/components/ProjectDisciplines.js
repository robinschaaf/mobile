import React from 'react'
import {
  Alert,
  Platform,
  PushNotificationIOS,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { addIndex, filter, map, propEq } from 'ramda'
import { connect } from 'react-redux'
import {GLOBALS} from '../constants/globals'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import Discipline from './Discipline'
import OverlaySpinner from './OverlaySpinner'
import { setState } from '../actions/index'

GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
GoogleAnalytics.trackEvent('view', 'Home')

const mapStateToProps = (state) => ({
  user: state.user,
  isGuestUser: state.user.isGuestUser,
  isConnected: state.isConnected,
  isFetching: state.isFetching,
  pushPrompted: state.user.pushPrompted
})

const mapDispatchToProps = (dispatch) => ({
  setSelectedProjectTag(tag) {
    dispatch(setState('selectedProjectTag', tag))
  },
  setPushPrompted(value) {
    dispatch(setState('user.pushPrompted', value))
    //This needs to also save to the store - once that PR is in!!!!!
  },
})

class ProjectDisciplines extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    if ((Platform.OS === 'ios') && (!this.props.pushPrompted)) {
      PushNotificationIOS.checkPermissions((permissions) => {
        if (permissions.alert === 0){
          Alert.alert(
            'Allow Notifications?',
            'Zooniverse would like to occasionally send you info about new projects or projects needing help.',
            [
              {text: 'Not Now', onPress: () => this.requestPermissions(false)},
              {text: 'Sure!', onPress: () => this.requestPermissions(true)},
            ]
          )
        }
      })
    }

  }

  requestPermissions(value) {
    if (value) {
      PushNotificationIOS.requestPermissions();
    }
    this.props.setPushPrompted(true)
  }


  render() {
    const renderDiscipline = ({value, label, color}, idx) => {
      return (
        <Discipline
          icon={value}
          title={label}
          tag={value}
          key={idx}
          color={color}
          setSelectedProjectTag={() => {this.props.setSelectedProjectTag(value)}} /> )
    }

    const DisciplineList =
      <ScrollView>
        {addIndex(map)(
          (discipline, idx) => { return renderDiscipline(discipline, idx) },
          filter(propEq('display', true), GLOBALS.DISCIPLINES)
        )}
      </ScrollView>

    const noConnection =
      <View style={styles.messageContainer}>
        <StyledText textStyle={'errorMessage'}
          text={'You must have an internet connection to use Zooniverse Mobile'} />
      </View>

    return (
      <View style={styles.container}>
        <View style={styles.subNavContainer}>
          <Text style={styles.userName}>
            { this.props.isGuestUser ? 'Guest User' : this.props.user.display_name }
          </Text>
        </View>
        <View style={styles.innerContainer}>
          { this.props.isConnected ? DisciplineList : noConnection }
        </View>
        { this.props.isFetching ? <OverlaySpinner /> : null }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  subNavContainer: {
    borderBottomColor: '$lightGrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 140,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 180
  },
  userName: {
    color: '$darkTextColor',
    fontSize: 14,
    fontWeight: 'bold'
  },
  signOut: {
    backgroundColor: '$transparent',
  },
  signOutText: {
    color: '$darkTextColor',
    fontSize: 11,
  },
  messageContainer: {
    padding: 15,
  },
  innerContainer: {
    flex: 1,
    marginTop: 10,
  }
});

ProjectDisciplines.propTypes = {
  user: React.PropTypes.object,
  isGuestUser: React.PropTypes.bool,
  isConnected: React.PropTypes.bool,
  isFetching: React.PropTypes.bool,
  pushPrompted: React.PropTypes.bool,
  setSelectedProjectTag: React.PropTypes.func,
  setPushPrompted: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
