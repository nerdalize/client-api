import _ from 'lodash'

import Resource from './resource'

const ACCESS_TOKEN = 'fPGWFPjYv095Vj1o8XXAZ48CCUmIqv'


const METHOD_MAP = {
  'get': 'read',
  'post': '',
  'put': '',
  'patch': '',
  'delete': '',
}

function handleError (err) {
  if (err instanceof Promise) {
    return err.then(handleFinalError)
  } else {
    return handleFinalError(err)
  }
}
function handleFinalError (err) {
  console.error('Got error:', err)
  throw new Error('API Error')
}

function extractResources(api, paths) {

  // Strip the base part from the paths
  const regex = new RegExp(`^${api.base.pathname}/(\\w+)\/?(.+)?`)

  const resources = _.reduce(
    // resourceName => (endpoint, schema) mapping
    _.toPairs(paths).map(([path, schema]) => {
      const [_all, resource, endpoint = ''] = path.match(regex)

      return [resource, endpoint, schema]
    }),
    (result, [resource, endpoint, schema]) => {
      result[resource] = _.get(result, resource, [])
      result[resource].push({
        endpoint,
        methods: schema
      })
      return result
    },
    {}
  )
  console.log("Resources:", resources)
}

// function handleSuccess (data) {
//   // console.log("Received swagger spec:", data)

//   // Load resources from the paths object
//   const paths = data.paths


//   /*
//     resource -> endpoint -> methods
//     resource -> method(endpoint)
//   */

//   // _.forEach(resources, (endpoints, resource) => {
//   //   _.forEach(endpoints, (endpoint) => {
//   //     // _.forEach(methods, (description, method) => {
//   //       console.log('::',
//   //         resource, endpoint
//   //       )
//   //         // , method, description.operationId)

//   //     // })
      
//   //   })
//   // })

//   // console.log('keys', JSON.stringify(endpoints, null, 2))
//   // console.log('keys', endpoints)
//   // console.log('users', endpoints.users.endpoints)
// }



export function loadAsync (api, url) {
  console.log(`Calling url(${url})`, api.base)
  api.fetch(url, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
  })
    .then(resp => {
      // TODO: Content-Type checking
      if (resp.ok) {
        return resp.json()
      } else {
        throw resp.json()
        // throw new Error(`Error loading schema ${url}`)
      }
    })
    .then(data => {
      extractResources(api, data.paths)
    })
    .catch(handleError)
}
