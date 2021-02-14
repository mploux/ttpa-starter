/**********************************************************
*
*  isAuth middleware
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { verify } from 'jsonwebtoken'
import { NextFunction, Request, Response } from "express"
import { AuthError } from "../errors";
import { conf as envConf } from '../env'

type AccessTokenData = {
	userId: number,
	userEmail: string
}

export function isAuth(
	req: Request, res: Response, next: NextFunction) {
	
	const authHeader = req.get('Authorization')
	if (!authHeader)
		throw new AuthError()

	const token = authHeader.split(' ')[1]
	
	let decodedToken
	try { 
		decodedToken = 
			<AccessTokenData>verify(token, envConf.jwtSecret)
	}
	catch (err) { throw err }
	
	res.setHeader("access-token", token)
	req.userId = decodedToken.userId

	next()
}

