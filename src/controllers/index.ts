/**********************************************************
*
*  Controllers index
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Router } from "express"
import { validationResult } from "express-validator"
import { ObjectType } from "typeorm"
import { InvalidRequestDataError, NotFoundError }
	from "../errors"
import { MiddlewareFunction } from "../middlewares"
import { getConnection } from "../typeorm"
import { isDefined, isEmail, isPassword, validate } 
	from "../validations"


export type ApiMethod = 'get' | 'post' | 'put' | 'delete'


//---------------------------------------------------------
// Schemas
//---------------------------------------------------------

export class CredentialsSchema {
	@isDefined() @isEmail() 		email!: string
	@isDefined() @isPassword() 	password!: string
}

export class PasswordSchema {
	@isDefined() @isPassword() 	password!: string
}


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

// TODO: params & query schemas
export function apiValidate(schema: { body: any }) {

	return (
		target: any,
		key: string,) => {

			const defMeta = Reflect.defineMetadata
			defMeta("api:schema", schema, target, key)
	}
}


//---------------------------------------------------------
// Controller router
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
		const middlewares = getMetadata('api:middlewares',
		repo, md) as MiddlewareFunction[] || []
		const schema = getMetadata('api:schema', repo, md)
		
		// Handle invalid api meta
		if (!method || !path)
			continue
		
		// Pushing the api method middleware
		middlewares.push(async (req, res, next) => {

			try {

				// Schema validation
				if (schema?.body) {

					const bodySchema = Object.create(schema.body)
					Object.assign(bodySchema, req.body)

					if ((await validate(
						bodySchema, { 
							forbidUnknownValues: true,
							skipMissingProperties: true,
							forbidNonWhitelisted: true,
							whitelist: true
						})).length > 0)
						throw new InvalidRequestDataError()
				}
				else
					if (Object.keys(req.body).length != 0)
						throw new InvalidRequestDataError() 

				// Basic validation
				if (!validationResult(req).isEmpty())
					throw new InvalidRequestDataError()

				// Running repo method
				// @ts-ignore because it's ok to be dynamic
				const result = await repo[md](req, res, next)

				if (method == 'get' && !result)
					throw new NotFoundError()

				res.status(200).json(result)
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
