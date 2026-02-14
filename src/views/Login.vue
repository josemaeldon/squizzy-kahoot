<template>
  <div class="login">
    <div class="login-container">
      <h1 class="login-title">Login Admin - Squizzy</h1>
      <p class="login-subtitle">Entre com suas credenciais</p>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form class="login-form" @submit.prevent="login">
        <div class="form-group">
          <label for="username">Nome de usuário</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Digite seu nome de usuário"
            class="form-input"
            :disabled="processing"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Digite sua senha"
            class="form-input"
            :disabled="processing"
            required
          />
        </div>
        
        <button
          type="submit"
          class="login-button"
          :disabled="processing"
        >
          {{ processing ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      processing: false,
      error: ''
    }
  },
  methods: {
    async login() {
      this.error = ''
      this.processing = true
      
      try {
        const response = await axios.post('/api/admin/login', {
          username: this.username,
          password: this.password
        })
        
        if (response.data.success) {
          // Redirect to admin page
          this.$router.push('/admin')
        } else {
          this.error = 'Erro ao fazer login'
        }
      } catch (error) {
        console.error('Error logging in:', error)
        this.error = error.response?.data?.error || 'Usuário ou senha incorretos'
      } finally {
        this.processing = false
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.login
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  padding: 2rem
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

.login-container
  max-width: 400px
  width: 100%
  background: white
  border-radius: 1rem
  padding: 2rem
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1)

.login-title
  font-size: 2rem
  font-weight: bold
  color: #333
  margin-bottom: 0.5rem
  text-align: center

.login-subtitle
  font-size: 1rem
  color: #666
  margin-bottom: 2rem
  text-align: center

.login-form
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

.login-button
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
  text-align: center
</style>
