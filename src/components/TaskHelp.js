import React, { Component } from 'react'
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from './StyledModal'
import StyledMarkdown from './StyledMarkdown'
import Button from './Button'
import Icon from 'react-native-vector-icons/FontAwesome'


export class TaskHelp extends Component {
  constructor(props) {
    super(props)
    this.setVisibility = this.setVisibility.bind(this)
    this.state = {
      isVisible: false
    }
  }

  setVisibility(isVisible) {
    this.setState({isVisible})
  }

  render() {
    return (
      <View>
        <Icon name='question-circle'
          style={styles.helpIcon}
          onPress={() => this.setVisibility(true)} />
        <StyledModal
          isVisible={this.state.isVisible}
          setVisibility={this.setVisibility}>

          <View style={styles.container}>
            <StyledMarkdown markdown={this.props.text} />
          </View>

          <Button
            handlePress={() => this.setVisibility(false)}
            buttonStyle={'navyButton'}
            text={'Close'} />

        </StyledModal>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  helpIcon: {
    fontSize: 20,
    color: 'black',
    padding: 13
  },
  helpText: {
    color: 'black'
  }
})

TaskHelp.propTypes = {
  text: React.PropTypes.string,
}

export default TaskHelp
