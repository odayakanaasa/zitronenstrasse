<template lang="pug">
  //- ERROR PAGE: we extend the default layout. this is the page CONTENT OF THE PAGE actually!

  //- main area
  section.section.section-top.section-error
    .container

      //- div with css bg as svg | compass
      .svg-icon-compass

      h1.error-code
        | {{ error.statusCode }}

      h2.error-message
        | {{ error.message }}

      p(v-if='error.statusCode === 404')
        nuxt-link.error-link(to="/")
          | Back to the home page
</template>

<script>
  export default {
    props: ['error'],
    head () {
      return {
        title: this.error.message || 'An error occured'
      }
    }
  }
</script>

<style lang="sass">
  .error-message
    @extend .h4
    color: $color_error_page_subtitle

  .section-error
    text-align: center

  .svg-icon-compass
    width: 260px
    height: 260px
    margin: 30px auto
    // we set svg as image in css. nuxt is happy, but we lost the fill color options
    background-image: url('~/assets/img/svg_icon_compass.svg')
</style>
