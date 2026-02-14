<template>
  <div class="question-image">
    <img class="image-src" :src="imageUrl" alt="" />
  </div>
</template>

<script>
export default {
  props: {
    asset: {
      type: [Object, String],
      required: true
    }
  },
  computed: {
    imageUrl() {
      // If asset is a string, it's already a URL
      if (typeof this.asset === 'string') {
        return this.asset
      }
      // If asset is an object with a url property, use that
      if (this.asset && this.asset.url) {
        return this.asset.url
      }
      // Return empty string if no valid image
      return ''
    }
  }
}
</script>

<style lang="sass">
.question-image
  display: flex
  justify-content: center
  max-height: 350px
  overflow: hidden

.image-src
  object-fit: contain
  padding: 0 1rem
  width: 100%
</style>
