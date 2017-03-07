import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Checkbox from './Checkbox'
import StyledText from './StyledText'
import { addIndex, map } from 'ramda'

const UnlinkedTask = (props) => {

  console.log('UnlinkedTaskProp annotation', props.annotation)

  const renderUnlinkedTask = ( answer, idx ) => {
    return (
      <View key={ idx } style={styles.rowContainer}>
        <Checkbox
          additionalStyles={[styles.checkboxStyle]}
          selected={idx === props.annotation}
          onSelect={()=>props.onAnswered(props.unlinkedTaskKey, idx)} />
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
  checkboxStyle: {
    padding: 5
  }
});

UnlinkedTask.propTypes = {
  unlinkedTask: React.PropTypes.object.isRequired,
  onAnswered: React.PropTypes.func.isRequired,
  annotation: React.PropTypes.number,
  unlinkedTaskKey: React.PropTypes.string.isRequired,
}

export default UnlinkedTask
