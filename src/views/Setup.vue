<template>
  <div class="setup">
    <div class="setup-container">
      <h1 class="setup-title">Configuração do Squizzy</h1>
      <p class="setup-subtitle">Configure sua instalação do Squizzy</p>
      
      <div v-if="!setupComplete" class="setup-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="adminUsername">Nome de usuário do Admin</label>
          <input
            id="adminUsername"
            v-model="adminUsername"
            type="text"
            placeholder="Digite o nome de usuário do admin"
            class="form-input"
            :disabled="processing"
          />
        </div>
        
        <div class="form-group">
          <label for="adminPassword">Senha do Admin</label>
          <input
            id="adminPassword"
            v-model="adminPassword"
            type="password"
            placeholder="Digite a senha do admin (mínimo 8 caracteres)"
            class="form-input"
            :disabled="processing"
          />
        </div>
        
        <div class="form-group">
          <label for="adminPasswordConfirm">Confirmar Senha</label>
          <input
            id="adminPasswordConfirm"
            v-model="adminPasswordConfirm"
            type="password"
            placeholder="Confirme a senha do admin"
            class="form-input"
            :disabled="processing"
          />
        </div>
        
        <div class="form-group checkbox-group">
          <label>
            <input
              v-model="loadSampleData"
              type="checkbox"
              :disabled="processing"
            />
            Carregar dados de quiz de exemplo
          </label>
        </div>
        
        <button
          class="setup-button"
          :disabled="processing || !isFormValid"
          @click="completeSetup"
        >
          {{ processing ? 'Configurando...' : 'Concluir Configuração' }}
        </button>
      </div>
      
      <div v-if="setupComplete" class="success-message">
        <h2>Configuração Concluída!</h2>
        <p>Sua instalação do Squizzy está pronta para uso.</p>
        <button class="setup-button" @click="goHome">
          Ir para a Página Inicial
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Setup',
  data() {
    return {
      adminUsername: '',
      adminPassword: '',
      adminPasswordConfirm: '',
      loadSampleData: true,
      processing: false,
      error: '',
      setupComplete: false
    }
  },
  computed: {
    isFormValid() {
      return (
        this.adminUsername.length > 0 &&
        this.adminPassword.length >= 8 &&
        this.adminPassword === this.adminPasswordConfirm
      )
    }
  },
  async mounted() {
    // Component is mounted, ready for setup
  },
  methods: {
    async completeSetup() {
      this.error = ''
      this.processing = true
      
      try {
        const response = await axios.post('/api/setup', {
          adminUsername: this.adminUsername,
          adminPassword: this.adminPassword,
          loadSampleData: this.loadSampleData
        })
        
        if (response.data.success) {
          this.setupComplete = true
        } else {
          this.error = response.data.message || 'Configuração falhou. Por favor, tente novamente.'
        }
      } catch (error) {
        console.error('Error completing setup:', error)
        this.error = error.response?.data?.error || 'Configuração falhou. Por favor, verifique sua configuração.'
      } finally {
        this.processing = false
      }
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="sass" scoped>
.setup
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  padding: 2rem
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

.setup-container
  max-width: 500px
  width: 100%
  background: white
  border-radius: 1rem
  padding: 2rem
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1)

.setup-title
  font-size: 2rem
  font-weight: bold
  color: #333
  margin-bottom: 0.5rem
  text-align: center

.setup-subtitle
  font-size: 1rem
  color: #666
  margin-bottom: 2rem
  text-align: center

.setup-form
  display: flex
  flex-direction: column
  gap: 1.5rem

.form-group
  display: flex
  flex-direction: column
  gap: 0.5rem

.form-group label
  font-size: 0.9rem
  font-weight: 600
  color: #333

.form-input
  padding: 0.75rem
  border: 2px solid #e2e8f0
  border-radius: 0.5rem
  font-size: 1rem
  transition: border-color 0.2s
  
  &:focus
    outline: none
    border-color: #667eea
  
  &:disabled
    background-color: #f7fafc
    cursor: not-allowed

.checkbox-group label
  display: flex
  align-items: center
  gap: 0.5rem
  font-weight: normal
  cursor: pointer

.checkbox-group input[type="checkbox"]
  width: 1.25rem
  height: 1.25rem
  cursor: pointer

.setup-button
  padding: 0.875rem
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  color: white
  border: none
  border-radius: 0.5rem
  font-size: 1rem
  font-weight: 600
  cursor: pointer
  transition: transform 0.2s, box-shadow 0.2s
  
  &:hover:not(:disabled)
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4)
  
  &:disabled
    opacity: 0.6
    cursor: not-allowed
    transform: none

.error-message
  padding: 1rem
  background: #fee
  border: 1px solid #fcc
  border-radius: 0.5rem
  color: #c33
  font-size: 0.9rem

.success-message
  text-align: center
  
  h2
    font-size: 1.5rem
    color: #22c55e
    margin-bottom: 1rem
  
  p
    font-size: 1rem
    color: #666
    margin-bottom: 2rem

.loading
  text-align: center
  color: #666
  font-size: 1rem
</style>
