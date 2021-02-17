/**********************************************************
*
*  Users controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { tableRepository, Repository } from '../typeorm'
import User from '../models/User'
import { apiRoute, apiValidate, apiWith } 
	from '.'
import { isAuth } from '../middlewares/isAuth'
import { Request, Response } from 'express'
import { allow, isEmail, param } from '../validations'
import { BadRequestError, NotFoundError, 
	UnauthorizedError } from '../errors'
import { isLength } from '../validations'
import { isVerified } from '../middlewares/isVerified'
import { isPasswordStrict } 
	from '../middlewares/isPasswordStrict'


//---------------------------------------------------------
// Schemas
//---------------------------------------------------------

class UserDataSchema {
	
	@allow() 			id!: number
	@isLength(1) 	firstName!: string
	@isLength(1) 	lastName!: string
	@isEmail() 		email!: string
}


//---------------------------------------------------------
// Users controller
//---------------------------------------------------------

@tableRepository(User)
export default class Users extends Repository<User> {

	
	@apiRoute('get', '/users')
	@apiWith(isAuth, isVerified)
	public async findAll() {

		return (await this.find()).map(user => { return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		}})
	}


	@apiRoute('get', '/users/me')
	@apiWith(isAuth)
	public async findMe(req: Request) {

		return await this.findOne(req.userId)
	}


	@apiRoute('get', '/users/:id')
	@apiWith(isAuth, isVerified, param('id').isNumeric())
	public async findUser(req: Request) {

		const id = req.params.id

		return await this.findOne(id)
	}



	@apiRoute('put', '/users/:id')
	@apiWith(isAuth, param('id').isNumeric())
	@apiValidate({ body: new UserDataSchema() })
	public async updateUser(req: Request) {

		const user = await this.findOne(req.params.id)

		if (!user)
			throw new NotFoundError()

		if (user.id != req.userId)
			throw new UnauthorizedError()
		
		// Block email modification
		if (req.body.email && user.email != req.body.email)
			throw new BadRequestError()

		Object.assign(user, req.body)

		console.log(user)

		return await this.save(user)
	}


	@apiRoute('delete', '/users/:id')
	@apiWith(isAuth, isPasswordStrict, param('id').isNumeric())
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
