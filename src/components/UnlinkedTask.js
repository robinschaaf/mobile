import React from 'react'
import {
  Switch,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { addIndex, map } from 'ramda'
import theme from '../theme'

const UnlinkedTask = (props) => {
  const renderUnlinkedTask = ( answer, idx ) => {
    return (
      <View key={ idx } style={styles.rowContainer}>
        <Switch
          value={idx === props.annotation}
          style={styles.switchComponent}
          onTintColor={theme.headerColor}
          onValueChange={()=>props.onAnswered(props.unlinkedTaskKey, idx)}
        />
        <TouchableOpacity
          onPress={ ()=>props.onAnswered(props.unlinkedTaskKey, idx) }
          activeOpacity={0.5}>
          <StyledText additionalStyles={[styles.buttonText]} text={ answer.label } />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      { addIndex(map)(
        (answer, idx) => {
          return renderUnlinkedTask(answer, idx)
        },
        props.unlinkedTask.answers
      ) }
    </View>
  )
}

const styles = EStyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  switchComponent: {
    margin: 3
  }
});

UnlinkedTask.propTypes = {
  unlinkedTask: React.PropTypes.object.isRequired,
  onAnswered: React.PropTypes.func.isRequired,
  annotation: React.PropTypes.number,
  unlinkedTaskKey: React.PropTypes.string.isRequired,
}

export default UnlinkedTask
