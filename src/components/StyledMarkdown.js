import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import Markdown from 'react-native-markdown-syntax'
import SizedImage from './SizedImage'

const StyledMarkdown = (props) => {
  //console.log('props.markdown', props.markdown)
  //const markdownForDisplay = `### Welcome to Planet Four: Ridges\n----------\nThis brief tutorial will teach you how to discover polygonal ridges on Mars. By mapping these features, you are helping to explore Mars\' past. \n`
  const markdownForDisplay = props.markdown
  //const markdownForDisplay = '### Features\n\n- blah blah'
  return (
    <Markdown>
      { props.markdown }
    </Markdown>
  )
}

//
// <Markdown
//   styles={styles}
//   rules={{
//     image: {
//       react: (node, output, state) => (
//         <SizedImage
//           key={state.key}
//           source={{ uri: node.target }}
//         />
//       ),
//     },
//   }}>

const mdStyle = {
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
