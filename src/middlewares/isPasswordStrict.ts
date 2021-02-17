/**********************************************************
*
*  isVerified middleware
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { NextFunction, Request, Response } from "express"
import { PasswordSchema } from "../controllers"
import { InvalidPasswordError, InvalidRequestDataError } from "../errors"
import User from "../models/User"
import bcrypt from 'bcryptjs'
import { validate } from "../validations"


export async function isPasswordStrict(
	req: Request, res: Response, next: NextFunction) {

	// Getting schema
	const passwordSchema = new PasswordSchema()
	Object.assign(passwordSchema, req.body)

	// Validating schema
	if ((await validate(
		passwordSchema, { 
			forbidUnknownValues: true,
			skipMissingProperties: true,
			forbidNonWhitelisted: true,
			whitelist: true
		})).length > 0)
		return next(new InvalidRequestDataError())

	// You should be authenticated, otherwise 500 Internal
	const user = (await User.findOne(req.userId))!
	const password = (req.body as PasswordSchema).password

	// Validating password
	if (!await bcrypt.compare(password, user.password))
		return next(new InvalidPasswordError())
	
	next()
}
