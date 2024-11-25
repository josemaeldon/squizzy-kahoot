const sanityClient = require('@sanity/client')
const {sanityClientConfig} = require('../sanityClientConfig')

if (sanityClientConfig.projectId === '009wvo1v') {
  console.error(
    'Please change the projectId in ./sanityClientConfig.js to match the projectId found in ./studio/sanity.json'
  )
}

export default sanityClient(sanityClientConfig)
