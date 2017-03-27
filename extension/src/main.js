import Vue from 'vue'
import App from './App.vue'

import './lib/jquery1.7.1.min.js';
import './lib/trello_client.js';
import './lib/segment.js';

import '!style-loader!css-loader!./lib/normalize.css';

new Vue({
  el: '#vue-loader',
  render: h => h(App)
});
