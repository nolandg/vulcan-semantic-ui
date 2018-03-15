export * from '../modules/index.js';

var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBjOOz-ZK2eKcUkFnWlWDTZQv8i-vwRKO0&libraries=places';

document.body.appendChild(script);
