/**********************************************************
*
*  Database
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { createConnection, getConnectionManager }
	from "typeorm"
import * as env from './env'

import User from './models/User'


export type Conf = {
	url?: string,
	host?: string,
	port?: number,
	username?: string,
	password?: string,
	database?: string,
}

export class Database {

	conf: Conf

	constructor(conf: Conf) {
		
		this.conf = conf
	}

	async connect() {
		
		const manager = getConnectionManager()
		if (manager.has('default')) {
			const con = manager.get('default')
			return con.isConnected ? con : await con.connect()
		}

		return await createConnection({
			type: "postgres", ...this.conf,
			entities: [ User ],
			synchronize: true,
			ssl: { rejectUnauthorized: false }
		})
	}

	close() {
		
		const manager = getConnectionManager()
		if (manager.has('default')) {
			const con = manager.get('default')
			if (con)
				con.close()
		}
	}
}

export const db = new Database(env.conf.db)
