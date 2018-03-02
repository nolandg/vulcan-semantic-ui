import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withCurrentUser, Components, registerComponent } from 'meteor/vulcan:core';

class VulcanSemanticUiDemo extends PureComponent {
  render (){
    return (
      <div>
        <h1>Vulcan Semantic UI Demo</h1>
      </div>
    )
  }
}

VulcanSemanticUiDemo.propTypes = {
};

registerComponent('VulcanSemanticUiDemo', VulcanSemanticUiDemo, withCurrentUser);
