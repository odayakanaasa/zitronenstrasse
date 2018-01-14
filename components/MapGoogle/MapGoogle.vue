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

  // // remove goggle map logo
  // a[href^="http://maps.google.com/maps"],
  // a[href^="https://maps.google.com/maps"],
  // a[href^="https://www.google.com/maps"]
  //     display: none !important
  // .gmnoprint:not(.gm-bundled-control)
  //   display: none
  // .gm-bundled-control .gmnoprint
  //   display: block
</style>

<script>
  import placeIdArray from '~/components/MapGoogle/_placesIdArrays.js'
  import mapStylesDark from '~/components/MapGoogle/_mapStylesDark.js'

  export default {
    data () {
      const MapGoogle = {
        // empty object
      }
      return MapGoogle
    },

    // mounted: WHEN ALL code on server is already loaded!
    mounted () {
      this.initMap()
    },

    methods: {
      initMap () {
        const google = window.google

        const placeItemsNumber = placeIdArray.length
        const timerFirstRound = 300

        // time for fallback tieout if one item lost at first round.
        // workaroud for Google API query timeout
        // MAGIC NUMBER! set on how many places you have + time for showing them ...
        // right now more than 7 seconds ...
        const timerFallbackRound = timerFirstRound * placeItemsNumber / 2 + timerFirstRound

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

        const markerOptions = (map, placeID, result) => {
          const marker = new google.maps.Marker({
            map: map,
            place: {
              placeId: placeID,
              location: result.geometry.location
            },
            // set icon custom style
            icon: customMarker
          })
          return marker
        }

        const setMarker = (map, placeID, indexNumber) => {
          setTimeout(() => {
            new google.maps.places.PlacesService(map).getDetails({
              placeId: placeID
            }, (result, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                markerOptions(map, placeID, result)
              } else {
                setTimeout(() => {
                  new google.maps.places.PlacesService(map).getDetails({
                    placeId: placeID
                  }, function (result, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                      markerOptions(map, placeID, result)
                    } else {
                      console.error('💩 💩 💩')
                      // for debugging ...
                      // console.error(indexNumber + 1)
                      // console.error(placeID)
                      // console.error(status)
                    }
                  })
                // YOU HAVE TO WAIT the time to end for the array loop (so you not mess it up), then start
                }, timerFallbackRound)
              }
            })
          }, indexNumber * timerFirstRound)
        }

        // init map with options
        this.map = new google.maps.Map(document.getElementById('google-map'), {
          center: {
            lat: 52.486757,
            lng: 13.4403271
          },
          zoom: 14,
          options: {
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            // set custom map styles
            styles: mapStylesDark
          }
        })

        // http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
        placeIdArray.forEach((placeID, indexNumber) => {
          setMarker(this.map, placeID, indexNumber)
        })

      // ./ end method initMap
      }
    // ./ end methods
    }
  }
</script>
