import React from 'react';
import { Components, replaceComponent } from 'meteor/vulcan:core';
import { Form } from 'semantic-ui-react';

export class AccountsFields extends React.Component {
  render () {
    let { fields = {}, className = "fields" } = this.props;
    return (
      <Form.Group widths='equal'>
        {Object.keys(fields).map((id, i) =>
          <Components.AccountsField {...fields[id]} key={i} />
        )}
      </Form.Group>
    );
  }
}

replaceComponent('AccountsFields', AccountsFields);
