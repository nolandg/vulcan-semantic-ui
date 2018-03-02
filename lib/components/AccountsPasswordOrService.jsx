import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { hasPasswordService } from 'meteor/vulcan:accounts/imports/helpers';
import { replaceComponent } from 'meteor/vulcan:core';
import { intlShape } from 'meteor/vulcan:i18n';

export class AccountsPasswordOrService extends PureComponent {
  render () {
    let { className = "password-or-service", style = {} } = this.props;
    const services = Object.keys(this.props.oauthServices).map(service => {
      return this.props.oauthServices[service].label;
    });
    let labels = services;
    if (services.length > 2) {
      labels = [];
    }

    if (hasPasswordService() && services.length > 0) {
      return (
        <div style={style} className={className}>
          { `${this.context.intl.formatMessage({id: 'accounts.or_use'})} ${ labels.join(' / ') }` }
        </div>
      );
    }
    return null;
  }
}

AccountsPasswordOrService.propTypes = {
  oauthServices: PropTypes.object
};

AccountsPasswordOrService.contextTypes = {
  intl: intlShape
};

replaceComponent('AccountsPasswordOrService', AccountsPasswordOrService);
