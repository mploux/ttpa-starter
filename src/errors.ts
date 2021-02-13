/**********************************************************
*
*  Errors
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Request, Response, NextFunction } from "express"


export function handleAppErrors(app: any) {
	
	app.use((error: any, 
		req: Request, res: Response, next: NextFunction) => {

		const status = error.statusCode || 500
		const message = error.message
		
		return res.status(status)
			.json({ code: status, message: message })
	})
}


//---------------------------------------------------------
// Errors
//---------------------------------------------------------

export class StatusError extends Error {

	statusCode: number

	constructor(statusCode: number, message: string) {

		super(message)
		this.statusCode = statusCode
	}
}

export class NotFoundError extends StatusError {

	constructor(message?: string) {

		super(404, message || 'Not Found')
	}
}
