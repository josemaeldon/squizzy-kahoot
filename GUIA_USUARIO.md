# Guia do Usuário - Squizzy

Este guia explica como usar o Squizzy para criar e gerenciar quizzes sem necessidade de conhecimento em SQL ou programação.

## Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Login no Painel Admin](#login-no-painel-admin)
3. [Criar um Quiz](#criar-um-quiz)
4. [Adicionar Perguntas](#adicionar-perguntas)
5. [Criar uma Partida](#criar-uma-partida)
6. [Compartilhar com Jogadores](#compartilhar-com-jogadores)
7. [Editar e Excluir Conteúdo](#editar-e-excluir-conteúdo)

## Configuração Inicial

Na primeira vez que você acessar o Squizzy, será redirecionado automaticamente para a página de configuração.

### Passo a Passo:

1. **Acesse a aplicação** no seu navegador (ex: `http://localhost:3000`)

2. **Você será redirecionado para `/setup`**

3. **Preencha os dados**:
   - **Nome de usuário do Admin**: Escolha um nome de usuário para o administrador
   - **Senha do Admin**: Crie uma senha segura (mínimo 8 caracteres)
   - **Confirmar Senha**: Digite a senha novamente
   - **Carregar dados de exemplo**: Marque esta opção se quiser dados de exemplo para teste

4. **Clique em "Concluir Configuração"**

5. **Aguarde**: O sistema irá criar o banco de dados e configurar tudo automaticamente

✅ **Pronto!** Sua instalação está completa.

## Login no Painel Admin

Após a configuração inicial, você precisa fazer login para acessar o painel administrativo.

### Como Fazer Login:

1. **Acesse** `http://seu-servidor/login`

2. **Digite suas credenciais**:
   - Nome de usuário que você criou na configuração
   - Senha que você criou na configuração

3. **Clique em "Entrar"**

4. **Você será redirecionado** para o painel administrativo (`/admin`)

## Criar um Quiz

Um quiz é uma coleção de perguntas sobre um tema específico.

### Passo a Passo:

1. **No painel admin**, clique na aba **"Quizzes"**

2. **Clique no botão** **"+ Criar Novo Quiz"**

3. **Preencha o formulário**:
   - **Título do Quiz**: Nome do seu quiz (ex: "Geografia do Brasil")
   - **Descrição**: Uma breve descrição do quiz (opcional)

4. **Clique em "Salvar"**

✅ **Seu quiz foi criado!** Agora você pode adicionar perguntas.

## Adicionar Perguntas

Depois de criar um quiz, você precisa adicionar perguntas e respostas.

### Passo a Passo:

1. **Na lista de quizzes**, encontre o quiz que você criou

2. **Clique no botão** **"📝 Perguntas"**

3. **Clique em** **"+ Adicionar Pergunta"**

4. **Preencha os dados da pergunta**:
   - **Texto da Pergunta**: Digite sua pergunta
   - **Tempo Limite**: Quantos segundos os jogadores têm para responder (padrão: 20)
   - **Pontos**: Quantos pontos vale a pergunta (padrão: 100)

5. **Adicione as alternativas** (mínimo 2, máximo 6):
   - Digite o texto de cada alternativa
   - **Marque "Correta"** para a(s) resposta(s) correta(s)
   - Você pode adicionar ou remover alternativas conforme necessário

6. **IMPORTANTE**: Pelo menos uma alternativa deve ser marcada como correta!

7. **Clique em "Salvar Pergunta"**

8. **Repita o processo** para adicionar mais perguntas ao seu quiz

### Dicas para Perguntas:

- ✅ Faça perguntas claras e objetivas
- ✅ Use alternativas plausíveis mas distintas
- ✅ Ajuste o tempo limite baseado na dificuldade
- ✅ Varie os pontos para perguntas de diferentes dificuldades

## Criar uma Partida

Uma partida é uma sessão de jogo baseada em um quiz. Jogadores entram na partida para responder as perguntas.

### Passo a Passo:

1. **No painel admin**, clique na aba **"Partidas"**

2. **Clique em** **"+ Criar Nova Partida"**

3. **Preencha o formulário**:
   - **Selecionar Quiz**: Escolha o quiz que você quer usar
   - **Slug da Partida**: Um nome único para a URL (ex: "partida-geografia")
     - Use apenas letras minúsculas, números e hífens
     - Exemplo: `partida-demo`, `quiz-matematica`, `teste-historia`

4. **Clique em "Salvar"**

✅ **Partida criada!** Agora você pode compartilhar com os jogadores.

## Compartilhar com Jogadores

Existem duas formas de compartilhar uma partida com os jogadores:

### Método 1: QR Code

1. **Na lista de partidas**, encontre a partida que você criou

2. **Clique no botão** **"📱 QR Code"**

3. **Um QR Code será exibido**:
   - Jogadores podem escanear com a câmera do celular
   - Serão redirecionados automaticamente para a partida

4. **Para fechar**, clique em "Fechar"

### Método 2: Link Direto

1. **Na lista de partidas**, encontre a partida que você criou

2. **Clique no botão** **"Copiar Link"**

3. **O link será copiado** para sua área de transferência

4. **Compartilhe o link** via:
   - WhatsApp
   - E-mail
   - Mensagem de texto
   - Qualquer outra forma

### Exemplo de Link:
```
http://seu-servidor/match/partida-geografia
```

## Editar e Excluir Conteúdo

Você pode editar ou excluir quizzes, perguntas e partidas a qualquer momento.

### Editar um Quiz

1. **Na aba "Quizzes"**, encontre o quiz

2. **Clique em "Editar"**

3. **Modifique** o título ou descrição

4. **Clique em "Salvar"**

### Editar uma Pergunta

1. **Clique em "📝 Perguntas"** no quiz

2. **Encontre a pergunta** que deseja editar

3. **Clique em "Editar"**

4. **Faça as alterações** necessárias

5. **Clique em "Salvar Pergunta"**

### Excluir Conteúdo

⚠️ **ATENÇÃO**: Exclusões são permanentes!

**Para excluir um quiz**:
- Clique em "Excluir" no quiz
- Confirme a exclusão
- ⚠️ Isso também excluirá todas as perguntas e partidas associadas

**Para excluir uma pergunta**:
- Entre nas perguntas do quiz
- Clique em "Excluir" na pergunta
- Confirme a exclusão

**Para excluir uma partida**:
- Na aba "Partidas", clique em "Excluir"
- Confirme a exclusão

### Sair do Painel Admin

Para fazer logout:
1. **Clique em "Sair"** no canto superior direito
2. Você será redirecionado para a página de login

## Perguntas Frequentes

### Como faço se esquecer minha senha?

Atualmente, você precisará redefinir a senha diretamente no banco de dados PostgreSQL. Em versões futuras, teremos uma função de recuperação de senha.

### Posso criar múltiplos usuários admin?

Atualmente, apenas um usuário admin é suportado através da configuração inicial. Em versões futuras, você poderá criar múltiplos usuários admin.

### Quantas perguntas posso adicionar a um quiz?

Não há limite! Você pode adicionar quantas perguntas desejar.

### Quantas alternativas posso ter por pergunta?

Entre 2 e 6 alternativas por pergunta.

### Posso ter múltiplas respostas corretas?

Sim! Você pode marcar múltiplas alternativas como corretas.

### Como sei quantos jogadores estão em uma partida?

Na aba "Partidas", cada partida mostra o número de jogadores.

### Posso reutilizar um quiz em múltiplas partidas?

Sim! Você pode criar várias partidas diferentes usando o mesmo quiz.

### O que acontece se eu excluir um quiz com partidas ativas?

Todas as partidas associadas ao quiz também serão excluídas automaticamente.

## Suporte

Se você tiver problemas ou dúvidas:

1. Verifique este guia primeiro
2. Consulte o README.md do projeto
3. Abra uma issue no GitHub: https://github.com/josemaeldon/squizzy-kahoot/issues

## Aproveite o Squizzy! 🎮
