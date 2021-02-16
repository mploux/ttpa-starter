/**********************************************************
*
*  Users controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { tableRepository, Repository } from '../typeorm'
import User from '../models/User'
import { apiRoute, apiWith } from '.'
import { isAuth } from '../middlewares/isAuth'
import { Request } from 'express'
import { param } from '../validations'


@tableRepository(User)
export default class Users extends Repository<User> {

	
	@apiRoute('get', '/users')
	@apiWith(isAuth)
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
	@apiWith(isAuth, param('id').isNumeric())
	public async findByID(req: Request) {
		
		const id = req.params.id

		return await this.findOne(id)
	}
}
