import React, { Component } from 'react'
import {
  Alert,
  Linking,
  Platform,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from './StyledModal'
import StyledText from './StyledText'
import Button from './Button'
import { connect } from 'react-redux'
import { fetchProject } from '../actions/index'
import { MOBILE_PROJECTS } from '../constants/mobile_projects'
import { indexOf, isEmpty } from 'ramda'
import GoogleAnalytics from 'react-native-google-analytics-bridge'


var notificationTitle, notificationBody, projectID

const mapStateToProps = (state) => ({
  notificationProject: state.notificationProject,
  notificationPayload: state.notificationPayload
})

const mapDispatchToProps = (dispatch) => ({
  fetchProject(projectID) {
    dispatch(fetchProject(projectID))
  },
})

class NotificationModal extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      const notification = this.props.notificationPayload
      if (Platform.OS === 'ios'){
        if (notification._alert !== undefined) {
          notificationTitle = notification._alert.title
          notificationBody = notification._alert.body
          projectID = ( notification._data.data !== undefined ? notification._data.data.project_id : null)
        }
      } else {
        notificationTitle = notification.title
        notificationBody = notification.body
        projectID = notification.project_id
      }

      if (this.isMobileProject(projectID)) {
        this.props.fetchProject(projectID)
      }
    }
  }

  isMobileProject(projectID) {
    return indexOf(projectID, MOBILE_PROJECTS) >= 0
  }

  handleClick() {
    GoogleAnalytics.trackEvent('view from notification', this.props.notificationProject.display_name)

    const zurl=`http://zooniverse.org/projects/${this.props.notificationProject.slug}`
    Linking.canOpenURL(zurl).then(supported => {
      if (supported) {
        Linking.openURL(zurl);
      } else {
        Alert.alert(
          'Error',
          'Sorry, but it looks like you are unable to open the project in your default browser.',
        )
      }
    })
  }

  render() {
    const projectDisplay =
      <View style={styles.projectContainer}>
          <StyledText additionalStyles={[styles.subheader]} text={`About ${this.props.notificationProject.display_name}`} />
          <StyledText additionalStyles={[styles.smallText]}  text={this.props.notificationProject.description} />

          <View style={styles.container}>
            <Button
              handlePress={this.handleClick}
              text={'Visit this project'} />
          </View>
      </View>

    return (
      <StyledModal
        isVisible={this.props.isVisible}
        setVisibility={this.props.setVisibility}>

        <StyledText
          textStyle='largeBold'
          text={notificationTitle} />

        <View style={styles.container}>
          <StyledText
            text={notificationBody} />
        </View>

        { (isEmpty(this.props.notificationProject) || (isEmpty(projectID))) ? null : projectDisplay }

        <Button
          handlePress={() => this.props.setVisibility(false)}
          buttonStyle={'greyButton'}
          text={'Close'} />

      </StyledModal>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  projectContainer: {
    marginTop: 20,
  },
  subheader: {
    fontStyle: 'italic',
    fontSize: 16
  },
  smallText: {
    fontSize: 13,
    lineHeight: 20
  }
})

NotificationModal.propTypes = {
  notificationPayload: React.PropTypes.object,
  notificationProject: React.PropTypes.object,
  isVisible: React.PropTypes.bool,
  setVisibility: React.PropTypes.func,
  fetchProject: React.PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationModal)
