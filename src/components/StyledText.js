import React from 'react'
import {
  Text
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const StyledText = (props) => {
  const textStyle = ( props.textStyle ? [styles.defaultText, styles[props.textStyle]] : styles.defaultText )

  return (
    <Text style={textStyle}>
      {props.text}
    </Text>
  )
}

const styles = EStyleSheet.create({
  defaultText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
  },
  headerText: {
    fontSize: 18,
    letterSpacing: 1.5,
    marginBottom: 5
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    lineHeight: 24
  },
  link: {
    color: '$headerColor'
  }
});

StyledText.propTypes = {
  text: React.PropTypes.string,
  textStyle: React.PropTypes.string,
}

export default StyledText
