/**********************************************************
*
*  Index - App entry point
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import path from 'path'
import { db } from "./database"
import { conf as env } from './env'
import pkg from '../package.json'
import { handleAppErrors, NotFoundError } from './errors'
import { getApiRoutes } from './controllers/'

import UsersController from './controllers/Users'
import AuthController from './controllers/Auth'


db.connect().then(async () => {

	const app = express()

	app.use(cors({
		origin: 'http://localhost:1234',
		credentials: true
	}))
	app.use(bodyParser.json())
	app.use(cookieParser(env.cookieSecret))

	app.use(express
		.static(path.join(__dirname, '..', 'public')))

	app.use(morgan(env.isDev ? 'dev' : 'combined'))

	app.get('/', (req, res) => {

		res.status(200).type('html')
			.send(`<title>${pkg.name} API</title>
				Welcome to the ${pkg.name} API !`)
	})

	app.use(getApiRoutes(UsersController))
	app.use(getApiRoutes(AuthController))

	app.use('*', (req, res, next) => {
			next(new NotFoundError())
	})

	handleAppErrors(app)
	
	app.listen(env.port, () => {
		console.log('⚡️ Listening on port ' + env.port)
	})

}).catch(console.error)
