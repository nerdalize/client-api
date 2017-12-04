import _ from 'lodash'

import fetch from 'node-fetch'
import URL from 'url-parse'
import URLjoin from 'url-join'

import * as swagger from './swagger'

class API {
  /*
   * Represents an api
   *
   */

  constructor (url, options = {}, auth_store) {
    this.base = url instanceof URL ? url : new URL(url)
    this.options = options
    this.auth_store = auth_store
  }

  toString() {
    return "API"
  }

  // Constructs an API from the swagger url,
  // Will expose endpoints as resources, and discover the model definitions
  static swagger (url, swagger_url, auth_store) {
    // const api = new API
    const api = new API(url, {}, auth_store)

    swagger.loadAsync(api, swagger_url)

    return api
  }

  join (uri, options={}) {
    // Returns a new api instance with uri joined.
    return new API(
      URLjoin(this.base.toString(), uri),
      {...this.options, ...options},
      this.auth_store
    )
  }

  fetch (uri, options = {}) {
    const url = URLjoin(this.base.href, uri)
    const opts = {...this.options, ...options}
    const opts2 = {
      ...opts,
      headers: {
        'Authorization': `Bearer ${this.auth_store.ACCESS_TOKEN}`,
        ...opts.headers,      
      }
    }
    console.log(`fetching ${_.get(opts2, 'method', 'get')}(${url})`)

    return fetch(url, opts2)
  }

  fetchJSON(uri, options = {}) {
    return this.fetch(uri, options)
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          return 'Error happened'
        }
      })
  }

  get(uri, options) {
    return this.fetch(uri, {
      method: 'get', 
      ...options
    })
  }
  post(options) {
    return this.fetch(uri, {
      method: 'post', 
      ...options
    })
  }
  put(options) {
    return this.fetch(uri, {
      method: 'put', 
      ...options
    })
  }
  patch(options) {
    return this.fetch(uri, {
      method: 'patch', 
      ...options
    })
  }
  delete(options) {
    return this.fetch(uri, {
      method: 'delete', 
      ...options
    })
  }

}

export default API
