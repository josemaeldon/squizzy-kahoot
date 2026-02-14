<template>
  <div class="register-player">
    <label :for="`input-${label}-id`">{{ label }}</label>
    <input
      :id="`input-${label}-id`"
      ref="nameInput"
      v-model.trim="playerName"
      class="input"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      maxlength="20"
      @keydown.enter="validateName"
      @input="handleInput"
    />
    <div class="char-count">{{ playerName ? playerName.length : 0 }}/20 caracteres</div>
    <v-button :title="buttonTitle" :is-loading="isLoading" @click.native="validateName" />
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import Button from '@/components/general/Button'
export default {
  components: {
    'v-button': Button
  },
  data() {
    return {
      label: 'Como devemos te chamar?',
      placeholder: 'Digite seu apelido',
      playerName: null,
      buttonTitle: 'Entrar no quiz',
      error: false
    }
  },
  computed: {
    isLoading() {
      return this.$store.state.playerStore.isLoading
    }
  },
  mounted() {
    // Auto-focus the input when component mounts
    this.$nextTick(() => {
      if (this.$refs.nameInput) {
        this.$refs.nameInput.focus()
      }
    })
  },
  watch: {
    playerName() {
      if (this.error) {
        this.error = false
        this.$emit('error', false)
      }
    }
  },
  methods: {
    handleInput(event) {
      // Trim to 20 characters
      if (this.playerName && this.playerName.length > 20) {
        this.playerName = this.playerName.substring(0, 20)
      }
    },
    
    validateName() {
      const name = this.playerName
      if (!name || name.length < 2) {
        this.error = 'O apelido deve ter pelo menos 2 caracteres'
        this.$emit('error', this.error)
        return
      }
      if (name) {
        this.registerNewPlayer()
      }
    },

    registerNewPlayer() {
      return this.$store
        .dispatch('playerStore/registerNewPlayer', this.playerName)
        .then(response => {
          if (!response) {
            this.error = 'Algo deu errado, por favor tente novamente.'
            this.$emit('error', this.error)
          } else {
            this.error = false
            this.$emit('error', false)
          }
        })
    }
  }
}
</script>

<style lang="sass" scoped>

.register-player
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  text-align: center

.input
  margin: 1rem
  color: inherit
  font: inherit
  outline: 0
  background: 0
  border: 1px solid $color-gray
  -webkit-appearance:none
  border-radius: $border-radius
  padding: 0.5rem 1rem
  text-align: center
  font-size: $font-size-large
  font-weight: 600
  max-width: 18rem
  width: 100%

.input::placeholder
  color: $color-gray--darker

.char-count
  font-size: 0.75rem
  color: $color-gray--darker
  margin-top: -0.5rem
  margin-bottom: 0.5rem

.error-message
  margin-top: 0.5rem
  max-width: 250px
  color: #ef4444
  font-weight: 600
</style>
