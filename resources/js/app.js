require('./bootstrap');

window.Vue = require('vue');

require('./axios');
require('./element');
require('./helpers');

import i18n from './i18n';

const files = require.context('./', true, /\.vue$/i)
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

// const app = new Vue({
//     el: '#app',
//     i18n
// });

window.i18n = i18n;
