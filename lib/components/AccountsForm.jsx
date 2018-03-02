import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Components, replaceComponent } from 'meteor/vulcan:core';
import { Form, Divider} from 'semantic-ui-react';

export class AccountsForm extends Component {
  handleSubmit = (e) => {
    // e.preventDefault();
  }

  render() {
    const {
      oauthServices,
      fields,
      buttons,
      messages,
      ready = true,
      className,
    } = this.props;
    const _className = classnames('accounts-ui', { ready }, className);

    return (
      <Form
        onSubmit={this.handleSubmit}
        className={_className}
        noValidate
        error
        success
      >
        {Object.keys(fields).length?<Components.AccountsFields fields={ fields } />:null}
        <Components.AccountsButtons buttons={ buttons } />
        <Components.AccountsPasswordOrService oauthServices={ oauthServices } />
        <Components.AccountsSocialButtons oauthServices={ oauthServices } />
        <Components.AccountsFormMessages messages={messages} />
      </Form>
    );
  }
}
AccountsForm.propTypes = {
  oauthServices: PropTypes.object,
  fields: PropTypes.object.isRequired,
  buttons: PropTypes.object.isRequired,
  error: PropTypes.string,
  ready: PropTypes.bool
};

replaceComponent('AccountsForm', AccountsForm);
