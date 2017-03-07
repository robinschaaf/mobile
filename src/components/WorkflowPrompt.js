import React from 'react'
import {
  Text,
  TouchableOpacity
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledModal from './StyledModal'
import { append } from 'ramda'

const WorkflowPrompt = (props) => {
  return (
    <StyledModal
      isVisible={props.isVisible}
      setVisibility={this.setVisibility}>
      Here is the workflow prompt
    </StyledModal>
  )
}

const styles = EStyleSheet.create({
  buttonText: {
    fontSize: 14,
    color: 'white',
    alignSelf: 'center',
    letterSpacing: 1.3
  },
  button: {
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    backgroundColor: '$buttonColor',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginTop: 10
  },
  disabledButton: {
    backgroundColor: '$disabledButtonColor'
  },
  registerButton: {
    backgroundColor: '$registerButtonColor'
  },
  disabledRegisterButton: {
    backgroundColor: '$registerDisabledButtonColor'
  },
  navyButton: {
    backgroundColor: '$navy',
  },
});

WorkflowPrompt.propTypes = {
  handlePress: React.PropTypes.func.isRequired,
  disabled: React.PropTypes.bool,
  buttonStyle: React.PropTypes.string,
  additionalStyles: React.PropTypes.array,
  additionalTextStyles: React.PropTypes.array,
  text: React.PropTypes.string
}

export default WorkflowPrompt
