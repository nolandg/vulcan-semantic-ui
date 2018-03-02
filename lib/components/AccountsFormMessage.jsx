import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { replaceComponent } from 'meteor/vulcan:core';
import {  Message, Icon } from 'semantic-ui-react';

export class AccountsFormMessage extends Component {
  state = {
    visible: true,
  }

  handleDismiss = () => {
    this.setState({visible: false});
  }

  render () {
    if(!this.state.visible) return null;

    let {type, message} = this.props;
    let icon = 'exclamation triangle';
    if(type === 'error') icon = 'dont';
    if(type === 'warning') icon = 'exclamation triangle';
    if(type === 'success') icon = 'check';

    console.log('Accounts message type and icon: ' + type + ' ' + icon);

    return (
      <Message error={type!=='success'} success={type==='success'} onDismiss={this.handleDismiss}>
        <Icon name={icon} />
        {message}
      </Message>
    );
  }
}

replaceComponent('AccountsFormMessage', AccountsFormMessage);
