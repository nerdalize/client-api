
import fetch from 'node-fetch'
import URL from 'url-parse'
import URLjoin from 'url-join'

import * as swagger from './swagger'

class API {
  /*
   * Represents an api
   *
   */

  constructor (url) {
    this.base = url instanceof URL ? url : new URL(url)
    this.resources = {}

    console.log('Constructed API with base:', this.base)
  }

  // Constructs an API from the swagger url,
  // Will expose endpoints as resources, and discover the model definitions
  static swagger (url, swagger_url) {
    // const api = new API
    const api = new API(url)

    swagger.loadAsync(api, swagger_url)

    return api
  }

  fetch (uri, options = {}) {
    const url = URLjoin(this.base.href, uri)
    console.log(`fetch (${url})`, options)
    return fetch(url, options)
  }
}

export default API
