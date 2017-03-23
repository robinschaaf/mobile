import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
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
const MIN_HEIGHT = 33
const ITEM_ICON_HEIGHT = 100

export class FieldGuide extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedItem: {},
      heightAnim: new Animated.Value(0),
      height: 0,
      markdownHeight: 0
    }
  }

  componentWillMount() {
     this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        this.state.heightAnim.setOffset(this.state.heightAnim._value);
        this.state.heightAnim.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
        const newVal = gestureState.dy * -1

        Animated.event([
            null, {dy: this.state.heightAnim}
        ])(e, { dy: newVal });


      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: () => {
        this.state.heightAnim.flattenOffset();

        if (this.state.heightAnim._value < 20) {
          this.close()
        } else if (this.state.heightAnim._value < MIN_HEIGHT) {
          Animated.timing(this.state.heightAnim, {
            toValue: MIN_HEIGHT,
            easing: Easing.out(Easing.ease),
            duration: 100
          }).start()
        } else if (this.state.heightAnim._value > this.state.height) {
          Animated.timing(this.state.heightAnim, {
            toValue: this.state.height,
            easing: Easing.out(Easing.ease),
            duration: 100
          }).start()
        }
      },
    })
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.isVisible === true){
      this.open()
    }
  }

  open() {
    this.state.heightAnim.setValue(0)
    this.animateHeight(150)
  }

  close() {
    this.animateHeight(0, 200)
    setTimeout(()=> {
      this.setState({selectedItem: {}, markdownHeight: 0})
      this.props.onClose()
    }, 200)

  }

  openDetail(item) {
    this.setState({selectedItem: item})
    this.animateHeight(150)
  }

  closeDetail() {
    this.setState({selectedItem: {}, markdownHeight: 0})
    this.animateHeight(150)
  }

  animateHeight(toHeight, duration=300) {
    Animated.timing(
      this.state.heightAnim,
      {
        toValue: toHeight,
        easing: Easing.linear,
        duration: duration,
      }
    ).start()
  }

  setHeight(height) {
    const newHeight = height + this.state.markdownHeight
    this.setState({height: newHeight})

    this.animateHeight(newHeight < MAX_HEIGHT ? newHeight : MAX_HEIGHT)
  }

  render() {
    const { items, icons } = this.props.guide
    const fieldGuideButton =
    <TouchableOpacity
      onPress={() => this.open()}
      activeOpacity={0.5}
      style={ styles.button }>
      <Icon name='map-o' style={styles.icon} />
      <StyledText additionalStyles={[styles.buttonText]} text={ 'Field Guide' } />
    </TouchableOpacity>

    const closeIcon =
      <Animated.View style={[styles.close, {paddingBottom: this.state.heightAnim}]}>
        <TouchableOpacity
          onPress={() => this.close()}
          activeOpacity={0.5}
          style={styles.bigCircleIcon}>
          <Icon name='chevron-down' style={styles.closeIcon} />
        </TouchableOpacity>
      </Animated.View>

    const backIcon =
      <Animated.View style={[styles.back, {paddingBottom: this.state.heightAnim}]}>
        <TouchableOpacity
          onPress={ () => this.closeDetail() }
          activeOpacity={0.5}
          style={styles.bigCircleIcon}>
          <Icon name='chevron-left' style={styles.closeIcon} />
        </TouchableOpacity>
      </Animated.View>


    const dragBar =
      <Animated.View
         style={[styles.dragBarContainer, {bottom: this.state.heightAnim}]}
         hitSlop={{top: 10, bottom: 10, left: 0, right: 0}}
        {...this._panResponder.panHandlers}>
        <View style={styles.dragBar} />
        <View style={styles.dragBarLineAbsoluteContainer}>
          <View style={styles.dragBarLineContainer}>
            <View style={styles.dragBarLine} />
            <View style={styles.dragBarLine} />
          </View>
        </View>
      </Animated.View>

    const fieldGuide = () => {
      return (
        <View style={styles.container}>
          <Animated.View style={[styles.guideContainer, {height: this.state.heightAnim}]}>
            <ScrollView>
              <View onLayout={(event) => { this.setHeight(event.nativeEvent.layout.height) }}>
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
          { dragBar }
        </View>
      )
    }

    const renderItem = (item = {}, icons = [], idx) => {
      const extraCSS = 'p { height: 50px; display: table-cell; vertical-align: middle; }'
      return (
        <TouchableOpacity
          onPress={() => this.openDetail(item)}
          key={idx}
          style={styles.listItem}>
          { icons[item.icon] !== undefined && icons[item.icon].src ? <Image style={styles.itemIcon} source={{uri:icons[item.icon].src}} /> : null }
          <StyledMarkdown markdown={item.title} extraCSS={extraCSS} />
        </TouchableOpacity>
      )
    }

    const itemDetail = () => {
      const item = this.state.selectedItem
      return (
        <View style={styles.container}>
          <Animated.View style={[styles.guideContainer, {height: this.state.heightAnim}]}>
              <ScrollView style={styles.itemDetailContainer}>
                <View onLayout={(event) => { this.setState({ markdownHeight: event.nativeEvent.layout.height + 70 }) }}>
                  { icons[item.icon].src
                    ? <SizedImage
                        source={{ uri: icons[item.icon].src }}
                        maxHeight={ ITEM_ICON_HEIGHT }
                        additionalStyles = {[styles.itemDetailIcon]}
                      />
                    : null
                  }
                  <StyledText additionalStyles={[styles.itemTitle]} text={ item.title } />
                </View>
                <StyledMarkdown
                  markdown={item.content}
                  onResize={ (newHeight) => this.setHeight(newHeight) }
                />

                <Button
                  handlePress={ () => this.closeDetail() }
                  additionalStyles={[styles.backButton]}
                  text={'< Back'} />
            </ScrollView>
          </Animated.View>
          { backIcon }
          { dragBar }
          { closeIcon }
        </View>
      )


    }

    return (
      isEmpty(this.state.selectedItem) ? fieldGuide() : itemDetail()
    )
  }
}

