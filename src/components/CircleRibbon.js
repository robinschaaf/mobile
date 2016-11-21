import React, { Component } from 'react';
import {
  View
} from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import EStyleSheet from 'react-native-extended-stylesheet'

const size = 120
const position = size / 2
const width = 10
const radius = position - width

class CircleRibbon extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Svg height={size} width={size}>
          <Circle
            cx={position}
            cy={position}
            r={radius}
            stroke='blue'
            strokeWidth={width}
            fill='transparent' />
          <Path
            d='M60,10 A 50 50 0 0 1 110 60'
            stroke='hsl(22, 82%, 50%)'
            strokeWidth='10'
            fill='transparent' />

        </Svg>
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

CircleRibbon.propTypes = {
  avatar: React.PropTypes.string
}

export default CircleRibbon
