/**********************************************************
*
*  Auth controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { tableRepository, Repository } from '../typeorm'
import User from '../models/User'
import { apiRoute } from '.'
import { AuthCredentialsError, InvalidPasswordError, 
	UserExistsError } from '../errors'
import * as env from '../env'

type Credentials = {
	email: string,
	password: string,
}

@tableRepository(User)
export default class Auth extends Repository<User> {

	@apiRoute('post', '/login')
	public async loginUser(cred: Credentials) {

		const user = await this.findOne({ email: cred.email })

		if (!user)
			throw new AuthCredentialsError()

		if (!await bcrypt.compare(cred.password, user.password))
			throw new InvalidPasswordError()

		const token = sign({
				userId: user.id.toString(),
				userEmail: user.email
			}, 
			env.conf.jwtSecret, 
			{ expiresIn: '1h' }
		)

		return { token, user: user }
	}

	@apiRoute('post', '/signup')
	public async createUser(user: User) {

		if (await this.findOne({ email: user.email }))
			throw new UserExistsError()

		const hashedPw = await bcrypt.hash(user.password, 12)
		user.password = hashedPw

		return await this.save(user)
	}

}
