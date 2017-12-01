
import { API } from './src'
// Setup api's and model relations here... 

const url = 'http://local.dev.nlze.nl:8000/v1'

const authentication = API.swagger(url, 'schema')
  // .then(console.log.bind(console, `Usage test:" (${url})`))
  // .catch(err => console.error('Usage error', err))

// Figure out authentication before api discovery


/*

// get all users
authentication.resources.users.list()
// -> [user]

// get user id=1 (could be resolved by checking the url structure and var name in swagger)
authentication.resources.users.get(1)
// -> user

// user.save() // Either puts or patches the object user.save -> endpoint(user).patch -> api(uri, {})


*/
