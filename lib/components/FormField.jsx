
import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component as ReactComponent} from 'react';
import { Form, Input, Select, Checkbox, Icon } from 'semantic-ui-react';
import { DateRangePicker as ReactDateRangePicker } from 'react-dates';
import moment from 'moment';
import _ from 'lodash';

const RichTextField = (props) => {
  return <FormField Component={Components.RichTextEditor} componentType="RichTextEditor" {...props} />;
}
registerComponent('RichTextField', RichTextField);

const CheckboxField = (props) => {
  return <FormField Component={Checkbox} componentType="Checkbox" {...props} />;
}
registerComponent('CheckboxField', CheckboxField);

const SelectField = (props) => {
  return <FormField Component={Select} componentType="Select" {...props} />;
}
registerComponent('SelectField', SelectField);

const DateRangeField = (props) => {
  return <FormField Component={DateRangePicker} componentType="DateRange" {...props} />;
}
registerComponent('DateRangeField', DateRangeField);

class DateRangePicker extends ReactComponent {
  state = {focusedInput: null}

  render() {
    const { startDate, endDate, startName, endName, onChange, initialMonth, ...rest } = this.props;

    return (
      <ReactDateRangePicker
        {...rest}
        initialVisibleMonth={() => initialMonth || moment()}
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
        transitionDuration={200}
        reopenPickerOnClearDates={true}
        isOutsideRange={() => false}
        displayFormat="MMM DD, YYYY"
        numberOfMonths={3}
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
  const { type, componentType, errors, name, label, labelAs, labelIcon, labelIconSize, Component, description, value, values, startName, endName, widthEm, ...rest } = props;
  const isCheckbox = componentType === 'Checkbox';
  const isDateRangePicker = componentType === 'DateRange';
  const LabelComponentName = labelAs;

  let params = {};

  let labelIconComponent;
  if(labelIcon === null)
    labelIconComponent = <Icon size={labelIconSize || undefined} style={{width: 0}} />
  else if(labelIcon)
    labelIconComponent = <Icon size={labelIconSize || undefined} className={labelIcon} />

  const labelComponent = <LabelComponentName>{labelIconComponent}{label}</LabelComponentName>;

  if(isDateRangePicker) {
    params = { ...params, startName, endName,
      startDate: _.get(values, startName),
      endDate: _.get(values, endName),
    };
  }

  if(!isDateRangePicker){
    params = {
      ...params,
      name,
      value: _.get(values, name, ''),
      style: widthEm?{maxWidth: widthEm + 'em'}:undefined,
    };
  }

  if(isCheckbox) params = { ...params,
    checked: _.get(values, name) === value,
    label: labelComponent,
  };

  let hasError = !!_.get(errors.fields, name);
  if(isDateRangePicker){
    hasError = !!(_.get(errors.fields, startName) || _.get(errors.fields, endName));
  }

  if(isCheckbox && (type === 'radio')) params.value = value;
  else if(isCheckbox) params.value = undefined;

  return (
    <Form.Field error={hasError}>
      {!isCheckbox && label?labelComponent:null}
      <Component {...rest} {...params} type={type}/>
      {description?<p>{description}</p>:null}
    </Form.Field>
  );
}
FormField.defaultProps = {
  Component: Input,
  labelAs: 'label',
  labelIconSize: 'big',
}
registerComponent('FormField', FormField);
