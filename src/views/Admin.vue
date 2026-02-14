<template>
  <div class="admin">
    <div class="admin-container">
      <h1 class="admin-title">Administração Squizzy</h1>
      
      <div class="admin-menu">
        <button
          v-for="section in sections"
          :key="section.id"
          class="menu-button"
          :class="{ active: activeSection === section.id }"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </button>
      </div>

      <div class="admin-content">
        <!-- Gerenciamento de Quizzes -->
        <div v-if="activeSection === 'quizzes'" class="section">
          <h2>Gerenciar Quizzes</h2>
          <p class="help-text">Aqui você pode criar, editar e excluir quizzes.</p>
          <div class="action-buttons">
            <button class="btn btn-primary" @click="showCreateQuizForm = true">
              + Criar Novo Quiz
            </button>
          </div>
          
          <div v-if="showCreateQuizForm" class="form-modal">
            <div class="form-content">
              <h3>Criar Novo Quiz</h3>
              <form @submit.prevent="createQuiz">
                <div class="form-group">
                  <label>Título do Quiz</label>
                  <input v-model="newQuiz.title" type="text" required />
                </div>
                <div class="form-group">
                  <label>Descrição</label>
                  <textarea v-model="newQuiz.description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Criar</button>
                  <button type="button" class="btn btn-secondary" @click="showCreateQuizForm = false">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="quiz-list">
            <p v-if="quizzes.length === 0" class="empty-message">
              Nenhum quiz criado ainda. Clique em "Criar Novo Quiz" para começar.
            </p>
            <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-item">
              <div class="quiz-info">
                <h3>{{ quiz.title }}</h3>
                <p>{{ quiz.description }}</p>
              </div>
              <div class="quiz-actions">
                <button class="btn btn-small">Editar</button>
                <button class="btn btn-small btn-danger">Excluir</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gerenciamento de Partidas -->
        <div v-if="activeSection === 'matches'" class="section">
          <h2>Gerenciar Partidas</h2>
          <p class="help-text">Aqui você pode criar e gerenciar partidas de quiz.</p>
          <div class="action-buttons">
            <button class="btn btn-primary" @click="showCreateMatchForm = true">
              + Criar Nova Partida
            </button>
          </div>

          <div v-if="showCreateMatchForm" class="form-modal">
            <div class="form-content">
              <h3>Criar Nova Partida</h3>
              <form @submit.prevent="createMatch">
                <div class="form-group">
                  <label>Selecionar Quiz</label>
                  <select v-model="newMatch.quizId" required>
                    <option value="">Selecione um quiz</option>
                    <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
                      {{ quiz.title }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Slug da Partida (URL)</label>
                  <input v-model="newMatch.slug" type="text" placeholder="partida-demo" required />
                  <small>Será acessível em: /match/{{ newMatch.slug }}</small>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Criar</button>
                  <button type="button" class="btn btn-secondary" @click="showCreateMatchForm = false">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="match-list">
            <p v-if="matches.length === 0" class="empty-message">
              Nenhuma partida criada ainda.
            </p>
            <div v-for="match in matches" :key="match.id" class="match-item">
              <div class="match-info">
                <h3>{{ match.quiz?.title || 'Quiz' }} - /match/{{ match.slug }}</h3>
                <p>Status: {{ match.status }}</p>
              </div>
              <div class="match-actions">
                <button class="btn btn-small btn-success" @click="copyMatchUrl(match.slug)">
                  Copiar Link
                </button>
                <button class="btn btn-small btn-danger">Excluir</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Informações -->
        <div v-if="activeSection === 'info'" class="section">
          <h2>Informações</h2>
          <div class="info-box">
            <h3>Como usar a administração</h3>
            <ol>
              <li><strong>Quizzes:</strong> Crie quizzes com perguntas e respostas</li>
              <li><strong>Partidas:</strong> Crie partidas baseadas nos seus quizzes</li>
              <li><strong>Compartilhe:</strong> Envie o link da partida para os jogadores entrarem</li>
            </ol>
            <p class="note">
              <strong>Nota:</strong> Para gerenciar questões e respostas, você precisará usar comandos SQL no banco de dados PostgreSQL.
              Em uma versão futura, teremos uma interface completa para isso.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Admin',
  data() {
    return {
      activeSection: 'info',
      sections: [
        { id: 'info', label: 'Informações' },
        { id: 'quizzes', label: 'Quizzes' },
        { id: 'matches', label: 'Partidas' }
      ],
      quizzes: [],
      matches: [],
      showCreateQuizForm: false,
      showCreateMatchForm: false,
      newQuiz: {
        title: '',
        description: ''
      },
      newMatch: {
        quizId: '',
        slug: ''
      }
    }
  },
  mounted() {
    this.loadQuizzes()
    this.loadMatches()
  },
  methods: {
    async loadQuizzes() {
      try {
        const response = await axios.get('/api/admin/quizzes')
        this.quizzes = response.data
      } catch (error) {
        console.error('Erro ao carregar quizzes:', error)
      }
    },
    async loadMatches() {
      try {
        const response = await axios.get('/api/admin/matches')
        this.matches = response.data
      } catch (error) {
        console.error('Erro ao carregar partidas:', error)
      }
    },
    async createQuiz() {
      try {
        await axios.post('/api/admin/quizzes', this.newQuiz)
        this.showCreateQuizForm = false
        this.newQuiz = { title: '', description: '' }
        await this.loadQuizzes()
        alert('Quiz criado com sucesso!')
      } catch (error) {
        console.error('Erro ao criar quiz:', error)
        alert('Erro ao criar quiz. Tente novamente.')
      }
    },
    async createMatch() {
      try {
        await axios.post('/api/admin/matches', this.newMatch)
        this.showCreateMatchForm = false
        this.newMatch = { quizId: '', slug: '' }
        await this.loadMatches()
        alert('Partida criada com sucesso!')
      } catch (error) {
        console.error('Erro ao criar partida:', error)
        alert('Erro ao criar partida. Tente novamente.')
      }
    },
    copyMatchUrl(slug) {
      const url = `${window.location.origin}/match/${slug}`
      navigator.clipboard.writeText(url).then(() => {
        alert(`Link copiado: ${url}`)
      }).catch(() => {
        alert(`Link da partida: ${url}`)
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.admin
  min-height: 100vh
  background: #f5f7fa
  padding: 2rem 1rem

.admin-container
  max-width: 1200px
  margin: 0 auto

.admin-title
  font-size: 2rem
  margin-bottom: 2rem
  color: #333

.admin-menu
  display: flex
  gap: 1rem
  margin-bottom: 2rem
  flex-wrap: wrap

.menu-button
  padding: 0.75rem 1.5rem
  background: white
  border: 2px solid #e2e8f0
  border-radius: 0.5rem
  font-size: 1rem
  font-weight: 600
  cursor: pointer
  transition: all 0.2s
  
  &:hover
    border-color: #667eea
    color: #667eea
  
  &.active
    background: #667eea
    color: white
    border-color: #667eea

.admin-content
  background: white
  border-radius: 1rem
  padding: 2rem
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05)

.section
  h2
    margin-bottom: 0.5rem
    color: #333
  
  .help-text
    color: #666
    margin-bottom: 1.5rem

.action-buttons
  margin-bottom: 2rem

.btn
  padding: 0.75rem 1.5rem
  border: none
  border-radius: 0.5rem
  font-size: 1rem
  font-weight: 600
  cursor: pointer
  transition: all 0.2s
  
  &.btn-primary
    background: #667eea
    color: white
    
    &:hover
      background: #5568d3
  
  &.btn-secondary
    background: #e2e8f0
    color: #333
    
    &:hover
      background: #cbd5e0
  
  &.btn-success
    background: #48bb78
    color: white
    
    &:hover
      background: #38a169
  
  &.btn-danger
    background: #f56565
    color: white
    
    &:hover
      background: #e53e3e
  
  &.btn-small
    padding: 0.5rem 1rem
    font-size: 0.875rem

.form-modal
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.5)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

.form-content
  background: white
  border-radius: 1rem
  padding: 2rem
  max-width: 500px
  width: 90%
  max-height: 90vh
  overflow-y: auto
  
  h3
    margin-bottom: 1.5rem
    color: #333

.form-group
  margin-bottom: 1.5rem
  
  label
    display: block
    margin-bottom: 0.5rem
    font-weight: 600
    color: #333
  
  input, textarea, select
    width: 100%
    padding: 0.75rem
    border: 2px solid #e2e8f0
    border-radius: 0.5rem
    font-size: 1rem
    
    &:focus
      outline: none
      border-color: #667eea
  
  small
    display: block
    margin-top: 0.25rem
    color: #666
    font-size: 0.875rem

.form-actions
  display: flex
  gap: 1rem
  justify-content: flex-end

.quiz-list, .match-list
  margin-top: 1rem

.quiz-item, .match-item
  background: #f7fafc
  border-radius: 0.5rem
  padding: 1.5rem
  margin-bottom: 1rem
  display: flex
  justify-content: space-between
  align-items: center
  flex-wrap: wrap
  gap: 1rem
  
  h3
    margin: 0 0 0.5rem 0
    color: #333
  
  p
    margin: 0
    color: #666

.quiz-actions, .match-actions
  display: flex
  gap: 0.5rem

.empty-message
  text-align: center
  color: #666
  padding: 2rem
  font-style: italic

.info-box
  background: #f7fafc
  border-left: 4px solid #667eea
  padding: 1.5rem
  border-radius: 0.5rem
  
  h3
    margin-top: 0
    color: #333
  
  ol
    margin: 1rem 0
    padding-left: 1.5rem
    
    li
      margin-bottom: 0.5rem
      color: #666
  
  .note
    margin-top: 1rem
    padding: 1rem
    background: #fff3cd
    border-left: 4px solid #ffc107
    border-radius: 0.25rem
    color: #856404
</style>
