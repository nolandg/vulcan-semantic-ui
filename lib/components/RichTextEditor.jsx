
import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { EditorState, ContentState, convertFromRaw, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { stateToHTML } from 'draft-js-export-html';

const stateToHTMLOptions = {
  blockStyleFn: (block) => {
    if (block.getData().get('text-align')) {
      return {
        style: {
          textAlign: block.getData().get('text-align'),
        }
      }
    }
  }
}

function stringToHtml(string){
  return stateToHTML(convertFromRaw(JSON.parse(string)), stateToHTMLOptions);
}

export default {
  stringToHtml,
}

class RichTextEditor extends Component {
  constructor(props) {
    super(props);

    let editorState;
    if(props.value === null){
      editorState = EditorState.createEmpty();
    }else{
      try{
        editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(props.value)));
      }catch(err){
        editorState = EditorState.createWithContent(ContentState.createFromText(props.value));
      }
    }

    this.state = {
      editorState,
    };

    this.callParentOnChange();
  }

  callParentOnChange = () => {
    if(this.props.onChange){
      this.props.onChange(null, {name: this.props.name, value: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))});
    }
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });

    this.callParentOnChange();
  };

  render() {
    const { editorState } = this.state;

    const toolbar = {
      options:   ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
      inline: {
        options: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'],
      },
      textAlign: {
        options: ['left', 'center', 'right'],
      },
      list: {
        options: ['unordered', 'ordered'],
      },
    };

    return (
      <Editor
        editorState={editorState}
        wrapperClassName="rte-wrapper"
        editorClassName="rte-editor"
        onEditorStateChange={this.onEditorStateChange}
        toolbar={toolbar}
        placeholder={this.props.placeholder}
      />
    )
  }
}

registerComponent('RichTextEditor', RichTextEditor);
