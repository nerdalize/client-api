import _ from 'lodash'
import { action } from 'mobx'

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

  class ResourceModel extends Model {
    static schema = {}
  }

  const resource = new Resource(ResourceModel)

  console.log("****************************************************************")
  console.log("Parsing:", name)

  // Extract the endpoints and construct the calls to create the resource.
  _.forEach(endpoints, endpoint => {
    const idMatch = endpoint.endpoint.match(instanceRe)
    let instanceId

    if (idMatch) {
      instanceId = idMatch[1]
    }

    _.forEach(endpoint.methods, (definition, method) => {
      const [_all, operation, ...__] = definition.operationId.match(operationRe)

      const bodyParam = _.find(definition.parameters, param => param.in === 'body')
      if (bodyParam && ('schema' in bodyParam)) {
        _.defaultsDeep(ResourceModel.schema, bodyParam.schema)
      }

      // Determine whether the operation is on instance level or resource level.
      let s = '\t'
      if (_.includes(standardOperations, operation)) {

        if (!instanceId) {
          resource[operation] = ((api) => (options) => api.fetchJSON(null, options) )(api.join(name, { method }))
        } else {
          ResourceModel.prototype[operation] = ((api) => (options) => api.fetchJSON(null, options) )(api.join(`${name}/${endpoint.endpoint}`, { method }))
        }

      } else {
        // TODO: Handle custom endpoints.
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

  console.log("Constructed schema:", name, ResourceModel)
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
      }
    })
    .then(action('swaggerAsyncLoaded', data => {
      extractResources(api, data.paths)
      api.loaded = true
      console.log('API loaded')
    }))
    .catch(handleError)
}
