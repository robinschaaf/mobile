import React from 'react'
import {
  Alert,
  Linking,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import NavBar from './NavBar'
import { setState } from '../actions/index'
import { connect } from 'react-redux'
import {Actions} from 'react-native-router-flux'
import WebViewBridge from 'react-native-webview-bridge';

const WEBVIEW_REF = 'WEBVIEW_REF'
const zooniverseURL = 'https://www.zooniverse.org/projects/'

const mapStateToProps = (state) => ({
  webViewNavCounter: state.webViewNavCounter || 0
})

const mapDispatchToProps = (dispatch) => ({
  updateNavCounter(newVal) {
    dispatch(setState('webViewNavCounter', newVal))
  },
})


class ZooWebView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { canGoBack: false };
  }

  handleExternalLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Error', 'Sorry, but it looks like you are unable to open this link in your default browser.',
        )
      }
    })
  }

  render() {
    const zurl = `${zooniverseURL}${this.props.slug}`
    let jsCode = `
      (function () {
        if (WebViewBridge) {
          WebViewBridge.onMessage = function (message) {
            if (message === "get-links") {
              updateColors();
            }
          };

          function updateColors(){
            var links = document.querySelectorAll('a');
            for (i = 0; i < links.length; i++) {
              //links[i].style.color='blue';
              links[i].addEventListener('click', function() {
                WebViewBridge.send('{"link":"' + this + '"}');
              });
            }
          }
        }
      }());
    `

    return (
      <View style={styles.container}>
        <NavBar title={this.props.displayName} showBack={true} onBack={()=> {this.onBack()}} />
        <WebViewBridge
          ref={WEBVIEW_REF}
          onBridgeMessage={this.onBridgeMessage.bind(this)}
          source={{uri: zurl}}
          onLoadEnd={this.onLoadEnd }
          injectedJavaScript={jsCode}
          dataDetectorTypes='all'
          startInLoadingState={true}
          javaScriptEnabled={true}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </View>
    )
  }
  onBack() {
    this.props.updateNavCounter(this.props.webViewNavCounter - 1)

    if ((this.state.canGoBack) && (this.props.webViewNavCounter > 1)){
      this.refs[WEBVIEW_REF].goBack()
    } else {
      Actions.pop()
    }
  }

  onBridgeMessage(messageJSON){
    const message = JSON.parse(messageJSON)
    if (message.link) {
      if (this.isInternalLink(message.link)) {
        this.props.updateNavCounter(this.props.webViewNavCounter + 1)
      }
    }
  }

  onShouldStartLoadWithRequest = (event) => {
    if (this.isInternalLink(event.url)) {
      this.props.updateNavCounter(this.props.webViewNavCounter + 1)
      return true
    } else {
      this.handleExternalLink(event.url)
      return false
    }
  }

  isInternalLink(url) {
    return url.indexOf(zooniverseURL) >= 0
  }

  onNavigationStateChange = (navState) => {
    this.setState({
      canGoBack: navState.canGoBack
    })
  }


  onLoadEnd  = () => {
    setTimeout(() => { this.refs[WEBVIEW_REF].sendToBridge('get-links') }, 1500)
  }

}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },
})


ZooWebView.propTypes = {
  webViewNavCounter: React.PropTypes.number,
  displayName: React.PropTypes.string.isRequired,
  slug: React.PropTypes.string,
  updateNavCounter: React.PropTypes.func
}


export default connect(mapStateToProps, mapDispatchToProps)(ZooWebView)
