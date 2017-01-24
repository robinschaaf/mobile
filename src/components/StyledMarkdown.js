import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import Markdown from 'react-native-simple-markdown'
import SizedImage from './SizedImage'

const StyledMarkdown = (props) => {
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
      {props.markdown}
    </Markdown>
  )
}

const styles = EStyleSheet.create({
  text: {
    fontFamily: 'OpenSans',
    fontSize: 16,
  },
})

StyledMarkdown.propTypes = {
  markdown: React.PropTypes.string,
}

export default StyledMarkdown
