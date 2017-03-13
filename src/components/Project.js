import React, { Component } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'
import WorkflowPrompt from './WorkflowPrompt'
import StyledText from './StyledText'
import PopupMessage from './PopupMessage'
import { addIndex, filter, find, forEach, head, length, map, propEq } from 'ramda'
import { SWIPE_WORKFLOWS } from '../constants/mobile_projects'

const DEFAULT_BOX_HEIGHT = 269

class Project extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      popupVisibility: false,
      fadeAnim: new Animated.Value(0),
      showWorkflowPrompt: false,
      slideAnim: new Animated.Value(DEFAULT_BOX_HEIGHT),
      boxHeight: DEFAULT_BOX_HEIGHT,
      workflowSelectionHeight: 0,
    }
  }

  imageLoadEnd() {
    this.setState({ loading: false })
    Animated.timing(
      this.state.fadeAnim,
      { toValue: 1,
        duration: 200,
      },
    ).start();
  }

  animateHeight(toHeight) {
    Animated.timing(
      this.state.slideAnim,
      {
        toValue: toHeight,
        easing: Easing.linear,
        duration: 300,
        delay: 200,
      }
    ).start()
  }

  handlePress() {
    GoogleAnalytics.trackEvent('view', this.props.project.display_name)

    const hasSingleMobileWorkflow = length(this.props.mobileWorkflows) === 1
    const hasMixedWorkflows = length(this.props.mobileWorkflows) > 0 && length(this.props.nonMobileWorkflows) > 0
    //this.setState({ popupVisibility: false })

    if ((hasMixedWorkflows && this.props.promptForWorkflow)) {
      this.setState({showWorkflowPrompt: true})
    } else if (hasSingleMobileWorkflow) {
      Actions.Classify({ workflowID: head(this.props.mobileWorkflows).id })
    } else if (length(this.props.mobileWorkflows) > 0) {
      this.setState({ popupVisibility: true })
    } else {
      this.openExternalProject()
    }
  }

  openExternalProject() {
    if (this.props.project.redirect) {
      this.openURL(this.props.project.redirect)
    } else {
      Actions.ZooWebView({project: this.props.project})
    }
  }

  openURL(url){
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Sorry, but it looks like you are unable to open the project in your default browser.',
        )
      }
    })
  }

  openMobileProject(workflowID) {
    console.log('Setting selected workflow!! to workflowID:  ', workflowID)
    Actions.Classify({ workflowID: workflowID })
  }


  setHeight(event) {
    const {x, y, width, height} = event.nativeEvent.layout
    const newHeight = height + DEFAULT_BOX_HEIGHT
    this.setState({ boxHeight: newHeight, workflowSelectionHeight: height })
    console.log('new height', newHeight)
    this.animateHeight(newHeight)
  }

  render() {
    //console.log('this.state.showWorkflowPrompt', this.state.showWorkflowPrompt)
    //console.log('length of swipe workflows', length(this.props.mobileWorkflows))
    const projectID = this.props.project.id
    const swipeProject = find(propEq('projectID', projectID), SWIPE_WORKFLOWS)

    const avatar =
      <Image source={{uri: `https://${this.props.project.avatar_src}`}} style={[styles.avatar, { height: this.state.boxHeight-25 }]} onLoadEnd={ ()=>{ this.imageLoadEnd() } } />

    const defaultAvatar =
      <Image source={require('../../images/teal-wallpaper.png')} style={[styles.avatar, styles.defaultAvatar, { height: this.state.boxHeight-25 }]} onLoadEnd={ ()=>{ this.imageLoadEnd() } } />

    const mobileIcon =
      <Image source={require('../../images/mobile-friendly.png')} style={styles.mobileIcon} resizeMode={'cover'} />

    const workflowPrompt =
      <WorkflowPrompt
        project={this.props.project}
        mobileWorkflows={this.props.mobileWorkflows}
        nonMobileWorkflows={this.props.nonMobileWorkflows}
        openMobileProject={this.openMobileProject}
        openExternalProject={() => this.openExternalProject()}
        isVisible={this.state.showWorkflowPrompt}
        hideWorkflowPrompt={() => {this.setState({showWorkflowPrompt: false})}}
        />

    const mobileWorkflows = (workflow, idx) =>
      <TouchableOpacity
        key={idx}
        style={styles.workflowRow}
        onPress={() => this.openMobileProject(workflow.id)}>
        <StyledText text={workflow.display_name} />
        <View style={[styles.workflowIconContainer, { backgroundColor: this.props.color }]}>
          <Icon name="angle-right" style={styles.workflowIcon} />
        </View>
      </TouchableOpacity>

    const mobileWorkflowContainer =
      <View style={styles.mobileWorkflowContainer}  onLayout={(event) => { this.setHeight(event) }}>
        { addIndex(map)(
          (workflow, idx) => {
            return mobileWorkflows(workflow, idx)
          }, this.props.mobileWorkflows
        ) }
      </View>

    const rightArrow =
      <View style={[styles.iconContainer, { backgroundColor: this.props.color }]}>
        <Icon name="angle-right" style={styles.icon} />
      </View>

    const emptyRightArrow =
      <View style={[styles.iconContainer]} />


    return (
      <Animated.View style={{ opacity: this.state.fadeAnim, height: this.state.slideAnim }}>
        {this.state.showWorkflowPrompt ? workflowPrompt : null }
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={(e) => this.handlePress(e) }
          style={[styles.container, { height: this.state.boxHeight-25 }]}>
          { this.props.project.avatar_src ? avatar : defaultAvatar }
          <View style={styles.forBorderRadius} />
          <View style={styles.whiteContainer}>
            <View style={styles.textContainer}>
              {swipeProject ? mobileIcon : null}
              <View style={styles.titleContainer}>
                <View style={styles.titleIconContainer}>
                  <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>
                    {this.props.project.display_name}
                  </Text>
                </View>
                <Text style={styles.description} numberOfLines={2} ellipsizeMode={'tail'}>{this.props.project.description}</Text>
              </View>
              { length(this.props.mobileWorkflows) > 1 ? emptyRightArrow : rightArrow}
            </View>

            { length(this.props.mobileWorkflows) > 1 ? mobileWorkflowContainer : null}
          </View>

          <PopupMessage
            key={this.props.project.id}
            isVisible={this.state.popupVisibility}
            setHidden={() => {this.setState({popupVisibility: false})}}
            workflowSelectionHeight={this.state.workflowSelectionHeight}
          />

        </TouchableOpacity>
      </Animated.View>
    )
  }
}

