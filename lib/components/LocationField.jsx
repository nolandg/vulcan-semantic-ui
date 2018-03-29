import { Components, registerComponent } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';

/* eslint-disable react/prop-types */
const renderSuggestion = ({ formattedSuggestion }) => (
  <div className="Demo__suggestion-item">
    <Icon name="marker" className="Demo__suggestion-icon" />
    <strong>{formattedSuggestion.mainText}</strong>{' '}
    <small className="text-muted">{formattedSuggestion.secondaryText}</small>
  </div>
);
/* eslint-enable react/prop-types */
const renderFooter = () => (
  <div className="Demo__dropdown-footer">
    <div>
      <img
        src='/packages/noland_vulcan-semantic-ui/lib/assets/images/powered_by_google_default.png'
        className="Demo__dropdown-footer-image"
      />
    </div>
  </div>
);

const cssClasses = {
  root: 'form-group',
  input: 'Demo__search-input',
  autocompleteContainer: 'Demo__autocomplete-container',
};

const shouldFetchSuggestions = ({ value }) => value.length > 2;

const onError = (status, clearSuggestions) => {
  console.error(
    'Error happened while fetching suggestions from Google Maps API',
    status
  );
  clearSuggestions();
};

class WrappedPlacesAutocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: props.value ? props.value.text || '' : '',
      geocodeResults: null,
      loading: false,
    };
  }

  getNiceLocationData = (result) => {
    let airport;
    let city, state, country;

    result.address_components.forEach(c => {
      c.types.forEach(t => {
        if(t === 'airport') airport = c.short_name;
        if(t === 'locality') city = c.short_name;
        if(t === 'administrative_area_level_1') state = c.short_name;
        if(t === 'country') country = c.short_name;
      });
    });

    let text = airport;
    if(!text && city && state && country) text = `${city}, ${state}, ${country}`;
    else if(!text) text = result.formatted_address;

    return {
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
      placeId: result.place_id,
      longText: result.formatted_address,
      text,
    };
  }

  handleSelect = (address) => {
    this.setState({
      address,
      loading: true,
    });

  geocodeByAddress(address)
    .then(results => {
      if(results[0]){
        const value = this.getNiceLocationData(results[0]);
        if(this.props.onChange){
          this.props.onChange(null, {type: 'location-autocomplete', name: this.props.name, value});
        }
      }
      this.setState({
        loading: false,
      });
    })
    .catch(error => {
      console.error('Geocode Error', error);
      this.setState({
        loading: false,
      });
    });
  }

  handleChange = (address) => {
    this.setState({ address, geocodeResults: null });
  }

  render() {
    const inputProps = {
      type: 'text',
      value: this.state.address,
      onChange: this.handleChange,
      onBlur: () => {},
      onFocus: () => {},
      autoFocus: false,
      placeholder: 'Search for a place',
      name: 'Demo__input',
    };

    return (
      <PlacesAutocomplete
        renderSuggestion={renderSuggestion}
        renderFooter={renderFooter}
        inputProps={inputProps}
        classNames={cssClasses}
        onSelect={this.handleSelect}
        onEnterKeyDown={this.handleSelect}
        onError={onError}
        shouldFetchSuggestions={shouldFetchSuggestions}
        highlightFirstSuggestion={true}
        options={{
          types: ['geocode'],
        }}
      />
    );
  }
}

const LocationField = (props) => {
  return <Components.FormField Component={WrappedPlacesAutocomplete} {...props} />;
}
registerComponent('LocationField', LocationField);
