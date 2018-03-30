import { getSetting } from 'meteor/vulcan:lib';

export * from '../modules/index.js';

// Add Google Maps script
const key = getSetting('googleMapsApiKey');
if(key){
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
  document.body.appendChild(script);
}else{
  console.error('Must supply googleMapsApiKey in settings file. Could not start Maps API without this.');
}
