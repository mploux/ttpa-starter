/**********************************************************
*
*  Users controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { tableRepository, Repository } from '../typeorm'
import User from '../models/User'
import { apiRoute, apiValidate, apiWith, PasswordSchema, 
	Schema } from '.'
import { isAuth } from '../middlewares/isAuth'
import { Request, Response } from 'express'
import { allow, isEmail, isLength, param } 
	from '../validations'
import { BadRequestError, NotFoundError, 
	UnauthorizedError } from '../errors'
import { isVerified } from '../middlewares/isVerified'
import { isProtected } 
	from '../middlewares/isProtected'
import { parseAs } from "../utils"


//---------------------------------------------------------
// Schemas
//---------------------------------------------------------

class LightUserDataSchema extends Schema {

	@allow() 				id 					= Number()
	@isLength(1) 		firstName 	= String()
	@isLength(1)		lastName 		= String()
}

class UserDataSchema extends Schema {

	@allow() 				id 					= Number()
	@isLength(1) 		firstName 	= String()
	@isLength(1)		lastName 		= String()
	@isEmail() 			email 			= String()
}


//---------------------------------------------------------
// Users controller
//---------------------------------------------------------

@tableRepository(User)
export default class Users extends Repository<User> {


	@apiRoute('get', '/users')
	@apiWith(isAuth, isVerified)
	public async findAll() {

		return parseAs(LightUserDataSchema, 
			await this.find())
	}


	@apiRoute('get', '/users/me')
	@apiWith(isAuth)
	public async findMe(req: Request) {

		return parseAs(UserDataSchema, 
			await this.findOne(req.userId))
	}


	@apiRoute('get', '/users/:id')
	@apiWith(isAuth, isVerified, param('id').isNumeric())
	public async findUser(req: Request) {

		const id = req.params.id

		return parseAs(UserDataSchema, 
			await this.findOne(id))
	}


	@apiRoute('put', '/users/:id')
	@apiWith(isAuth, param('id').isNumeric())
	@apiValidate({ body: UserDataSchema })
	public async updateUser(req: Request) {

		const user = await this.findOne(req.params.id)

		if (!user)
			throw new NotFoundError()

		if (user.id != req.userId)
			throw new UnauthorizedError()
		
		// Block email modification
		if (req.body.email && user.email != req.body.email)
			throw new BadRequestError()

		// Block id modification
		if (req.body.id && user.id != req.body.id)
			throw new BadRequestError()

		Object.assign(user, req.body)

		return parseAs(UserDataSchema,
			await this.save(user))
	}


	@apiRoute('delete', '/users/:id')
	@apiWith(isAuth, isProtected, param('id').isNumeric())
	@apiValidate({ body: PasswordSchema })
	public async deleteUser(req: Request, res: Response) {

		const user = await this.findOne(req.params.id)

		if (!user)
			throw new NotFoundError()

		if (user.id != req.userId)
			throw new UnauthorizedError()

		// Deleting user
		await this.delete({ id: user.id })

		// Removing cookies
		res.clearCookie('access-token')
		res.clearCookie('refresh-token')

		return {}
	}
}
