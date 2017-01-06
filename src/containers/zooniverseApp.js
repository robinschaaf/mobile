import React, {Component} from 'react'
import {
  Image,
  Platform,
  PushNotificationIOS,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import LaunchScreen from '../components/Launch'
import ProjectDisciplines from '../components/ProjectDisciplines'
import NotificationModal from '../components/NotificationModal'
import NavBar from '../components/NavBar'
import { connect } from 'react-redux'
import { setState, syncInterestSubscriptions } from '../actions/index'
import { isEmpty, pathOr } from 'ramda'
import FCM from 'react-native-fcm'

const mapStateToProps = (state) => ({
  user: state.user,
  isFetching: state.isFetching,
  isConnected: state.isConnected,
  isModalVisible: state.isModalVisible || false,
  notificationPayload: state.notificationPayload || {}
})

const mapDispatchToProps = (dispatch) => ({
  setModalVisibility(value) {
    dispatch(setState('isModalVisible', value))
  },
  setNotificationPayload(value) {
    dispatch(setState('notificationPayload', value))
  },
  syncInterestSubscriptions() {
    dispatch(syncInterestSubscriptions())
  },
})

class ZooniverseApp extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('notification', this.onRemoteNotification)
      PushNotificationIOS.addEventListener('register', this.onPushRegistration)
    } else {
      FCM.on('notification', this.onRemoteNotification)
    }
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this.onRemoteNotificationIOS)
    PushNotificationIOS.removeEventListener('register', this.onPushRegistration)
  }

  onRemoteNotification = (notification) => {
    var isTokenValidation = pathOr(false, ['_data', 'pusher_token_validation'], notification)

    if (!isTokenValidation) {
      this.props.setNotificationPayload(notification)
      this.props.setModalVisibility(true)
    }
  }

  onPushRegistration = () => {
    this.props.syncInterestSubscriptions()
  }

  static renderNavigationBar() {
    return <NavBar showAvatar={true} />;
  }

  //{ isEmpty(this.props.user) ? <LaunchScreen /> : <ProjectDisciplines /> }
  render() {
    return (
      <View style={styles.container}>
        { isEmpty(this.props.user) ? <LaunchScreen /> : <ProjectDisciplines /> }
        <NotificationModal
          isVisible={this.props.isModalVisible}
          setVisibility={this.props.setModalVisibility}/>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    width: 375,
    height: 667,
  },
});

ZooniverseApp.propTypes = {
  user: React.PropTypes.object,
  isFetching: React.PropTypes.bool.isRequired,
  isConnected: React.PropTypes.bool,
  isModalVisible: React.PropTypes.bool,
  setModalVisibility: React.PropTypes.func,
  setNotificationPayload: React.PropTypes.func,
  syncInterestSubscriptions: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ZooniverseApp)
