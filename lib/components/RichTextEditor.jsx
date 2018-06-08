
import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { EditorState, ContentState, convertFromRaw, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { stateToHTML } from 'draft-js-export-html';
import { getSetting } from 'meteor/vulcan:lib';

function uploadImageCallBack(file) {
  return new Promise(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const imgurClientId = getSetting('imgurClientId');

      xhr.open('POST', 'https://api.imgur.com/3/image');
      xhr.setRequestHeader('Authorization', `Client-ID ${imgurClientId}`);
      const data = new FormData();
      data.append('image', file);
      xhr.send(data);
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      });
      xhr.addEventListener('error', () => {
        const error = JSON.parse(xhr.responseText);
        reject(error);
      });
    }
  );
}

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
    if((props.value === null) || (props.value === undefined)){
      editorState = EditorState.createEmpty();
    }else{
      try{
        editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(props.value)));
      }catch(err){
        editorState = EditorState.createWithContent(ContentState.createFromText(props.value));
      }
    }
    this.state = {editorState};
    this.callParentOnChange();
  }

  callParentOnChange = () => {
    const value = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()));
    if(this.props.onChange){
      this.props.onChange(null, {name: this.props.name, value});
    }
  }

  onEditorStateChange = (editorState) => {
    this.setState({editorState}, () => {this.callParentOnChange();});
  };

  render() {
    const { editorState } = this.state;

    const toolbar = {
      options:   ['inline', 'colorPicker', 'blockType', 'list', 'image', 'embedded', 'textAlign', 'link', 'history'],
      inline: {
        options: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'],
      },
      textAlign: {
        options: ['left', 'center', 'right'],
      },
      list: {
        options: ['unordered', 'ordered'],
      },
      embedded: {
        defaultSize: {
          height: 'auto',
          width: '100%',
        },
      },
      image: {
        uploadCallback: uploadImageCallBack,
        alt: { present: false, mandatory: false },
        defaultSize: {
          height: 'auto',
          width: '100%',
        },
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
