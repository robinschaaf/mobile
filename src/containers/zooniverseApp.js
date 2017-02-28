import React, {Component} from 'react'
import {
  Platform,
  PushNotificationIOS,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import ProjectDisciplines from '../components/ProjectDisciplines'
import NotificationModal from '../components/NotificationModal'
import LaunchScreen from '../components/Launch'
import NavBar from '../components/NavBar'
import { connect } from 'react-redux'
import { setState } from '../actions/index'
import { isEmpty } from 'ramda'
import FCM from 'react-native-fcm'
import { setDimensions } from '../actions/device'

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
  updateDimensions() {
    dispatch(setDimensions())
  },
})

class ZooniverseApp extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.updateDimensions()

    if (Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('notification', this.onRemoteNotification)
    } else {
      FCM.on('notification', this.onRemoteNotification)
    }
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this.onRemoteNotificationIOS);
  }

  onRemoteNotification = (notification) => {
    this.props.setNotificationPayload(notification)
    this.props.setModalVisibility(true)
  }

  onLayout = () => this.props.updateDimensions()

  static renderNavigationBar() {
    return <NavBar showAvatar={true} />;
  }

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
});

ZooniverseApp.propTypes = {
  user: React.PropTypes.object,
  isFetching: React.PropTypes.bool.isRequired,
  isConnected: React.PropTypes.bool,
  isModalVisible: React.PropTypes.bool,
  setModalVisibility: React.PropTypes.func,
  setNotificationPayload: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ZooniverseApp)
