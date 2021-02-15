/**********************************************************
*
*  Index - App entry point
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import path from 'path'
import { db } from "./database"
import * as env from './env'
import { conf as appConf } from './conf'
import { handleAppErrors, NotFoundError } from './errors'
import { getApiRoutes } from './controllers/'

import UsersController from './controllers/users'
import AuthController from './controllers/auth'


db.connect().then(async () => {

	const app = express()

	app.use(bodyParser.json())

	app.use(express
		.static(path.join(__dirname, '..', 'public')))

	app.use(morgan(env.isDev ? 'dev' : 'combined'))

	app.get('/', (req, res) => {

		req.body

		res.status(200).type('html')
			.send(`<title>${appConf.name} API</title>
				Welcome to the ${appConf.name} API !`)
	})

	app.use(getApiRoutes(UsersController))
	app.use(getApiRoutes(AuthController))

	app.use('*', (req, res, next) => {
			next(new NotFoundError())
	})

	handleAppErrors(app)
	
	app.listen(env.conf.port, () => {
		const msg = 
			'⚡️ Server running on port ' + env.conf.port
		console.log(msg)
	})

}).catch(console.error)


// Global express requests
declare global {
	namespace Express {
		export interface Request {
				userId: number
		}
	}
}
