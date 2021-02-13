/**********************************************************
*
*  Users controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { repository, Repository } from '../typeorm'
import User from '../models/User';
import { apiRoute } from '.';


@repository(User)
export default class Users extends Repository<User> {


	@apiRoute('get', '/users')
	public async findAll() {

		return await this.find()
	}
	

	@apiRoute('get', '/user/create')
	public async createUsers(id: number) {

		await this.save([
			{ 
				firstname: 'Emmanuel', lastname: 'Macron', 
				email: 'emmanuel@macron.fr', password: '123456' 
			},
			{ 
				firstname: 'François', lastname: 'Hollande', 
				email: 'françois@hollande.fr', password: '123456' 
			},
			{ 
				firstname: 'Nicolas', lastname: 'Sarkozy', 
				email: 'nicolas@sarkozy.fr', password: '123456' 
			},
			{ 
				firstname: 'Jacques', lastname: 'Chirac', 
				email: 'jacques@chirac.fr', password: '123456' 
			},
		])
		return await this.find()
	}


	@apiRoute('get', '/user/:id')
	public async findByID(id: number) {

		return await this.findOne(id)
	}

}
