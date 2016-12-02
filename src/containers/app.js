import React, {Component} from 'react'
import {
  AppState,
  NetInfo,
  Platform,
  PushNotificationIOS
} from 'react-native'
import FCM from 'react-native-fcm'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import thunkMiddleware from 'redux-thunk'
import {Scene, Router} from 'react-native-router-flux'
import { setIsConnected, setUserFromStore, fetchProjects, goToProject } from '../actions/index'
import { MOBILE_PROJECTS } from '../constants/mobile_projects'
import { indexOf } from 'ramda'

import ZooniverseApp from './zooniverseApp'
import ProjectList from '../components/ProjectList'
import ProjectDisciplines from '../components/ProjectDisciplines'
import About from '../components/About'
import PublicationList from '../components/PublicationList'
import SignIn from '../components/SignIn'
import SideDrawer from '../components/SideDrawer'

const store = compose(applyMiddleware(thunkMiddleware))(createStore)(reducer)

export default class App extends Component {
  componentDidMount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('notification', this.onRemoteNotificationIOS)
    } else {
      FCM.on('notification', this.onRemoteNotificationAndroid)
    }

    const dispatchConnected = isConnected => store.dispatch(setIsConnected(isConnected))

    NetInfo.isConnected.fetch().then(isConnected => {
      store.dispatch(setIsConnected(isConnected))
      NetInfo.isConnected.addEventListener('change', dispatchConnected)
    })

    store.dispatch(fetchProjects())
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this.onRemoteNotificationIOS);
  }

  onRemoteNotificationIOS = (notification) => {
    var projectID = ( notification._data.data !== undefined ? notification._data.data.project_id : null)
    if (this.isMobileProject(projectID)) {
      if (AppState.currentState !== 'active') {
        store.dispatch(goToProject(projectID))
      }
    }
  }

  onRemoteNotificationAndroid = (notification) => {
    var projectID = notification.project_id
    if (this.isMobileProject(projectID)) {
      store.dispatch(goToProject(projectID))
    }
  }

  isMobileProject(projectID) {
    return indexOf(projectID, MOBILE_PROJECTS) >= 0
  }

  render() {
    store.dispatch(setUserFromStore())
    return (
      <Provider store={store}>
        <Router ref="router">
          <Scene ref="drawer" key="drawer" component={SideDrawer} open={false}>
            <Scene key="main" tabs={false} >
              <Scene key="SignIn" hideNavBar={true} component={SignIn} type="reset" />
              <Scene key="ZooniverseApp" component={ZooniverseApp} initial />
              <Scene key="ProjectDisciplines" component={ProjectDisciplines} />
              <Scene key="About" component={About} />
              <Scene key="Publications" component={PublicationList} />
              <Scene key="ProjectList" component={ProjectList} />
            </Scene>
          </Scene>
        </Router>
      </Provider>
    );
  }
}
