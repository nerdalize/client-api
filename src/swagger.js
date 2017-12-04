import _ from 'lodash'

import Resource from './resource'
import Model from './model'

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

  api.resources = _.fromPairs(
    _.map(resources, (endpoints, name) => [name, constructResource(api, name, endpoints)])
  )
}

const standardOperations = [
  // Resource operations
  /* post   */ 'create',
  /* get    */ 'list',

  // Instance operations
  /* delete */ 'delete',
  /* patch  */ 'partial_update',
  /* get    */ 'read',
  /* put    */ 'update',
]

function constructResource(api, name, endpoints) {
  const operationRe = new RegExp(`^${name}_(.+)$`)
  const instanceRe = new RegExp('\{(.+?)\}')

  class ResourceModel extends Model {}
  const resource = new Resource(api, ResourceModel)

  // console.log("*************************************")
  console.log("Parsing:", name)

  // Extract the endpoints and construct the calls to create the resource.
  _.map(endpoints, endpoint => {
    const idMatch = endpoint.endpoint.match(instanceRe)
    let instanceId

    if (idMatch) {
      instanceId = idMatch[1]
    }

    _.map(endpoint.methods, (definition, method) => {
      const [_all, operation, ...__] = definition.operationId.match(operationRe)

      // Determine whether the operation is on instance level or resource level.
      let s = '\t'
      if (_.includes(standardOperations, operation)) {

        if (!instanceId) {
          resource[operation] = ((api) => (options) => api.fetchJSON(null, options) )(api.join(name, { method }))
        } else {
          ResourceModel[operation] = ((api) => (options) => api.fetchJSON(null, options) )(api.join(`${name}/${endpoint.endpoint}`, { method }))
        }

      } else {
        s += "Custom :"
      }
      if (instanceId) {
        s += 'instance::'+instanceId
      } else {
        s += 'resource'
      }
      console.log(s, method, operation)
    })
  })

  // console.log("Constructed resource:", name, resource)
  // console.log("___________________________________________\n", ResourceModel)
  // console.dir(ResourceModel)
  // // console.log("Constructed resource:", resource.constructor)

  return resource
}

export function loadAsync (api, url) {

  api.loading = api.fetch(url)
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
      api.loading.resolve
      extractResources(api, data.paths)
    })
    .catch(handleError)
}
