import {isEmpty} from 'lodash'
import axios from 'axios'
import {submitAnswerToQuestion} from '../squizzyServerApi'

// Variable for polling interval
let pollingInterval = null

const state = {
  isListening: false // boolean
}

const mutations = {
  SET_IS_LISTENING(state, status) {
    state.isListening = status
  }
}

const actions = {
  // Get the match to play
  async getMatchDetails({dispatch}, slug) {
    dispatch('stopListener')
    dispatch('matchStore/resetMatch', false, {root: true})
    
    try {
      const response = await axios.get(`/api/get-match-details?slug=${slug}`)
      const match = response.data
      
      if (isEmpty(match)) {
        return false
      }

      // Start the listener to get latest match updates
      dispatch('startListener', match.slug.current)

      // Set the match details
      dispatch('matchStore/setMatchDetails', match, {root: true})

      // Return to beforeEnter route on /match/:id
      return true
    } catch (error) {
      console.error('Error fetching match details:', error) // eslint-disable-line
      return false
    }
  },

  startListener({dispatch, rootGetters}, matchSlug) {
    const slug = matchSlug || rootGetters['matchStore/slug']
    if (slug) {
      // Stop any existing polling
      dispatch('stopListener')
      
      // Poll for updates every 2 seconds
      pollingInterval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/get-match-details?slug=${slug}`)
          const match = response.data
          dispatch('matchStore/setMatchDetails', match, {root: true})
        } catch (error) {
          console.error('Error polling match updates:', error) // eslint-disable-line
        }
      }, 2000)
      
      mutations.SET_IS_LISTENING(state, true)
    }
  },

  stopListener({state}) {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
      mutations.SET_IS_LISTENING(state, false)
    }
  },

  submitAnswer({rootState}, key) {
    const {playerStore, matchStore} = rootState
    const params = {
      playerId: playerStore.player.id,
      matchSlug: matchStore.match.slug.current,
      questionKey: matchStore.match.currentQuestionKey,
      selectedChoiceKey: key
    }
    return submitAnswerToQuestion(params)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
