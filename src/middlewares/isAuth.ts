/**********************************************************
*
*  isAuth middleware
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { verify } from 'jsonwebtoken'
import { NextFunction, Request, Response } from "express"
import { AuthError, InvalidAuthTokenError } from "../errors"
import * as env from '../env'

type AccessTokenData = {
	userId: number,
	userEmail: string
}

export function isAuth(
	req: Request, res: Response, next: NextFunction) {
	
	let token: string

	const authHeader = req.get('Authorization')
	if (authHeader)
		token = authHeader.split(' ')[1]
	else 
		token = req.signedCookies['access-token']
		
	if (!token)
		throw new AuthError()
	
	let decodedToken: AccessTokenData
	try { 
		decodedToken = 
			<AccessTokenData>verify(token, env.conf.jwtSecret)
	}
	catch (err) { 
		throw new InvalidAuthTokenError() 
	}
	
	res.setHeader("access-token", token)
	req.userId = decodedToken.userId

	next()
}


//---------------------------------------------------------
// Extending express requests
//---------------------------------------------------------

declare global {
	namespace Express {
		export interface Request {
				userId: number
		}
	}
}
