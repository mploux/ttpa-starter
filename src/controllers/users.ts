/**********************************************************
*
*  Users controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { tableRepository, Repository } from '../typeorm'
import User from '../models/User';
import { apiRoute, apiWith } from '.';
import { isAuth } from '../middlewares/isAuth';


@tableRepository(User)
export default class Users extends Repository<User> {

	@apiRoute('get', '/users')
	@apiWith(isAuth)
	public async findAll() {
		
		return await this.find()
	}
	
	@apiRoute('get', '/users/:id')
	@apiWith(isAuth)
	public async findByID(id: number) {

		return await this.findOne(id)
	}
 
}
