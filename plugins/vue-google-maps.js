import Vue from 'vue'
import * as VueGoogleMaps from '~/node_modules/vue2-google-maps/src/main'

Vue.use(VueGoogleMaps, {
  load: {
    key: '',
    // Google Maps API version
    v: '3.26',
    // Google Maps API Libraries you need
    libraries: 'places'
  }
})
