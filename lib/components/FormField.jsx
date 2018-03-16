
import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component as ReactComponent} from 'react';
import { Form, Input, Select, Checkbox } from 'semantic-ui-react';
import { DateRangePicker as ReactDateRangePicker } from 'react-dates';
import moment from 'moment';
import _ from 'lodash';

const CheckboxField = (props) => {
  return <FormField Component={Checkbox} {...props} />;
}
registerComponent('CheckboxField', CheckboxField);

const SelectField = (props) => {
  return <FormField Component={Select} {...props} />;
}
registerComponent('SelectField', SelectField);

const DateRangeField = (props) => {
  return <FormField Component={DateRangePicker} {...props} />;
}
registerComponent('DateRangeField', DateRangeField);

class DateRangePicker extends ReactComponent {
  state = {focusedInput: null}

  render() {
    const { startDate, endDate, startName, endName, onChange, ...rest } = this.props;

    return (
      <ReactDateRangePicker
        {...rest}
        startDate={startDate?moment(startDate):null} // momentPropTypes.momentObj or null,
        startDateId="startDateId" // PropTypes.string.isRequired,
        endDate={endDate?moment(endDate):null} // momentPropTypes.momentObj or null,
        endDateId="endDateId" // PropTypes.string.isRequired,
        onDatesChange={(values) =>
          onChange(null, {type: 'airbnb-date-range-picker', names: {start: startName, end: endName}, values})}
        focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
        noBorder={true}
        showClearDates={true}
        transitionDuration={500}
        isOutsideRange={() => false}
      />
    );
  }
}
DateRangePicker.defaultProps = {
  startName: 'startDate',
  endName: 'endDate',
};
registerComponent('DateRangePicker', DateRangePicker);

const FormField = (props) => {
  const { errors, name, label, Component, description, value, values, startName, endName, widthEm, ...rest } = props;
  const isCheckbox = Component.name === 'Checkbox';
  const isDateRangePicker = Component.name === 'DateRangePicker';

  let componentSpecificValue = value;
  if(!isCheckbox) componentSpecificValue = _.get(values, name);
  let params = {};

  if(isCheckbox) params = { ...params,
    checked: _.get(values, name) === value,
    label,
  };

  if(isDateRangePicker) {
    params = { ...params, startName, endName,
      startDate: _.get(values, startName),
      endDate: _.get(values, endName),
    };
  }else{
    params = {
      ...params,
      name,
      value: componentSpecificValue,
      style: widthEm?{maxWidth: widthEm + 'em'}:undefined,
    };
  }

  let hasError = !!_.get(errors.fields, name);
  if(isDateRangePicker){
    hasError = !!(_.get(errors.fields, startName) || _.get(errors.fields, endName));
  }

  return (
    <Form.Field error={hasError}>
      {!isCheckbox && label?<label>{label}</label>:null}
      <Component {...rest} {...params} />
      {description?<p>{description}</p>:null}
    </Form.Field>
  );
}
FormField.defaultProps = {
  Component: Input,
}
registerComponent('FormField', FormField);
