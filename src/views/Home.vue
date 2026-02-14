<template>
  <div class="home">
    <squizzy-squid :mouth="expression.mouth" class="home-squizzy" />
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-subtitle">{{ subtitle }}</p>
    
    <div class="actions">
      <button class="btn btn-primary" @click="showPinModal = true">
        Entrar em uma Partida
      </button>
    </div>

    <!-- PIN Entry Modal -->
    <div v-if="showPinModal" class="modal-overlay" @click.self="closePinModal">
      <div class="modal-content">
        <h2>Digite o PIN da Partida</h2>
        <p class="modal-subtitle">Insira o código de 4 dígitos fornecido pelo Squizzmaster</p>
        
        <div class="pin-input-container">
          <input
            v-for="(digit, index) in pinDigits"
            :key="index"
            :ref="`pinInput${index}`"
            v-model="pinDigits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="pin-digit"
            @input="handlePinInput(index)"
            @keydown="handleKeyDown($event, index)"
          />
        </div>
        
        <p v-if="error" class="error-message">{{ error }}</p>
        
        <div class="modal-actions">
          <button class="btn btn-primary" :disabled="isLoading || !isPinComplete" @click="joinByPin">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
          <button class="btn btn-secondary" @click="closePinModal">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SquizzySquid from '@/components/general/SquizzySquid'
import axios from 'axios'

export default {
  components: {
    SquizzySquid
  },
  data() {
    return {
      title: 'Bem-vindo ao Squizzy!',
      subtitle: 'Para jogar, encontre um código QR para escanear ou clique no botão abaixo',
      expression: {mouth: 'happy'},
      showPinModal: false,
      pinDigits: ['', '', '', ''],
      error: '',
      isLoading: false
    }
  },
  computed: {
    isPinComplete() {
      return this.pinDigits.every(digit => digit !== '')
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
  },
  methods: {
    handlePinInput(index) {
      // Keep only numbers
      const value = this.pinDigits[index].replace(/[^0-9]/g, '')
      this.pinDigits[index] = value
      
      // Clear error when user starts typing
      if (this.error) {
        this.error = ''
      }
      
      // Auto-focus next input
      if (value && index < 3) {
        this.$nextTick(() => {
          const nextInput = this.$refs[`pinInput${index + 1}`]
          if (nextInput && nextInput[0]) {
            nextInput[0].focus()
          }
        })
      }
    },
    
    handleKeyDown(event, index) {
      // Handle backspace to go to previous input
      if (event.key === 'Backspace' && !this.pinDigits[index] && index > 0) {
        this.$nextTick(() => {
          const prevInput = this.$refs[`pinInput${index - 1}`]
          if (prevInput && prevInput[0]) {
            prevInput[0].focus()
          }
        })
      }
      
      // Handle Enter key to submit
      if (event.key === 'Enter' && this.isPinComplete) {
        this.joinByPin()
      }
    },
    
    async joinByPin() {
      if (!this.isPinComplete || this.isLoading) return
      
      this.isLoading = true
      this.error = ''
      
      const pin = this.pinDigits.join('')
      
      try {
        const response = await axios.get(`/api/join-match-by-pin?pin=${pin}`)
        const { slug } = response.data
        
        // Redirect to the match
        this.$router.push(`/match/${slug}`)
      } catch (error) {
        console.error('Error joining match:', error)
        if (error.response && error.response.status === 404) {
          this.error = 'PIN inválido ou partida não encontrada'
        } else {
          this.error = 'Erro ao entrar na partida. Tente novamente.'
        }
      } finally {
        this.isLoading = false
      }
    },
    
    closePinModal() {
      this.showPinModal = false
      this.pinDigits = ['', '', '', '']
      this.error = ''
    }
  }
}
</script>

<style lang="sass" scoped>
.home-squizzy
  max-height: 250px

.actions
  margin-top: 2rem
  display: flex
  justify-content: center
  gap: 1rem

.btn
  padding: 1rem 2rem
  font-size: 1.125rem
  font-weight: 600
  border: none
  border-radius: 0.5rem
  cursor: pointer
  transition: all 0.2s
  
  &.btn-primary
    background: #667eea
    color: white
    
    &:hover:not(:disabled)
      background: #5568d3
    
    &:disabled
      opacity: 0.5
      cursor: not-allowed
  
  &.btn-secondary
    background: #e2e8f0
    color: #333
    
    &:hover
      background: #cbd5e0

.modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.7)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000
  padding: 1rem

.modal-content
  background: white
  border-radius: 1rem
  padding: 2rem
  max-width: 400px
  width: 100%
  text-align: center
  
  h2
    margin: 0 0 0.5rem 0
    color: #333
    font-size: 1.5rem
  
  .modal-subtitle
    color: #666
    margin-bottom: 2rem

.pin-input-container
  display: flex
  justify-content: center
  gap: 0.75rem
  margin-bottom: 1rem

.pin-digit
  width: 3.5rem
  height: 3.5rem
  font-size: 2rem
  text-align: center
  border: 2px solid #e2e8f0
  border-radius: 0.5rem
  font-weight: 600
  transition: border-color 0.2s
  
  &:focus
    outline: none
    border-color: #667eea

.error-message
  color: #ef4444
  font-size: 0.875rem
  margin: 0.5rem 0

.modal-actions
  display: flex
  gap: 0.75rem
  justify-content: center
  margin-top: 1.5rem
  
  .btn
    padding: 0.75rem 1.5rem
    font-size: 1rem

@media (max-width: 480px)
  .pin-digit
    width: 3rem
    height: 3rem
    font-size: 1.75rem
  
  .pin-input-container
    gap: 0.5rem
</style>
