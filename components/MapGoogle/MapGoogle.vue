<template lang="pug">
  .map-main-wrapper
    .google-map#google-map
</template>




<style lang="sass">
  .map-main-wrapper
    width: 100%
    min-height: 100%

  .google-map
    position: absolute
    width: 100%
    height: 100%

  // map bg whn loading
  .gm-style
    background: $color_map_bg

  // content of each map info InfoWindow
  .gm-style-iw
    color: $color_info_winfow_text

    .text
      margin-bottom: .25rem

    .title
      font-size: 18px
      font-weight: 500
      color: $color_info_winfow_title
    // option for color of opening
    .open-time
      color: $color_open_undefined
    .is-open-now
      color: $color_open_yes
      font-weight: 500
    .is-open-not
      color: $color_open_no

  // remove google cc
  // and remove some weird grey box set on right side from google
  .gm-style-cc
    display: none
</style>




<script>
  import placeIdArray from '~/components/MapGoogle/_placesIdArrays.js'
  import mapStylesDark from '~/components/MapGoogle/_mapStylesDark.js'

  export default {
    data () {
      // empty object
      return {}
    },

    // mounted: WHEN ALL code on server is already loaded!
    mounted () {
      let activeInfoWindow

      // !!! we need this google constant
      const google = window.google

      // !!! timer for timeout of marker for avoiding API jquey TIMEOUT
      const timerSeconds = 450

      // marker custom colors
      // custom color: a little bit darker then the main one. for the marker looks the same
      const markerColorFill = '#eab622'
      const markerColorStroke = '#FFC832'

      // path inspiration from this codepen:
      // https://codepen.io/defvayne23/pen/EVYGRw?editors=1010
      // we follow the svg path to amazon and taken the path from the original url
      // https://s3-us-west-2.amazonaws.com/s.cdpn.io/134893/pin-red.svg
      const markerPath = 'M 8 2.1 c 1.1 0 2.2 0.5 3 1.3 c 0.8 0.9 1.3 1.9 1.3 3.1 s -0.5 2.5 -1.3 3.3 l -3 3.1 l -3 -3.1 c -0.8 -0.8 -1.3 -2 -1.3 -3.3 c 0 -1.2 0.4 -2.2 1.3 -3.1 c 0.8 -0.8 1.9 -1.3 3 -1.3 Z'

      const customMarker = {
        path: markerPath,
        fillColor: markerColorFill,
        strokeColor: markerColorStroke,
        fillOpacity: 1,
        scale: 2.5,
        strokeWeight: 2,
        // for correct alignmnet of custom SVG icon with map point
        anchor: new google.maps.Point(11, 12)
      }

      const fadeInMarker = (marker, opacityValue) => {
        // TRICK: value for opacity NOT 1, but a little bit less.
        // so we are avoiding visual flickering
        if (marker.opacity < 0.9) {
          opacityValue = opacityValue + 0.1
          marker.setOpacity(opacityValue)
          // call this method again
          setTimeout(() => {
            fadeInMarker(marker, opacityValue)
          }, 35)
        } else {
          // fade i value set to 1. DONE fade in effect. stop here the loop
          marker.setOpacity(1)
        }
      }

      // init map
      this.map = new google.maps.Map(document.getElementById('google-map'), {
        center: {
          lat: 52.486757,
          lng: 13.4403271
        },
        zoom: 14,
        // map options
        options: {
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          // disableDefaultUI: true,
          // attributionControl: false,
          // set custom map styles
          styles: mapStylesDark
        }

      })

      const mapLoaded = this.map

      // add markers in the loop with order number
      // https://stackoverflow.com/questions/10179815/how-do-you-get-the-loop-counter-index-using-a-for-in-syntax-in-javascript
      for (const [indexNumber, placeID] of placeIdArray.entries()) {
        // timer for avoiding TIMEOUT: 450 looks fine, below errors ...
        const timer = (indexNumber + 1) * timerSeconds

        // timeout playing time
        setTimeout(() => {
          new google.maps.places.PlacesService(mapLoaded).getDetails({
            placeId: placeID
          }, (result, status) => {
            // marker has errors ...
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
              if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                console.error(`💩 : OVER_QUERY_LIMIT : ${indexNumber}`)
              } else {
                console.error('💩 : generic placeID error')
              }
              return
            }

            // ========= set marker API data =========
            let marker = new google.maps.Marker({
              map: mapLoaded,
              position: result.geometry.location,
              // set icon custom style
              icon: customMarker
            })

            // ========= set marker fadeIn effect =========
            // set fade as default as zero
            // opacity looks one of the only options accepted by google API
            let opacityValue = 0
            marker.setOpacity(0)
            // start fade in logic
            fadeInMarker(marker, opacityValue)

            // ========= set marker Infowindow =========
            let isOpenClass = 'is-open-not'
            let isOpenText = 'Closed now'
            // TODO: remove: for checking
            if (typeof result.opening_hours !== 'undefined') {
              if (result.opening_hours.open_now) {
                isOpenClass = 'is-open-now'
                isOpenText = 'Open now'
              }
            } else {
              isOpenClass = 'is-open-unknown'
              isOpenText = 'No info about opening time'
            }

            const currentInfoWindow = new google.maps.InfoWindow({
              // here set logic for info window for each item
              // https://developers.google.com/maps/documentation/javascript/infowindows
              content: `
                <p class='text title'>${result.name}</p>
                <p class='text address'>${result.adr_address}</p>
                <p class='text open-time ${isOpenClass}'>${isOpenText}</p>
              `
            })
            google.maps.event.addListener(marker, 'click', (el) => {
              // close info window of previous opened marker : reset
              activeInfoWindow && activeInfoWindow.close()
              // open current clicked one
              currentInfoWindow.open(mapLoaded, marker)
              // set the current one as opened one
              activeInfoWindow = currentInfoWindow
            })
          })
        // close timer for each marker
        }, timer)
      }
    // end mounted
    }
  }
</script>
