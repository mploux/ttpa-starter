/**********************************************************
*
*  Users controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { tableRepository, Repository } from '../typeorm'
import User from '../models/User';
import { apiRoute } from '.';


@tableRepository(User)
export default class Users extends Repository<User> {

	// @apiWith(isAuth(), isRole('admin'))
	@apiRoute('get', '/users')
	public async findAll() {

		return await this.find()
	}

	@apiRoute('post', '/user')
	public async createUser(user: User) {

		return await this.save(user)
	}

	@apiRoute('get', '/user/:id')
	public async findByID(id: number) {

		return await this.findOne(id)
	}

}
