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
  userPreference: state.userPreferences[ownProps.id]
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProjectNotification(checked) {
    dispatch(updateProjectNotification(ownProps.id, checked))
  },
})

class ProjectNotification extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Switch
          value={this.props.userPreference.notify}
          style={styles.switch}
          onTintColor={theme.headerColor}
          onValueChange={(checked) => this.props.updateProjectNotification(checked)}
        />

        <StyledText text={this.props.userPreference.name} />
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
  userPreference: React.PropTypes.object.isRequired,
  updateProjectNotification: React.PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNotification)
