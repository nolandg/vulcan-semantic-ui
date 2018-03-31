import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Icon, Confirm, Header } from 'semantic-ui-react';
import { withRouter } from 'react-router';

class EditModal extends Component {
  state = { modalOpen: false, deleteConfirmOpen: false }

  open = () => this.setState({ modalOpen: true })

  close = () => {
    this.setState({ modalOpen: false });
    if(this.props.onClose) this.props.onClose();
  };

  registerActions = (actions) => {
    this.formActions = actions;
  }

  handleSave = () => {
    this.formActions.submit();
  }

  handleDocumentDeleted = () => {
    this.close();
    if(this.props.onDocumentDeleted){
      this.documentDeleted();
    }
    if(this.props.redirectOnDelete){
      this.props.router.push(this.props.redirectOnDelete);
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

  componentWillReceiveProps = (nextProps) => {
    if(nextProps.open && !this.props.open) this.setState({modalOpen: true});
    else if(!nextProps.open && this.props.open) this.setState({modalOpen: false});
  }

  render() {
    const showDelete = this.props.document && this.props.showDelete;
    const { onDocumentDeleted, color, icon, onClose, open, document, collection,
            deleteTitle, deleteQuestion, buttonAttrs = {}, title, component, trigger,
            ...componentProps } = this.props;

    return (
      <Modal
        trigger={trigger !== undefined?trigger:<Button onClick={this.open} {...buttonAttrs} />}
        open={this.state.modalOpen}
        onClose={this.close}
        closeOnDimmerClick={false}
        className="edit-modal"
      >
        <Header style={color?{backgroundColor: `${color}`, color: '#FFF'}:null}>
          {icon?<Icon className={icon} />:null}
          <Header.Content>
            {title}
          </Header.Content>
        </Header>
        <Modal.Content>
          <Modal.Description>
            <this.props.component
              document={document}
              collection={collection}
              {...componentProps}
              registerActions={this.registerActions}
              closeModal={this.close}
              documentDeleted={this.handleDocumentDeleted}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='grey' onClick={this.close}><Icon name='cancel' />Cancel</Button>
          {showDelete?<Button color='red' onClick={this.handleDeleteRequest}><Icon name='trash' />Delete</Button>:null}
          <Button color='green' onClick={this.handleSave}><Icon name='save' />Save</Button>
        </Modal.Actions>

        {showDelete?
          <Confirm
            open={this.state.deleteConfirmOpen}
            onCancel={this.handleDeleteCancel}
            onConfirm={this.handleDeleteConfirm}
            content={deleteQuestion}
            header={deleteTitle}
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
