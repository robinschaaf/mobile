import React, { Component } from 'react';
import {
  Switch,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import theme from '../theme'
import StyledText from './StyledText'
import { connect } from 'react-redux'
import { updateProjectNotification } from '../actions/index'

const mapStateToProps = (state, ownProps) => ({
  userProject: state.user.projects[ownProps.id]
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProjectNotification(preferenceID, checked) {
    console.log('>>>>preferenceID:', preferenceID)
    dispatch(updateProjectNotification(ownProps.id, preferenceID, checked))
  },
})

class ProjectNotification extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Switch
          value={this.props.userProject.notify}
          style={styles.switch}
          onTintColor={theme.headerColor}
          onValueChange={(checked) => this.props.updateProjectNotification(this.props.userProject.preferenceID, checked)}
        />

        <StyledText text={this.props.userProject.name} />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center'
  },
  switch: {
    marginRight: 10
  },
});

ProjectNotification.propTypes = {
  id: React.PropTypes.string.isRequired,
  userProject: React.PropTypes.object.isRequired,
  updateProjectNotification: React.PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNotification)
