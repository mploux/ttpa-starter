/**********************************************************
*
*  isVerified middleware
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { NextFunction, Request, Response } from "express"
import { UnverifiedUserError } from "../errors"
import User from "../models/User"


export async function isVerified(
	req: Request, res: Response, next: NextFunction) {

	// You should be authenticated, otherwise 500 Internal
	const user = (await User.findOne(req.userId))!
	
	// If not verified, throw error
	if (!user.isVerified)
		return next(new UnverifiedUserError())
	
	next()
}
