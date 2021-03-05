/**********************************************************
*
*  Env conf
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import type { Conf as DBConf } from './database'
import dotenv from 'dotenv'


dotenv.config()

const requiredVars = [
	'JWT_SECRET',
	'JWT_REFRESH_SECRET',
	'COOKIE_SECRET',
]

const isProd = process.env.NODE_ENV == 'production'
const isStg = process.env.NODE_ENV == 'staging'
const isDev = !isProd && !isStg

export const conf = {
	name: process.env.NODE_ENV || 'local',
	port: process.env.PORT || 8080,
	db: {
		url: process.env.DATABASE_URL,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_NAME,
		username: process.env.DB_USER,
		password: process.env.DB_PASS
	} as DBConf,
	jwtSecret: 	process.env.JWT_SECRET!,
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
	cookieSecret: process.env.COOKIE_SECRET!,
	isProd, isStg, isDev
}


//---------------------------------------------------------
// Check if all required vars exists
//---------------------------------------------------------

// Getting missing vars
const missingRequiredVars = 
	requiredVars.filter(rv => !process.env[rv])

if (missingRequiredVars.length != 0) {
	
	// Log missing vars
	console.log("You are missing the following env var(s):")
	missingRequiredVars
		.forEach(rv => console.log(' - ' + rv))
	
	// Exit if env vars are missing
	process.exit(1)
}
