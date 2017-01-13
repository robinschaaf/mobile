import React, { Component } from 'react'
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Spinner from 'react-native-loading-spinner-overlay'
import { connect } from 'react-redux'


const mapStateToProps = (state) => ({
  isFetching: state.isFetching,
  loadingText: state.loadingText || 'Loading...'
})

class OverlaySpinner extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Spinner visible={this.props.isFetching} textContent={this.props.loadingText} textStyle={styles.text} />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: '$transluscentWhite',
    fontSize: 14,
    fontFamily: 'OpenSans',
  }

})

OverlaySpinner.propTypes = {
  isFetching: React.PropTypes.bool,
  loadingText: React.PropTypes.string,
}

export default connect(mapStateToProps)(OverlaySpinner)
