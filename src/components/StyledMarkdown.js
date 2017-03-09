import React from 'react'
import {
  Text,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
//import Markdown from 'react-native-markdown-syntax'
import Markdown from 'react-native-simple-markdown'
import SizedImage from './SizedImage'

const StyledMarkdown = (props) => {
  //console.log('props.markdown', props.markdown.replace(/\\/g, ""))
  //const markdownForDisplay = `### Welcome to Planet Four: Ridges\n----------\nThis brief tutorial will teach you how to discover polygonal ridges on Mars. By mapping these features, you are helping to explore Mars\' past. \n`
  const markdownForDisplay = props.markdown.replace(/\n-/g, '\n\n-')
  //console.log('markdownForDisplay', markdownForDisplay)
  //const markdownForDisplay = '### Features\n\n- blah blah'
  return (
    <Markdown
      styles={styles}
      rules={{
        image: {
          react: (node, output, state) => (
            <SizedImage
              key={state.key}
              source={{ uri: node.target }}
            />
          ),
        },
      }}>
        { markdownForDisplay }
      </Markdown>
  )
}



const styles = {
  h: {
    fontFamily: 'OpenSans',
    fontWeight: '700'
  },
  h1: {
    fontSize: 30,
  },
  h2: {
    fontSize: 23
  },
  h3: {
    fontSize: 17
  },
  h4: {
    fontSize: 15
  },
  h5: {
    fontSize: 12
  },
  h6: {
    fontSize: 10
  }
}

StyledMarkdown.propTypes = {
  markdown: React.PropTypes.string,
}

export default StyledMarkdown
