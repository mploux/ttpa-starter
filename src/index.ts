/**********************************************************
*
*  Index - App entry point
*  @author Marc <marcandre@ploux.fr>
*
**********************************************************/

import express from 'express'
import path from 'path'
import { db } from "./database"
import { conf as envConf } from './env'
import { conf as appConf } from './conf'
import { handleAppError, NotFoundError } from './errors'
import { getApiRoutes } from './controllers/'

import UsersController from './controllers/users'

db.connect().then(async () => {

	const app = express()

	app.use(express
		.static(path.join(__dirname, '..', 'public')))

	app.get('/', (req, res) => {
		res.status(200).type('html')
			.send(`<title>${appConf.name} API</title>
				Welcome to the ${appConf.name} API !`)
	})

	app.use(getApiRoutes(UsersController))

	app.use('*', (req, res, next) => {
			next(new NotFoundError())
	})

	handleAppError(app)
	
	app.listen(envConf.port, () => {
		console.log('⚡️ Server running on port ' + envConf.port)
	})

}).catch(console.error)

