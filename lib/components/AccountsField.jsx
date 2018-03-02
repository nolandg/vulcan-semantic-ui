import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormControl from 'react-bootstrap/lib/FormControl';
import { replaceComponent } from 'meteor/vulcan:core';
import { Form, Input } from 'semantic-ui-react';

const autocompleteValues = {
  'username': 'username',
  'usernameOrEmail': 'email',
  'email': 'email',
  'password': 'current-password'
}

export class AccountsField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mount: true,
      value: this.props.defaultValue || '',
    };
  }

  triggerUpdate() {
    // Trigger an onChange on inital load, to support browser prefilled values.
    if (this.props.onChange) {
      this.props.onChange({ target: { value: this.state.value } });
    }
  }

  componentDidMount() {
    this.triggerUpdate();
  }

  componentDidUpdate(prevProps) {
    // Re-mount component so that we don't expose browser prefilled passwords if the component was
    // a password before and now something else.
    if (prevProps.id !== this.props.id) {
      this.setState({mount: false});
    }
    else if (!this.state.mount) {
      this.setState({mount: true});
      this.triggerUpdate();
    }
  }

  handleChange = (e, { value }) => {
    this.setState({value: value });
    if (this.props.onChange) {
      this.props.onChange({ target: { value: value } });
    }
  }

  render() {
    const {id, hint, label, type = 'text', message } = this.props;
    const { mount = true } = this.state;
    if (type == 'notice') {
      return <div>{ label }</div>;
    }

    const autoComplete = autocompleteValues[id];

    return mount ? (
      <Form.Field error={!!message}>
        <label>{label}</label>
        <Input fluid id={ id } type={type} onChange={this.handleChange} value={this.state.value}
          placeholder={hint} autoComplete={autoComplete} />
      </Form.Field>
    ) : null;
  }
}
AccountsField.propTypes = {
  onChange: PropTypes.func
};

replaceComponent('AccountsField', AccountsField)
