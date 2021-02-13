/**********************************************************
*
*  Index - App entry point
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import { db } from "./database"
import { conf as envConf } from './env'
import { conf as appConf } from './conf'
import { handleAppErrors, NotFoundError } from './errors'
import { getApiRoutes } from './controllers/'

import UsersController from './controllers/users'


db.connect().then(async () => {

	const app = express()

	app.use(bodyParser.json())

	app.use(express
		.static(path.join(__dirname, '..', 'public')))

	app.get('/', (req, res) => {

		req.body

		res.status(200).type('html')
			.send(`<title>${appConf.name} API</title>
				Welcome to the ${appConf.name} API !`)
	})

	app.use(getApiRoutes(UsersController))
	// app.use(getApiRoutes(FeedController))
	// app.use(getApiRoutes(BlogController))

	app.use('*', (req, res, next) => {
			next(new NotFoundError())
	})

	handleAppErrors(app)
	
	app.listen(envConf.port, () => {
		const msg = 
			'⚡️ Server running on port ' + envConf.port
		console.log(msg)
	})

}).catch(console.error)
