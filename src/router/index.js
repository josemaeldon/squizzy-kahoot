import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import axios from 'axios'
import Home from '../views/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: '/setup',
    name: 'setup',
    component: () => import(/* webpackChunkName: "setup" */ '../views/Setup.vue')
  },
  {
    path: '*',
    redirect: '/'
  },
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/match/:slug',
    name: 'match',
    component: () => import(/* webpackChunkName: "match" */ '../views/Match.vue'),
    async beforeEnter(to, from, next) {
      try {
        const isMatch = await store.dispatch('client/getMatchDetails', to.params.slug)
        isMatch
          ? next()
          : next({
              name: 'home',
              params: {
                title: 'Match not found!',
                subtitle: 'Please scan another QR code to try again.'
              }
            })
      } catch (error) {
        console.error(error) // eslint-disable-line
      }
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Global navigation guard to check setup status
let setupCheckPromise = null

router.beforeEach(async (to, from, next) => {
  // Skip setup check if already on setup page
  if (to.path === '/setup') {
    next()
    return
  }
  
  // Reuse existing setup check promise if one is in flight
  if (!setupCheckPromise) {
    setupCheckPromise = axios.get('/api/setup-status')
      .then(response => response.data)
      .catch(error => {
        console.error('Error checking setup status:', error)
        // Return null to indicate failure
        return null
      })
  }
  
  try {
    const setupStatus = await setupCheckPromise
    
    if (!setupStatus) {
      // Setup check failed - show error in console but allow navigation
      console.error('Failed to check setup status. Application may not be properly initialized.')
      next()
      return
    }
    
    if (setupStatus.needsSetup) {
      // Redirect to setup if database is not initialized
      next('/setup')
    } else {
      next()
    }
  } catch (error) {
    console.error('Unexpected error in navigation guard:', error)
    next()
  }
})

export default router
