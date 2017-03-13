import React from 'react'
import {
  Dimensions,
  Linking,
  Text,
  StyleSheet,
  View,
  WebView,
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
//import Markdown from 'react-native-markdown-syntax'
//import Markdown from 'react-native-simple-markdown'
//import SizedImage from './SizedImage'
//import Markdown from 'react-markdown-native'
//import Markdown from 'react-native-showdown'
//import Markdown from 'markdownz'
import defaultHTML from '../utils/defaultMarkdownHTML'

const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt({ linkify: true, breaks: true });

const WEBVIEW_REF = 'WEBVIEW_REF'

class StyledMarkdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = { height: 0 }
  }
  //console.log('props.markdown', props.markdown.replace(/\\/g, ""))
  //const markdownForDisplay = `### Welcome to Planet Four: Ridges\n----------\nThis brief tutorial will teach you how to discover polygonal ridges on Mars. By mapping these features, you are helping to explore Mars\' past. \n`

  //console.log('markdownForDisplay', markdownForDisplay)
  //const markdownForDisplay = '### Features\n\n- blah blah'


  onNavigationStateChange(navState) {
    console.log('navState.url has blank', navState.url, navState.url.indexOf('about:blank'))

    if (navState.title) {
      console.log('Navstate change', navState.title)
        const htmlHeight = Number(navState.title) //convert to number
        this.setState({height:htmlHeight});
    }
  }

  render() {

    let markdown = this.props.markdown.replace(/\=400x/g, '')
    let result = md.render(markdown)

    const pureCSS = 'img { max-width: 300px;}'

    const jsCode = `
        window.location.hash = 1;
         var calculator = document.createElement("div");
         calculator.id = "height-calculator";
         while (document.body.firstChild) {
            calculator.appendChild(document.body.firstChild);
         }
         document.body.appendChild(calculator);
         document.title = calculator.clientHeight;
    `


    const resultHTML =
      defaultHTML
          .replace('$title', '')
          .replace('$body', result)
          .replace('$pureCSS', pureCSS)
    //console.log(resultHTML)

    const displayWidth = Dimensions.get('window').width - 80

    const webviewComponent =
      <WebView
        ref={WEBVIEW_REF}
        style={{ height: this.state.height, width: displayWidth }}
				source={{
					html: resultHTML,
					baseUrl: 'about:blank',
          pureCSS: pureCSS
				}}
        javaScriptEnabled={ true }
        domStorageEnabled={ true }
        injectedJavaScript={ jsCode}
				automaticallyAdjustContentInsets={ true }
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
				onNavigationStateChange={ this.onNavigationStateChange.bind(this) }
        scalesPageToFit={ true }
			/>

    return (
      resultHTML ? webviewComponent : null
    )
  }

  onShouldStartLoadWithRequest = (event) => {
    if (event.url.indexOf('about:blank') < 0 ) {
      this.refs[WEBVIEW_REF].stopLoading()
      const url = event.url.replace(/\+tab\+/g, '')
      Linking.openURL(url)
      return false
    } else {
      return true
    }
  }



}

//
  //styles={styles}
// rules={{
//   image: {
//     react: (node, output, state) => (
//       <SizedImage
//         key={state.key}
//         source={{ uri: node.target }}
//       />
//     ),
//   },}}



const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
})

StyledMarkdown.propTypes = {
  markdown: React.PropTypes.string,
}

export default StyledMarkdown
