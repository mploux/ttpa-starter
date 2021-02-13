/**********************************************************
*
*  Controllers index
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Router } from "express"
import { ObjectType } from "typeorm"
import { NotFoundError } from "../errors"
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
		propertyKey: string,) => {

			const defMeta = Reflect.defineMetadata
			defMeta("api:method", method, target, propertyKey)
			defMeta("api:path",  path, target, propertyKey)
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
		
		// Getting api method and path metadata
		const { getMetadata } = Reflect
		const method = getMetadata('api:method', repo, md)
		const path = getMetadata('api:path', repo, md)
		
		// Handle invalid api meta
		if (!method || !path)
			continue

		// Run api method
		router[(method as ApiMethod)]
			(path, async (req, res, next) => {
			
			let opts = Object.values(req.params)
			if (method != 'get')
				opts = req.body

			// @ts-ignore because it's ok to be dynamic
			const result = await repo[md].apply(repo, opts)

			if (!result)
				return next(new NotFoundError())
			res.status(200).json(result)
		})
	}

	return router
}


