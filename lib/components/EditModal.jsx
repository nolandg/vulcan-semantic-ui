import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Icon, Confirm } from 'semantic-ui-react';
import { withRouter } from 'react-router';

class EditModal extends Component {
  state = { modalOpen: false, deleteConfirmOpen: false }

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = () => this.setState({ modalOpen: false })

  registerActions = (actions) => {
    this.formActions = actions;
  }

  handleSave = () => {
    this.formActions.submit();
  }

  handleDocumentRemoved = () => {
    if(this.props.redirectOnDelete){
      this.props.router.transitionTo(this.props.router.createLocation(this.props.redirectOnDelete));
    }
  }

  handleDeleteRequest = () => {
    this.setState({ deleteConfirmOpen: true });
  }

  handleDeleteConfirm = () => {
    this.formActions.delete();
    this.setState({deleteConfirmOpen: false});
  }

  handleDeleteCancel = () => {
    this.setState({deleteConfirmOpen: false});
  }

  render() {
    const showDelete = this.props.document && this.props.showDelete;

    return (
      <Modal
        trigger={<Button onClick={this.handleOpen} {...this.props.buttonAttrs} />}
        open={this.state.modalOpen}
        onClose={this.handleClose}
        closeOnDimmerClick={false}
      >
        <Modal.Header>{this.props.title}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <this.props.component
              document={this.props.document}
              collection={this.props.collection}
              registerActions={this.registerActions}
              closeModal={this.handleClose}
              documentRemoved={this.handleDocumentRemoved}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='grey' onClick={this.handleClose}><Icon name='cancel' />Cancel</Button>
          {showDelete?<Button color='red' onClick={this.handleDeleteRequest}><Icon name='trash' />Delete</Button>:null}
          <Button color='green' onClick={this.handleSave}><Icon name='save' />Save</Button>
        </Modal.Actions>

        {showDelete?
          <Confirm
            open={this.state.deleteConfirmOpen}
            onCancel={this.handleDeleteCancel}
            onConfirm={this.handleDeleteConfirm}
            content={this.props.deleteQuestion}
            header={this.props.deleteTitle}
            confirmButton="Delete"
            cancelButton="Cancel"
          />:null}
      </Modal>
    )
  }
}

EditModal.defaultProps = {
  showDelete: true,
};

registerComponent('EditModal', EditModal, withRouter);