const styles = EStyleSheet.create({
  $iconSize: 50,
  $bottomHeight: 40,
  $containerHeight: 150,
  icon: {
    fontSize: 16,
    color: '$beckyDarkGray',
    padding: 3,
    marginRight: 5
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
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      height: 1
    },
  },
  dragBarContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    height: 18
  },
  dragBar: {
    height: 12,
    backgroundColor: '#B3B1B3',
  },
  dragBarLineAbsoluteContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  dragBarLineContainer: {
    alignSelf: 'center',
    backgroundColor: '#B3B1B3',
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  dragBarLine: {
    backgroundColor: 'white',
    alignSelf: 'center',
    height: 2,
    width: 13,
    borderRadius: 2,
    marginTop: 2,
  },
  itemTitle: {
    marginVertical: 5,
    fontSize: 20,
    alignSelf: 'center',
  },
  itemDetailIcon: {
    alignSelf: 'center',
    width: ITEM_ICON_HEIGHT,
    height: ITEM_ICON_HEIGHT,
    borderRadius: ITEM_ICON_HEIGHT * .5
  },
  itemDetailContainer: {
    padding: 10,
    paddingTop: 20,
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
  back: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    backgroundColor: 'transparent',
  },
  close: {
    position: 'absolute',
    bottom: -35,
    right: 10,
    backgroundColor: 'transparent',
  },
  closeIcon: {
    fontSize: 24,
    color: '$darkTeal',
    lineHeight: 24,
  },
  bigCircleIcon: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 1,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    backgroundColor: 'white',
    borderColor: '$beckyDisabledIconColor',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  buttonText: {
    color: '$beckyDarkGray',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 5,
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
