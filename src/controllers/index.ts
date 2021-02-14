/**********************************************************
*
*  Controllers index
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Router } from "express"
import { ObjectType } from "typeorm"
import { NotFoundError } from "../errors"
import { MiddlewareFunction } from "../middlewares"
import { getConnection } 
	from "../typeorm"


export type ApiMethod = 'get' | 'post' | 'put' | 'delete'


//---------------------------------------------------------
// Decorators
//---------------------------------------------------------

export function apiRoute(
	method: ApiMethod, path: string) {

	return (
		target: any,
		key: string,) => {

			const defMeta = Reflect.defineMetadata
			defMeta("api:method", method, target, key)
			defMeta("api:path",  path, target, key)
	}
}

export function apiWith(
	...middlewares: MiddlewareFunction[]) {

	return (
		target: any,
		key: string,) => {

			const defMeta = Reflect.defineMetadata
			defMeta("api:middlewares", middlewares, target, key)
	}
}


//---------------------------------------------------------
// Contoller router
//---------------------------------------------------------

export function getApiRoutes<T>
	(Controller: ObjectType<T>) {

	const router = Router()
	const con = getConnection()
	const repo = con.getCustomRepository(Controller)
	
	// Getting controller methods
	const methods = 
		Object.getOwnPropertyNames(Controller.prototype)
	
	// Handle each method
	for (const md of methods) {
		
		// Getting api method, path and middlewares metadata
		const { getMetadata } = Reflect
		const method = getMetadata('api:method', repo, md)
		const path = getMetadata('api:path', repo, md)
		let middlewares = getMetadata('api:middlewares', repo, md
			) as MiddlewareFunction[] || []
		
		// Handle invalid api meta
		if (!method || !path)
			continue
		
		// Handle invalid api meta
		middlewares.push(async (req, res, next) => {

			try {
				// Handle GET requests
				if (method == 'get') {
					let params = Object.values(req.params)
					// @ts-ignore because it's ok to be dynamic
					const result = await repo[md].apply(repo, params)
	
					if (!result)
						return next(new NotFoundError())
					res.status(200).json(result)
				}
	
				// Handle other requests
				else {
					// @ts-ignore because it's ok to be dynamic
					const result = await repo[md](req.body)
					res.status(200).json(result)
				}
			}
			catch(err) {
				next(err)
			}
		})

		// Handle api route method
		router[(method as ApiMethod)](path, ...middlewares)
	}

	return router
}
