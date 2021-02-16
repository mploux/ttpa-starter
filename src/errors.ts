/**********************************************************
*
*  Errors
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Request, Response, NextFunction } from "express"
import * as env from './env'


export function handleAppErrors(app: any) {
	
	app.use((error: any, 
		req: Request, res: Response, next: NextFunction) => {

		if (error.code == 500 && !env.isDev)
			error = new InternalError()

		if (env.isDev) console.error(error)

		const status = error.statusCode || 500
		return res.status(status).json({ 
				code: status, 
				error: error.errorCode, 
				message: error.message})
	})
}


//---------------------------------------------------------
// Errors
//---------------------------------------------------------

export class StatusError extends Error {

	statusCode: number
	errorCode: string

	constructor(statusCode: number, 
		errorCode: string, message: string) {

		super(message)
		this.statusCode = statusCode
		this.errorCode = errorCode
	}
}

export class InternalError extends StatusError {

	constructor() {

		super(500, 'internal', 'Internal server error.')
	}
}

export class NotFoundError extends StatusError {

	constructor(message?: string) {

		super(404, 'not-found', message || 'Not found.')
	}
}

export class BadRequestError extends StatusError {

	constructor(message?: string) {

		super(400, 'bad-request', message || 'Bad request.')
	}
}

export class InvalidRequestDataError extends StatusError {

	constructor(message?: string) {

		super(
			422, 
			'invalid-request-data', 
			message || 'Entered data is incorrect.')
	}
}

export class InvalidTokenError extends StatusError {

	constructor() {

		super(400, 'invalid-token', 'Invalid token.')
	}
}


//---------------------------------------------------------
// Auth Errors
//---------------------------------------------------------

export class AuthError extends StatusError {

	constructor(errorCode?: string, message?: string) {

		super(
			401, 
			'auth/' + (errorCode || 'not-authenticated'), 
			message || 'Not authenticated.')
	}
}

export class UserExistsError extends AuthError {

	constructor() {

		super(
			'user-exists',
			"User already exists."
		)
	}
}

export class AuthCredentialsError extends AuthError {

	constructor() {

		super(
			'invalid-credentials',
			"Invalid credentials."
		)
	}
}

export class InvalidPasswordError extends AuthError {

	constructor() {

		super(
			'invalid-password',
			"Invalid password."
		)
	}
}

export class InvalidAuthTokenError extends AuthError {

	constructor() {

		super(
			'invalid-token',
			"Invalid auth token."
		)
	}
}
