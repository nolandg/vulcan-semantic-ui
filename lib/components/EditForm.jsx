import { Components, registerComponent } from 'meteor/vulcan:core';
import { Utils } from 'meteor/vulcan:lib';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Message, Icon } from 'semantic-ui-react';
import SimpleSchema from 'simpl-schema';

export default class EditForm extends Component {
  constructor(props, fields) {
    super(props);

    this.state = {
      values: {},
      errors: {
        fields: {},
        count: 0,
      }
    };

    if(this.isNew()){
      // ToDo: populate with default values from schema
    }else{
      // populate with existing data from document
      fields.forEach((field) => {
        this.state.values[field] = this.props.document[field];
      });
    }
  }

  isNew = () => {
    return !this.props.document;
  }

  updateValue = (name, value) => {
    this.setState({ values: { ...this.state.values, [name]: value }});
  }

  handleChange = (e, { name, value, type, checked, values, names }) => {
    let stateValue;
    switch (type) {
      case 'checkbox':
        this.updateValue(name, checked);
        break;
      case 'airbnb-date-range-picker':
        this.setState({ values: { ...this.state.values,
          [names[0]]: values.startDate?values.startDate.toDate():null,
          [names[1]]: values.endDate?values.endDate.toDate():null,
        }});
        break;
      default:
        this.updateValue(name, value);
    }

  }

  mapSchemaErrorToMessage = (e, schema) => {
    const { value, type } = e;
    const name = schema.label(e.name);

    switch (type) {
      case 'required':
         return `${name} is a required field.`;
      case 'minString':
        return `${name} is too short.`;
      case 'maxString':
        return `${name} is too long.`;
      case 'minNumber':
        return `${name} is too small.`;
      case 'maxNumber':
        return `${name} is too big.`;
      case 'minDate':
        return `${name} must be later.`;
      case 'maxDate':
        return `${name} must be earlier.`;
      case 'badDate':
        return `${name} is not a valid date.`;
      case 'minCount':
        return `${name} has too few entries.`;
      case 'maxCount':
        return `${name} has too many entries.`;
      case 'noDecimal':
        return `${name} cannot be a decimal.`;
      case 'notAllowed':
        return `"${value}" is not a valid value for ${name}.`;
      case 'expectedString':
        return `${name} must be a string.`;
      case 'expectedNumber':
        return `${name} must be a number.`;
      case 'expectedBoolean':
        return `${name} must be true or false.`;
      case 'expectedArray':
        return `${name} must be an array.`;
      case 'expectedObject':
        return `${name} must be an object.`;
      case 'expectedConstructor':
        return `${name} must be a constructor.`;
      case 'regEx':
        return `${name} failed RegEx test.`;
      default:
        return `${value} is not a valid value for ${name}.`;
    }
  }

  clearErrors = () => {
    this.setState({errors: {fields: {}, count: 0}});
  }

  validateDocument = () => {
    const schema = this.props.collection.simpleSchema();
    const values = schema.clean({...this.state.values});

    const validationContext = schema.newContext();
    validationContext.validate(values);
    const schemaErrors = validationContext.validationErrors();
    const errors = {
      fields: {},
      count: schemaErrors.length,
    }

    schemaErrors.forEach((error) => {
      errors.fields[error.name] = {
        message: this.mapSchemaErrorToMessage(error, schema),
        ...error,
      }
    });

    this.setState({errors});

    return !errors.count;
  }

  submit = () => {
    if(!this.validateDocument()){
      return;
    }

    const values = this.props.collection.simpleSchema().clean({...this.state.values});
    const documentId = this.props.document?this.props.document._id:undefined;
    const mutationOptions = {
      validate: true,
      currentUser: this.props.currentUser,
    }

    if(this.isNew()){
      this.props.newMutation({...mutationOptions, document: values})
        .catch(this.handleMutationError).then(this.handleMutationSuccess).done(this.handleMutationDone);
    }else{
      this.props.editMutation({...mutationOptions, documentId, set: values})
        .catch(this.handleMutationError).then(this.handleMutationSuccess).done(this.handleMutationDone);
    }
  }

  delete = () => {
    const documentId = this.props.document._id;
    const mutationOptions = {
      validate: true,
      currentUser: this.props.currentUser,
    }
    this.props.removeMutation({...mutationOptions, documentId})
      .then(() => { if(this.props.documentRemoved) this.props.documentRemoved() })
      .catch(this.handleMutationError);
  }

  handleMutationSuccess = (obj) => {
    // This is still called even if there's graphQL validation errors?
    // But it seems returned obj is undefined then if there's errors
    if(!obj) return;

    this.clearErrors();
    if(this.props.onSuccess) this.props.onSuccess();
    if(this.props.closeModal) this.props.closeModal();
  }

  handleMutationDone = () => {
    if(this.props.onDone) this.props.onDone();
  }

  handleMutationError = (error) => {
    console.error(error);

    const errors = {
      generic: [],
      count: 0,
    }

    if(error.graphQLErrors){
      error.graphQLErrors.forEach((graphQLError) => {
        graphQLError.data.errors.forEach((error) => {
          errors.count = errors.count + 1;
          errors.generic.push({
            message: error.data.message?error.data.message:'Field "' + error.data.fieldName + '" has error "' + error.id + '"',
            ...error,
          })
        })
      })
    }

    this.setState({errors});
  }

  componentDidMount() {
    if(this.props.registerActions) this.props.registerActions({
      submit: this.submit,
      delete: this.delete,
    });
  }

  renderMessages = () => {
    const {errors} = this.state;
    if(!errors || !errors.count) return null;

    const messages = [];

    for(var key in errors.fields){
      const error = errors.fields[key];

      messages.push(
        <Message icon error key={error.name + '__' + error.type}>
          <Icon name="dont" />
          <Message.Content>
            {error.message}
          </Message.Content>
        </Message>
      );
    }

    if(errors.generic){
      errors.generic.forEach((error) => {
        messages.push(
          <Message icon error key={error.data.fieldName + '__' + error.data.type}>
            <Icon name="dont" />
            <Message.Content>
              {error.message}
            </Message.Content>
          </Message>
        );
      });
    }

    return messages;
  }
}
