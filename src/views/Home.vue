<template>
  <div class="home">
    <squizzy-squid :mouth="expression.mouth" class="home-squizzy" />
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script>
import SquizzySquid from '@/components/general/SquizzySquid'

export default {
  components: {
    SquizzySquid
  },
  data() {
    return {
      title: 'Bem-vindo ao Squizzy!',
      subtitle: 'Para jogar, encontre um código QR para escanear ou um URL para seguir',
      expression: {mouth: 'happy'}
    }
  },
  beforeRouteEnter(to, from, next) {
    if (to.params.title && to.params.subtitle) {
      next(vm => {
        vm.title = to.params.title
        vm.subtitle = to.params.subtitle
        vm.expression = {eyes: 'default', mouth: 'sad-open'}
      })
    } else {
      next()
    }
  }
}
</script>

<style lang="sass" scoped>
.home-squizzy
  max-height: 250px
</style>
