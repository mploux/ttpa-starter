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
import { apiRoute, apiValidate } from '.'
import { AuthCredentialsError, InvalidPasswordError, 
	InvalidRequestDataError, 
	UserExistsError } from '../errors'
import * as env from '../env'
import { Request, Response } from 'express'


type Credentials = {
	email: string,
	password: string,
}

@tableRepository(User)
export default class Auth extends Repository<User> {

	@apiRoute('post', '/login')
	public async loginUser(req: Request, res: Response) {

		const cred = req.body as Credentials

		if (!cred)
			throw new InvalidRequestDataError()

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

		res.cookie('access-token', token, { 
			expires: new Date(Date.now() + 3600000), 
			httpOnly: true, signed: true })

		return { 'access-token': token, user: user }
	}

	@apiRoute('post', '/signup')
	@apiValidate({ body: new User() })
	public async createUser(req: Request) {

		const user = req.body as User

		if (!user)
			throw new InvalidRequestDataError()

		if (await this.findOne({ email: user.email }))
			throw new UserExistsError()

		const hashed = await bcrypt.hash(user.password, 12)
		user.password = hashed

		return await this.save(user)
	}
}
