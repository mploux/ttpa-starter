/**********************************************************
*
*  Env conf
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import type { Conf as DBConf } from './database'
import dotenv from 'dotenv'


dotenv.config()


export type EnvConf = {
	name: string,
	port: number,
	db: DBConf,
}


//---------------------------------------------------------
// Check if all required vars exists
//---------------------------------------------------------

const requiredVars = [
	'DB_HOST',
	'DB_NAME',
	'DB_USER',
	'DB_PASS',
]

const missingRequiredVars = 
	requiredVars.filter(rv => !process.env[rv])

if (missingRequiredVars.length != 0) {
	
	// Log missing vars
	console.log("You are missing the following env var(s):")
	missingRequiredVars
		.forEach(rv => console.log(' - ' + rv))
	
	// Exit
	process.exit(1)
}


//---------------------------------------------------------
// Export env conf
//---------------------------------------------------------

export const conf = {
	name: process.env.NODE_ENV || 'local',
	port: process.env.PORT || 8080,
	db: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_NAME,
		username: process.env.DB_USER,
		password: process.env.DB_PASS
	}
} as EnvConf
