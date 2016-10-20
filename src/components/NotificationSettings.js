import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Switch,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import theme from '../theme'
import StyledText from './StyledText'
import NavBar from './NavBar'
import OverlaySpinner from './OverlaySpinner'
import ProjectNotification from './ProjectNotification'
import { connect } from 'react-redux'
import { loadNotificationSettings, updateUser } from '../actions/index'
import { addIndex, keys, map } from 'ramda'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Notification Settings')

const mapStateToProps = (state) => ({
  user: state.user,
  userPreferences: state.userPreferences,
  isConnected: state.isConnected,
  isFetching: state.isFetching,
  errorMessage: state.errorMessage
})

const mapDispatchToProps = (dispatch) => ({
  loadNotificationSettings() {
    dispatch(loadNotificationSettings())
  },
  updateGlobalNotification(checked) {
    dispatch(updateUser('global_email_communication', checked))
  },
})

class NotificationSettings extends React.Component {
  componentDidMount() {
    this.props.loadNotificationSettings()
  }

  static renderNavigationBar() {
    return <NavBar title={"Notification Settings"} showBack={true} />;
  }

  render() {
    const renderPreference = (id, idx) => {
      return (
        <ProjectNotification
          id={id}
          key={idx} /> )
    }

    const projectNotificationsList =
      <View>
        <StyledText textStyle={'subHeaderText'}
          text={'Project-specific Notifications'} />

        {addIndex(map)(
            (key, idx) => { return renderPreference(key, idx) },
            keys(this.props.userPreferences)
        )}
      </View>

    const preferencesScrollView =
      <ScrollView>
        <StyledText
          text={"Zooniverse would like to occassionally send you updates about new projects or projects needing help."} />
        <View style={styles.switchContainer}>
          <Switch
            value={this.props.user.global_email_communication}
            style={styles.switch}
            onTintColor={theme.headerColor}
            onValueChange={(checked) => this.props.updateGlobalNotification(checked)}
          />
          <StyledText text="General Zooniverse notifications" />
        </View>

        { this.props.userPreferences ? projectNotificationsList : null }
      </ScrollView>

    const noConnection =
      <View style={styles.messageContainer}>
        <StyledText textStyle={'errorMessage'}
          text={'You must have an internet connection to use Zooniverse Mobile'} />
      </View>

    return (
      <View style={styles.container}>
        { this.props.isConnected ? null : noConnection }
        <StyledText textStyle={'errorMessage'} text={this.props.errorMessage} />
        { this.props.isFetching ? <OverlaySpinner /> : preferencesScrollView }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingLeft: 10,
    paddingRight: 10
  },
  messageContainer: {
    padding: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingBottom: 16,
    paddingTop: 16,
    alignItems: 'center',
    borderBottomColor: '$lightGrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switch: {
    marginRight: 10,
  },
});

NotificationSettings.propTypes = {
  user: React.PropTypes.object,
  userPreferences: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  isConnected: React.PropTypes.bool,
  errorMessage: React.PropTypes.string,
  loadNotificationSettings: React.PropTypes.func,
  updateGlobalNotification: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationSettings)
