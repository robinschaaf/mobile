import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledMarkdown from './StyledMarkdown'
import StyledText from './StyledText'
import SizedImage from './SizedImage'
import Button from './Button'
import Icon from 'react-native-vector-icons/FontAwesome'
import { addIndex, isEmpty, map } from 'ramda'

const MAX_HEIGHT = Dimensions.get('window').height * .6

export class FieldGuide extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      selectedItem: {},
      slideAnim: new Animated.Value(0),
    }
  }

  open() {
    this.setState({isVisible: true})
    this.state.slideAnim.setValue(0)
    this.animateHeight(150)
  }

  close() {
    this.animateHeight(0, 200)
    this.setState({isVisible: false, selectedItem: {}})
  }

  openDetail(item) {
    this.setState({selectedItem: item})
    this.animateHeight(150)
  }

  closeDetail() {
    this.setState({selectedItem: {}})
    this.animateHeight(150)
  }

  animateHeight(toHeight, duration=300) {
    Animated.timing(
      this.state.slideAnim,
      {
        toValue: toHeight,
        easing: Easing.linear,
        duration: duration,
      }
    ).start()
  }

  setHeight(event) {
    const {x, y, width, height} = event.nativeEvent.layout
    this.animateHeight(height)
  }

  render() {
    const { items, icons } = this.props.guide
    const fieldGuideButton =
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => this.open()}
          activeOpacity={0.5}
          style={ styles.button }>
          <Icon name='map-o' style={styles.icon} />
          <StyledText additionalStyles={[styles.text]} text={ 'FIELD GUIDE' } />
        </TouchableOpacity>
      </View>

    const closeIcon =
      <Animated.View style={[styles.close, {paddingBottom: this.state.slideAnim}]}>
        <TouchableOpacity
          onPress={() => this.close()}
          activeOpacity={0.5}>
          <Icon name='times-circle-o' style={styles.closeIcon} />
        </TouchableOpacity>
      </Animated.View>


    const fieldGuide = () => {
      return (
        <View>
          <Animated.View style={[styles.guideContainer, {height: this.state.slideAnim}]}>
            <ScrollView>
              <View onLayout={(event) => { this.setHeight(event) }}>
                { addIndex (map)(
                  (item, idx) => {
                    return renderItem(item, icons, idx)
                  },
                  items
                ) }
              </View>
            </ScrollView>
          </Animated.View>
          { closeIcon }
        </View>
      )
    }

    const renderItem = (item = {}, icons = [], idx) => {
      return (
        <TouchableOpacity
          onPress={() => this.openDetail(item)}
          key={idx}
          style={styles.listItem}>
          { icons[item.icon] !== undefined && icons[item.icon].src ? <Image style={styles.itemIcon} source={{uri:icons[item.icon].src}} /> : null }
          <StyledMarkdown markdown={item.title} />
        </TouchableOpacity>
      )
    }

    const itemDetail = () => {
      const item = this.state.selectedItem
      return (
        <View>
          <Animated.View style={[styles.guideContainer, {height: this.state.slideAnim}]}>
              <ScrollView style={styles.itemDetailContainer} onLayout={(event) => { this.setHeight(event) }}>
                { icons[item.icon].src
                  ? <SizedImage source={{ uri: icons[item.icon].src }} maxHeight={ 150 } />
                  : null
                }
                <StyledText textStyle={'large'} text={ item.title } />
                <StyledMarkdown markdown={item.content} />


                <Button
                  handlePress={ () => this.closeDetail() }
                  additionalStyles={[styles.backButton]}
                  text={'< Back'} />
            </ScrollView>
          </Animated.View>
          { closeIcon }
        </View>
      )


    }

    const itemDetailOrList = isEmpty(this.state.selectedItem) ? fieldGuide() : itemDetail()
    return (
      <View style={styles.container}>
        { this.state.isVisible ? itemDetailOrList : fieldGuideButton }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  $iconSize: 50,
  $bottomHeight: 40,
  $containerHeight: 150,
  icon: {
    fontSize: 12,
    color: 'white',
    marginRight: 10,
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  guideContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    maxHeight: MAX_HEIGHT,
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      height: 1
    },
  },
  itemDetailContainer: {
    maxHeight: MAX_HEIGHT,
    padding: 10,
  },
  itemDetailsIcon: {
    width: '20%',
    marginRight: 10,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$mediumGrey',
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  itemIcon: {
    width: '$iconSize',
    height: '$iconSize',
    borderRadius: '0.5 * $iconSize',
    marginRight: 10,
  },
  close: {
    position: 'absolute',
    bottom: -30,
    right: 0,
    backgroundColor: 'transparent',
  },
  closeIcon: {
    fontSize: 30,
    color: '$greyTextColor',
    padding: 13
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '$buttonColor',
    height: 32,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  }
})

FieldGuide.propTypes = {
  guide: React.PropTypes.object,
}

FieldGuide.defaultProps = {
  guide: {
    items: [],
    icons: {}
  }
}

export default FieldGuide
