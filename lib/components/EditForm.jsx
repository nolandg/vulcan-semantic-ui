import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Message, Icon } from 'semantic-ui-react';
import _ from 'lodash';

export default class EditForm extends Component {
  constructor(props, fields) {
    super(props);

    this.state = {
      values: {},
      errors: {
        fields: {},
        all: [],
        count: 0,
      },
      submissionAttempted: false,
    };

    if(this.isNew()){
      // Populate with default values from schema
      const schema = props.collection.simpleSchema().schema();
      fields.forEach((field) => {
        const value = _.get(schema[field], 'form.defaultValue', undefined);
        _.set(this.state.values, field, value);
      });
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
    // is JSON the fastest way to deep clone?
    this.setState(state => _.set(JSON.parse(JSON.stringify(state)), 'values.' + name, value));
  }

  handleChange = (e, { name, value, type, checked, values, names }) => {
    switch (type) {
      case 'checkbox':
        this.updateValue(name, checked);
        break;
      case 'airbnb-date-range-picker':
        this.updateValue(names.start, values.startDate?values.startDate.toDate():null);
        this.updateValue(names.end, values.endDate?values.endDate.toDate():null);
        break;
      case 'radio':
      case 'location-autocomplete':
      default:
        this.updateValue(name, value);
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(this.state.submissionAttempted && !_.isEqual(prevState.values, this.state.values)){
      this.validateDocument();
    }
  }

  mapSchemaErrorToMessage = (e, schema) => {
    const { value, type } = e;
    let name = schema.label(e.name);
    if(!name){
      // Capilize the last part of the name, eg: "Units" for data.units
      name = e.name.replace(/.*\.(.*)/, '$1');
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

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
        return `"${name}" is not a valid date.`;
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
        return `${name} does not appear to be valid.`;
      default:
        return `"${value}" is not a valid value for ${name}.`;
    }
  }

  clearErrors = () => {
    this.setState({errors: {fields: {}, count: 0}});
  }

  validateDocument = () => {
    const schema = this.props.collection.simpleSchema();
    const values = schema.clean(this.state.values);

    const validationContext = schema.newContext();
    validationContext.validate(values);
    const schemaErrors = validationContext.validationErrors();
    const errors = {
      fields: {},
      all: [],
      count: schemaErrors.length,
    }

    schemaErrors.forEach((error) => {
      error = {
        message: error.message || this.mapSchemaErrorToMessage(error, schema),
        ...error,
      };
      _.set(errors.fields, error.name, error);
      errors.all.push(error);
    });

    this.setState({errors});

    return !errors.count;
  }

  submit = () => {
    this.setState({submissionAttempted: true});

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
        .catch(this.handleMutationError).then(this.handleMutationSuccess);
    }else{
      this.props.editMutation({...mutationOptions, documentId, set: values})
        .catch(this.handleMutationError).then(this.handleMutationSuccess);
    }
  }

  delete = () => {
    const documentId = this.props.document._id;
    const mutationOptions = {
      validate: true,
      currentUser: this.props.currentUser,
    }
    this.props.removeMutation({...mutationOptions, documentId})
      .then(() => {
        if(this.props.documentDeleted) this.props.documentDeleted()
      })
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

  handleMutationError = (error) => {
    console.error(error);

    const errors = {
      fields: {},
      all: [],
      count: 0,
    }

    if(error.graphQLErrors){
      error.graphQLErrors.forEach((graphQLError) => {
        if(!graphQLError.data){
          errors.count = errors.count + 1;
          errors.all.push({
            message: graphQLError.message,
            ...graphQLError,
          });
          return;
        }

        graphQLError.data.errors.forEach((error) => {
          errors.count = errors.count + 1;
          let message;
          if(error.data && error.date.message)
            message = error.data.message;
          else if(error.data)
            message = `Field "${error.data.fieldName}" has error "${error.id}".`;
          else if(error.fieldName)
            message = `Field "${error.fieldName}" has error "${error.id}".`;
          else
            message = `Unknown error "${error.id}"`;
          errors.all.push({message, ...error});
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

    errors.all.forEach(error => {
      const key = error.name && error.type?error.name + '__' + error.type:error.message;
      messages.push(
        <Message icon error key={key}>
          <Icon name="dont" />
          <Message.Content>
            {error.message}
          </Message.Content>
        </Message>
      );
    });

    return messages;
  }
}

EditForm.propTypes = {
  collection: PropTypes.object.isRequired,
}