const styles = EStyleSheet.create({
  $titleHeight: 88,
  $borderRadius: 5,
  $iconSize: 40,
  $workflowIconSize: 30,
  $sidePadding: 15,
  $totalSidePadding: '$sidePadding * 2',
  $subtractTextWidth: '88 + $iconSize',
  container: {
    marginHorizontal: 10,
    marginBottom: 25,
  },
  forBorderRadius: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '$titleHeight',
    backgroundColor: '$lightGreyBackground'
  },
  avatar: {
    borderRadius: '$borderRadius',
    borderWidth: 1,
    borderColor: '$greyBorder',
    flex: 1,
    resizeMode: 'cover'
  },
  defaultAvatar: {
    height: null,
    width: null,
  },
  whiteContainer: {
    position: 'absolute',
    bottom: 0,
    borderBottomLeftRadius: '$borderRadius',
    borderBottomRightRadius: '$borderRadius',
    borderWidth: 1,
    borderColor: '$greyBorder',
    borderTopColor: 'transparent',
    backgroundColor: 'white',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    height: '$titleHeight',
    width: '100% - 17'
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
  },
  titleIconContainer: {
    flexDirection: 'row',
  },
  mobileWorkflowContainer: {
  },
  workflowRow: {
    borderTopColor: '$greyBorder',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  workflowIconContainer: {
    borderRadius: '0.5 * $workflowIconSize',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '$workflowIconSize',
    height: '$workflowIconSize'
  },
  workflowIcon: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 24,
    lineHeight: 28,
    paddingLeft: 4
  },
  mobileIcon: {
    height: 52,
    width: 31,
    marginRight: 10
  }
});

Project.propTypes = {
  project: React.PropTypes.object.isRequired,
  color:  React.PropTypes.string.isRequired,
  mobileWorkflows: React.PropTypes.array,
  nonMobileWorkflows: React.PropTypes.array,
  promptForWorkflow: React.PropTypes.bool
}

Project.defaultProps = {
  mobileWorkflows: [],
  nonMobileWorkflows: []
}

export default Project
