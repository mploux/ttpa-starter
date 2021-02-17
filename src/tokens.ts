/**********************************************************
*
*  Auth Tokens
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { sign, verify } from "jsonwebtoken"
import * as env from './env'


export type TokenData = {
	userId: number
}


export function decryptToken
	(token: string, secret: string) {

	try { 
		return <TokenData>verify(token, secret)
	}
	catch (err) {
		return null
	}
}


//---------------------------------------------------------
// Email verification token
//---------------------------------------------------------

export function encryptVerifyToken(userId: number) {
	
	return sign({userId}, 'verify-token', {expiresIn: '1h'})
}

export function decryptVerifyToken(token: string) {
	
	return decryptToken(token, 'verify-token')
}


//---------------------------------------------------------
// Password reset token
//---------------------------------------------------------

export function encryptResetPassToken(userId: number) {
	
	return sign({userId}, 'reset-pass', {expiresIn: '1h'})
}

export function decryptResetPassToken(token: string) {
	
	return decryptToken(token, 'reset-pass')
}


//---------------------------------------------------------
// Auth tokens
//---------------------------------------------------------

export function encryptRefreshToken(userId: number) {
	
	return sign(
		{ userId: userId.toString() }, 
		env.conf.jwtRefreshSecret, 
		{ expiresIn: '14d' })
}

export function encryptAccessToken(userId: number) {
	
	return sign(
		{ userId: userId.toString() }, 
		env.conf.jwtSecret, 
		{ expiresIn: '1m' })
}


