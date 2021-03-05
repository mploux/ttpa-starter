/**********************************************************
*
*  Cookies
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Response } from "express"


export function saveAccessToken(
	res: Response, token: string) {

	res.cookie('access-token', token, { 
		maxAge: 60000, // in one minute
		httpOnly: true, signed: true })
}

export function saveRefreshToken(
	res: Response, token: string) {

	res.cookie('refresh-token', token, { 
		httpOnly: true, signed: true })
}

export function clearTokens(res: Response) {

	res.clearCookie('access-token')
	res.clearCookie('refresh-token')
}
