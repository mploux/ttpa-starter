/**********************************************************
*
*  Index
*  @author Marc <marcandre@ploux.fr>
*
**********************************************************/

import express from 'express'
import { db } from "./database"
import { conf as envConf } from './env'


db.connect().then(async con => {

	console.log('Server connected on port ' + envConf.port)

})

