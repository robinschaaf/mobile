import React from 'react'
import {
  Alert,
  Platform,
  PushNotificationIOS,
  ScrollView,
  StyleSheet,
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

const topPadding = (Platform.OS === 'ios') ? 10 : 0

const mapStateToProps = (state) => ({
  user: state.user,
  isGuestUser: state.user.isGuestUser,
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

  componentDidMount() {
    if ((Platform.OS === 'ios') && (!this.props.pushPrompted)) {
      this.promptRequestPermissions()
    }
  }

  promptRequestPermissions() {
    PushNotificationIOS.checkPermissions((permissions) => {
      if (permissions.alert === 0){
        Alert.alert(
          'Allow Notifications?',
          'Zooniverse would like to occasionally send you info about new projects or projects needing help.',
          [
            {text: 'Not Now', onPress: () => this.requestIOSPermissions(false)},
            {text: 'Sure!', onPress: () => this.requestIOSPermissions(true)},
          ]
        )
      }
    })
  }

  requestIOSPermissions(accepted) {
    if (accepted) {
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

    const recent =
      <Discipline
        faIcon={'undo'}
        title={'Recent'}
        tag={'recent'}
        color={'rgba(0, 151, 157, 1)'}
        setSelectedProjectTag={() => {this.props.setSelectedProjectTag('recent')}} />

    const DisciplineList =
      <ScrollView>
        { this.props.isGuestUser ? null : recent }
        {addIndex(map)(
          (discipline, idx) => { return renderDiscipline(discipline, idx) },
          filter(propEq('display', true), GLOBALS.DISCIPLINES)
        )}
      </ScrollView>

    const totalClassifications =
      <StyledText
        text={`${this.props.user.totalClassifications} total classifications`} />

    return (
      <View style={styles.container}>
        <View style={styles.subNavContainer}>
          <StyledText textStyle={'bold'}
            text = { this.props.isGuestUser ? 'Guest User' : this.props.user.display_name } />
          { this.props.user.totalClassifications > 0
            ? totalClassifications
            : null }
        </View>
        <View style={styles.innerContainer}>
          { DisciplineList }
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
    paddingTop: 136 + topPadding,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 184 + topPadding
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
  isFetching: React.PropTypes.bool,
  pushPrompted: React.PropTypes.bool,
  setPushPrompted: React.PropTypes.func,
  setSelectedProjectTag: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
