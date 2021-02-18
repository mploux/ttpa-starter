/**********************************************************
*
*  isAuth middleware
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { NextFunction, Request, Response } from "express"
import { InvalidAuthTokenError } from "../errors"
import * as env from '../env'
import User from '../models/User'
import { decryptToken, encryptAccessToken } from '../tokens'


/**
 * Route is protected by authentication
 */
export async function isAuth(
	req: Request, res: Response, next: NextFunction) {
	
	// Getting tokens
	let token = getToken(req)
	let refreshToken = getRefreshToken(req)
	
	// Verifying tokens 
	if (!token || !refreshToken)
		return next(new InvalidAuthTokenError())
	
	const { jwtSecret, jwtRefreshSecret } = env.conf
	
	// Checking access token or refreshing it
	let decrypted = decryptToken(token, jwtSecret)
	if (decrypted) {
		req.userId = decrypted.userId
		return next()
	}
	else {
		
		// Checking refresh token
		decrypted = decryptToken(refreshToken, jwtRefreshSecret)
		if (!decrypted)
			return next(new InvalidAuthTokenError())
		
		// Checking if token is the same as user's
		const user = await User.findOne(decrypted.userId)
		if (!user || user.refreshToken !== refreshToken)
			return next(new InvalidAuthTokenError())
		
		user.lastAuth = new Date()
		await User.save(user)

		// Refreshing access token
		const token = encryptAccessToken(user?.id!)
		res.set('Bearer', token)
		res.cookie('access-token', token, { 
			expires: new Date(Date.now() + 3600000), // in 1mn
			httpOnly: true, signed: true })
		
		// Authenticated, continue
		req.userId = decrypted.userId
		return next()
	}
}


//---------------------------------------------------------
// Utils
//---------------------------------------------------------

function getToken(req: Request) {
	
	const authHeader = req.get('Authorization')
	if (authHeader)
		return authHeader.split(' ')[1]
	else 
		return req.signedCookies['access-token']
}

function getRefreshToken(req: Request) {

	const authHeader = req.get('refresh-token')
	if (authHeader)
		return authHeader.split(' ')[1]
	else 
		return req.signedCookies['refresh-token']
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
