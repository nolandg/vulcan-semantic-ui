import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { replaceComponent, Components } from 'meteor/vulcan:core';

export class AccountsFormMessages extends Component {
  render () {
    return(
      <div className="messages">
        {this.props.messages.map(({ message, type }, i) => {
          return <Components.AccountsFormMessage message={message} type={type} key={i} />;
        })}
      </div>
    );
  }
}

replaceComponent('AccountsFormMessages', AccountsFormMessages);
