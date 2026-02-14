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
let setupChecked = false
router.beforeEach(async (to, from, next) => {
  // Skip setup check if already on setup page or if we've already checked
  if (to.path === '/setup' || setupChecked) {
    next()
    return
  }
  
  try {
    const response = await axios.get('/api/setup-status')
    setupChecked = true
    
    if (response.data.needsSetup) {
      // Redirect to setup if database is not initialized
      next('/setup')
    } else {
      next()
    }
  } catch (error) {
    console.error('Error checking setup status:', error)
    // Continue navigation even if setup check fails
    next()
  }
})

export default router
