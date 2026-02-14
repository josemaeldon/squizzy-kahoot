<template>
  <div class="admin">
    <div class="admin-container">
      <div class="admin-header">
        <h1 class="admin-title">Administração Squizzy</h1>
        <button class="btn btn-secondary" @click="logout">Sair</button>
      </div>
      
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
          <p class="help-text">Crie, edite e gerencie seus quizzes e perguntas.</p>
          <div class="action-buttons">
            <button class="btn btn-primary" @click="openCreateQuizForm">
              + Criar Novo Quiz
            </button>
          </div>
          
          <!-- Create/Edit Quiz Modal -->
          <div v-if="showQuizForm" class="form-modal" @click.self="closeQuizForm">
            <div class="form-content large">
              <h3>{{ editingQuiz ? 'Editar Quiz' : 'Criar Novo Quiz' }}</h3>
              <form @submit.prevent="saveQuiz">
                <div class="form-group">
                  <label>Título do Quiz *</label>
                  <input v-model="quizForm.title" type="text" required />
                </div>
                <div class="form-group">
                  <label>Descrição</label>
                  <textarea v-model="quizForm.description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Salvar</button>
                  <button type="button" class="btn btn-secondary" @click="closeQuizForm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Question Management Modal -->
          <div v-if="showQuestionManager" class="form-modal" @click.self="closeQuestionManager">
            <div class="form-content xlarge">
              <h3>Perguntas do Quiz: {{ selectedQuiz?.title }}</h3>
              
              <div class="questions-section">
                <button class="btn btn-primary btn-small" @click="openAddQuestionForm">
                  + Adicionar Pergunta
                </button>
                
                <div v-if="questions.length === 0" class="empty-message">
                  Nenhuma pergunta ainda. Adicione a primeira pergunta!
                </div>
                
                <div v-for="(question, index) in questions" :key="question.id" class="question-card">
                  <div class="question-header">
                    <span class="question-number">Pergunta {{ index + 1 }}</span>
                    <div class="question-actions">
                      <button class="btn btn-small" @click="editQuestion(question)">Editar</button>
                      <button class="btn btn-small btn-danger" @click="deleteQuestion(question.id)">
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div class="question-content">
                    <p class="question-text">{{ question.question_text }}</p>
                    <div class="question-meta">
                      <span>⏱️ {{ question.time_limit }}s</span>
                      <span>⭐ {{ question.points }} pontos</span>
                    </div>
                    <div class="choices-list">
                      <div
                        v-for="choice in question.choices"
                        :key="choice.id"
                        class="choice-item"
                        :class="{ correct: choice.is_correct }"
                      >
                        {{ choice.choice_text }}
                        <span v-if="choice.is_correct" class="correct-badge">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="closeQuestionManager">
                  Fechar
                </button>
              </div>
            </div>
          </div>

          <!-- Add/Edit Question Modal -->
          <div v-if="showQuestionForm" class="form-modal" @click.self="closeQuestionForm">
            <div class="form-content large">
              <h3>{{ editingQuestion ? 'Editar Pergunta' : 'Adicionar Pergunta' }}</h3>
              <form @submit.prevent="saveQuestion">
                <div class="form-group">
                  <label>Texto da Pergunta *</label>
                  <textarea v-model="questionForm.questionText" rows="3" required></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Tempo Limite (segundos)</label>
                    <input v-model.number="questionForm.timeLimit" type="number" min="5" max="120" />
                  </div>
                  <div class="form-group">
                    <label>Pontos</label>
                    <input v-model.number="questionForm.points" type="number" min="10" max="1000" step="10" />
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Alternativas</label>
                  <div v-for="(choice, index) in questionForm.choices" :key="index" class="choice-input">
                    <input
                      v-model="choice.choiceText"
                      type="text"
                      :placeholder="`Alternativa ${index + 1}`"
                      required
                    />
                    <label class="checkbox-label">
                      <input v-model="choice.isCorrect" type="checkbox" />
                      Correta
                    </label>
                    <button
                      v-if="questionForm.choices.length > 2"
                      type="button"
                      class="btn btn-small btn-danger"
                      @click="removeChoice(index)"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    v-if="questionForm.choices.length < 6"
                    type="button"
                    class="btn btn-small"
                    @click="addChoice"
                  >
                    + Adicionar Alternativa
                  </button>
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Salvar Pergunta</button>
                  <button type="button" class="btn btn-secondary" @click="closeQuestionForm">
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
                <small>{{ quiz.question_count || 0 }} pergunta(s)</small>
              </div>
              <div class="quiz-actions">
                <button class="btn btn-small btn-success" @click="manageQuestions(quiz)">
                  📝 Perguntas
                </button>
                <button class="btn btn-small" @click="editQuiz(quiz)">Editar</button>
                <button class="btn btn-small btn-danger" @click="deleteQuiz(quiz.id)">Excluir</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gerenciamento de Partidas -->
        <div v-if="activeSection === 'matches'" class="section">
          <h2>Gerenciar Partidas</h2>
          <p class="help-text">Crie e gerencie partidas de quiz com QR codes.</p>
          <div class="action-buttons">
            <button class="btn btn-primary" @click="openCreateMatchForm">
              + Criar Nova Partida
            </button>
          </div>

          <div v-if="showMatchForm" class="form-modal" @click.self="closeMatchForm">
            <div class="form-content">
              <h3>{{ editingMatch ? 'Editar Partida' : 'Criar Nova Partida' }}</h3>
              <form @submit.prevent="saveMatch">
                <div class="form-group">
                  <label>Selecionar Quiz *</label>
                  <select v-model="matchForm.quizId" required>
                    <option value="">Selecione um quiz</option>
                    <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
                      {{ quiz.title }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Slug da Partida (URL) *</label>
                  <input
                    v-model="matchForm.slug"
                    type="text"
                    placeholder="partida-demo"
                    pattern="[a-z0-9-]+"
                    title="Apenas letras minúsculas, números e hífens"
                    required
                  />
                  <small>Será acessível em: {{ getMatchUrl(matchForm.slug) }}</small>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Salvar</button>
                  <button type="button" class="btn btn-secondary" @click="closeMatchForm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Match QR Code Modal -->
          <div v-if="showQrCode" class="form-modal" @click.self="showQrCode = null">
            <div class="form-content">
              <h3>QR Code da Partida</h3>
              <div class="qr-code-container">
                <canvas ref="qrCodeCanvas"></canvas>
                <p class="match-url">{{ getMatchUrl(showQrCode) }}</p>
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" @click="copyMatchUrl(showQrCode)">
                  Copiar Link
                </button>
                <button class="btn btn-secondary" @click="showQrCode = null">
                  Fechar
                </button>
              </div>
            </div>
          </div>

          <div class="match-list">
            <p v-if="matches.length === 0" class="empty-message">
              Nenhuma partida criada ainda.
            </p>
            <div v-for="match in matches" :key="match.id" class="match-item">
              <div class="match-info">
                <h3>{{ match.quiz?.title || 'Quiz' }}</h3>
                <p>Slug: /match/{{ match.slug }}</p>
                <p>Status: <span class="status-badge" :class="match.status">{{ match.status }}</span></p>
                <small>{{ match.player_count || 0 }} jogador(es)</small>
              </div>
              <div class="match-actions">
                <button class="btn btn-small btn-success" @click="showMatchQrCode(match.slug)">
                  📱 QR Code
                </button>
                <button class="btn btn-small" @click="copyMatchUrl(match.slug)">
                  Copiar Link
                </button>
                <button class="btn btn-small btn-danger" @click="deleteMatch(match.id)">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Informações -->
        <div v-if="activeSection === 'info'" class="section">
          <h2>Bem-vindo à Administração</h2>
          <div class="info-box">
            <h3>Como usar o Squizzy</h3>
            <ol>
              <li><strong>1. Crie Quizzes:</strong> Vá para a aba "Quizzes" e crie um novo quiz com título e descrição</li>
              <li><strong>2. Adicione Perguntas:</strong> Clique em "Perguntas" para adicionar perguntas e alternativas ao quiz</li>
              <li><strong>3. Crie Partidas:</strong> Na aba "Partidas", crie uma nova partida baseada no quiz</li>
              <li><strong>4. Compartilhe:</strong> Use o QR Code ou copie o link para os jogadores entrarem</li>
              <li><strong>5. Gerencie:</strong> Edite ou exclua quizzes, perguntas e partidas conforme necessário</li>
            </ol>
            <div class="success-box">
              <h4>✅ Tudo Configurado!</h4>
              <p>Agora você pode criar e gerenciar quizzes sem precisar usar SQL diretamente!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import QRCode from 'qrcode'

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
      questions: [],
      selectedQuiz: null,
      editingQuiz: null,
      editingMatch: null,
      editingQuestion: null,
      showQuizForm: false,
      showMatchForm: false,
      showQuestionManager: false,
      showQuestionForm: false,
      showQrCode: null,
      quizForm: {
        title: '',
        description: ''
      },
      matchForm: {
        quizId: '',
        slug: ''
      },
      questionForm: {
        questionText: '',
        timeLimit: 20,
        points: 100,
        choices: [
          { choiceText: '', isCorrect: false },
          { choiceText: '', isCorrect: false },
          { choiceText: '', isCorrect: false },
          { choiceText: '', isCorrect: false }
        ]
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
        alert('Erro ao carregar quizzes')
      }
    },
    async loadMatches() {
      try {
        const response = await axios.get('/api/admin/matches')
        this.matches = response.data
      } catch (error) {
        console.error('Erro ao carregar partidas:', error)
        alert('Erro ao carregar partidas')
      }
    },
    async loadQuestions(quizId) {
      try {
        const response = await axios.get(`/api/admin/questions?quizId=${quizId}`)
        this.questions = response.data
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error)
        alert('Erro ao carregar perguntas')
      }
    },
    
    // Quiz methods
    openCreateQuizForm() {
      this.editingQuiz = null
      this.quizForm = { title: '', description: '' }
      this.showQuizForm = true
    },
    editQuiz(quiz) {
      this.editingQuiz = quiz
      this.quizForm = { 
        title: quiz.title, 
        description: quiz.description || '' 
      }
      this.showQuizForm = true
    },
    closeQuizForm() {
      this.showQuizForm = false
      this.editingQuiz = null
    },
    async saveQuiz() {
      try {
        if (this.editingQuiz) {
          await axios.put('/api/admin/quizzes', {
            id: this.editingQuiz.id,
            ...this.quizForm
          })
          alert('Quiz atualizado com sucesso!')
        } else {
          await axios.post('/api/admin/quizzes', this.quizForm)
          alert('Quiz criado com sucesso!')
        }
        this.closeQuizForm()
        await this.loadQuizzes()
      } catch (error) {
        console.error('Erro ao salvar quiz:', error)
        alert(error.response?.data?.error || 'Erro ao salvar quiz')
      }
    },
    async deleteQuiz(quizId) {
      if (!confirm('Tem certeza que deseja excluir este quiz? Todas as perguntas e partidas associadas também serão excluídas.')) {
        return
      }
      try {
        await axios.delete(`/api/admin/quizzes?id=${quizId}`)
        alert('Quiz excluído com sucesso!')
        await this.loadQuizzes()
      } catch (error) {
        console.error('Erro ao excluir quiz:', error)
        alert(error.response?.data?.error || 'Erro ao excluir quiz')
      }
    },
    
    // Question methods
    async manageQuestions(quiz) {
      this.selectedQuiz = quiz
      await this.loadQuestions(quiz.id)
      this.showQuestionManager = true
    },
    closeQuestionManager() {
      this.showQuestionManager = false
      this.selectedQuiz = null
      this.questions = []
    },
    openAddQuestionForm() {
      this.editingQuestion = null
      this.questionForm = {
        questionText: '',
        timeLimit: 20,
        points: 100,
        choices: [
          { choiceText: '', isCorrect: false },
          { choiceText: '', isCorrect: false },
          { choiceText: '', isCorrect: false },
          { choiceText: '', isCorrect: false }
        ]
      }
      this.showQuestionForm = true
    },
    editQuestion(question) {
      this.editingQuestion = question
      this.questionForm = {
        questionText: question.question_text,
        timeLimit: question.time_limit,
        points: question.points,
        choices: question.choices.map(c => ({
          choiceText: c.choice_text,
          isCorrect: c.is_correct
        }))
      }
      this.showQuestionForm = true
    },
    closeQuestionForm() {
      this.showQuestionForm = false
      this.editingQuestion = null
    },
    addChoice() {
      if (this.questionForm.choices.length < 6) {
        this.questionForm.choices.push({ choiceText: '', isCorrect: false })
      }
    },
    removeChoice(index) {
      if (this.questionForm.choices.length > 2) {
        this.questionForm.choices.splice(index, 1)
      }
    },
    async saveQuestion() {
      // Validate at least one correct answer
      const hasCorrectAnswer = this.questionForm.choices.some(c => c.isCorrect)
      if (!hasCorrectAnswer) {
        alert('Pelo menos uma alternativa deve ser marcada como correta!')
        return
      }
      
      // Validate all choices have text
      const allChoicesHaveText = this.questionForm.choices.every(c => c.choiceText.trim())
      if (!allChoicesHaveText) {
        alert('Todas as alternativas devem ter texto!')
        return
      }
      
      try {
        if (this.editingQuestion) {
          await axios.put('/api/admin/questions', {
            questionId: this.editingQuestion.id,
            ...this.questionForm
          })
          alert('Pergunta atualizada com sucesso!')
        } else {
          await axios.post('/api/admin/questions', {
            quizId: this.selectedQuiz.id,
            ...this.questionForm
          })
          alert('Pergunta adicionada com sucesso!')
        }
        this.closeQuestionForm()
        await this.loadQuestions(this.selectedQuiz.id)
        await this.loadQuizzes() // Refresh question count
      } catch (error) {
        console.error('Erro ao salvar pergunta:', error)
        alert(error.response?.data?.error || 'Erro ao salvar pergunta')
      }
    },
    async deleteQuestion(questionId) {
      if (!confirm('Tem certeza que deseja excluir esta pergunta?')) {
        return
      }
      try {
        await axios.delete(`/api/admin/questions?questionId=${questionId}`)
        alert('Pergunta excluída com sucesso!')
        await this.loadQuestions(this.selectedQuiz.id)
        await this.loadQuizzes() // Refresh question count
      } catch (error) {
        console.error('Erro ao excluir pergunta:', error)
        alert(error.response?.data?.error || 'Erro ao excluir pergunta')
      }
    },
    
    // Match methods
    openCreateMatchForm() {
      this.editingMatch = null
      this.matchForm = { quizId: '', slug: '' }
      this.showMatchForm = true
    },
    closeMatchForm() {
      this.showMatchForm = false
      this.editingMatch = null
    },
    async saveMatch() {
      try {
        if (this.editingMatch) {
          await axios.put('/api/admin/matches', {
            id: this.editingMatch.id,
            ...this.matchForm
          })
          alert('Partida atualizada com sucesso!')
        } else {
          await axios.post('/api/admin/matches', this.matchForm)
          alert('Partida criada com sucesso!')
        }
        this.closeMatchForm()
        await this.loadMatches()
      } catch (error) {
        console.error('Erro ao salvar partida:', error)
        alert(error.response?.data?.error || 'Erro ao salvar partida')
      }
    },
    async deleteMatch(matchId) {
      if (!confirm('Tem certeza que deseja excluir esta partida?')) {
        return
      }
      try {
        await axios.delete(`/api/admin/matches?id=${matchId}`)
        alert('Partida excluída com sucesso!')
        await this.loadMatches()
      } catch (error) {
        console.error('Erro ao excluir partida:', error)
        alert(error.response?.data?.error || 'Erro ao excluir partida')
      }
    },
    getMatchUrl(slug) {
      if (!slug) return ''
      return `${window.location.origin}/match/${slug}`
    },
    copyMatchUrl(slug) {
      const url = this.getMatchUrl(slug)
      navigator.clipboard.writeText(url).then(() => {
        alert(`Link copiado: ${url}`)
      }).catch(() => {
        alert(`Link da partida: ${url}`)
      })
    },
    async showMatchQrCode(slug) {
      this.showQrCode = slug
      await this.$nextTick()
      
      const canvas = this.$refs.qrCodeCanvas
      if (canvas) {
        const url = this.getMatchUrl(slug)
        try {
          await QRCode.toCanvas(canvas, url, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
        } catch (error) {
          console.error('Error generating QR code:', error)
          alert('Erro ao gerar QR code')
        }
      }
    },
    
    async logout() {
      try {
        await axios.post('/api/admin/logout')
        this.$router.push('/login')
      } catch (error) {
        console.error('Error logging out:', error)
        this.$router.push('/login')
      }
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

.admin-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 2rem

.admin-title
  font-size: 2rem
  color: #333
  margin: 0

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
  overflow-y: auto
  padding: 2rem

.form-content
  background: white
  border-radius: 1rem
  padding: 2rem
  max-width: 500px
  width: 90%
  max-height: 90vh
  overflow-y: auto
  margin: auto
  
  &.large
    max-width: 700px
  
  &.xlarge
    max-width: 900px
  
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
    font-family: inherit
    
    &:focus
      outline: none
      border-color: #667eea
  
  small
    display: block
    margin-top: 0.25rem
    color: #666
    font-size: 0.875rem

.form-row
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 1rem

.choice-input
  display: flex
  gap: 0.5rem
  align-items: center
  margin-bottom: 0.75rem
  
  input[type="text"]
    flex: 1
  
  .checkbox-label
    display: flex
    align-items: center
    gap: 0.25rem
    white-space: nowrap
    font-weight: normal
    
    input[type="checkbox"]
      width: auto
      margin: 0

.form-actions
  display: flex
  gap: 1rem
  justify-content: flex-end
  margin-top: 2rem

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
  
  small
    display: block
    color: #999
    font-size: 0.875rem
    margin-top: 0.25rem

.quiz-actions, .match-actions
  display: flex
  gap: 0.5rem
  flex-wrap: wrap

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

.success-box
  margin-top: 1.5rem
  padding: 1rem
  background: #f0fdf4
  border-left: 4px solid #48bb78
  border-radius: 0.25rem
  
  h4
    margin-top: 0
    color: #22c55e
  
  p
    margin: 0
    color: #166534

.questions-section
  margin: 1.5rem 0

.question-card
  background: #f7fafc
  border-radius: 0.5rem
  padding: 1rem
  margin-bottom: 1rem
  border-left: 4px solid #667eea

.question-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 1rem
  
  .question-number
    font-weight: 600
    color: #667eea

.question-actions
  display: flex
  gap: 0.5rem

.question-content
  .question-text
    font-weight: 600
    margin-bottom: 0.75rem
    color: #333
  
  .question-meta
    display: flex
    gap: 1rem
    margin-bottom: 0.75rem
    font-size: 0.875rem
    color: #666

.choices-list
  display: grid
  gap: 0.5rem

.choice-item
  padding: 0.5rem 0.75rem
  background: white
  border: 2px solid #e2e8f0
  border-radius: 0.375rem
  font-size: 0.875rem
  display: flex
  justify-content: space-between
  align-items: center
  
  &.correct
    border-color: #48bb78
    background: #f0fdf4
    color: #166534

.correct-badge
  color: #48bb78
  font-weight: bold

.status-badge
  display: inline-block
  padding: 0.25rem 0.5rem
  border-radius: 0.25rem
  font-size: 0.75rem
  font-weight: 600
  text-transform: uppercase
  
  &.waiting
    background: #fef3c7
    color: #92400e
  
  &.in_progress
    background: #dbeafe
    color: #1e40af
  
  &.completed
    background: #d1fae5
    color: #065f46

.qr-code-container
  display: flex
  flex-direction: column
  align-items: center
  gap: 1rem
  padding: 1rem
  
  canvas
    border: 2px solid #e2e8f0
    border-radius: 0.5rem
  
  .match-url
    font-family: monospace
    font-size: 0.875rem
    color: #666
    word-break: break-all
    text-align: center

@media (max-width: 768px)
  .admin
    padding: 1rem 0.5rem
  
  .admin-content
    padding: 1rem
  
  .form-content
    padding: 1rem
    
    &.large, &.xlarge
      max-width: 100%
  
  .form-row
    grid-template-columns: 1fr
  
  .quiz-item, .match-item
    flex-direction: column
    align-items: flex-start
</style>
