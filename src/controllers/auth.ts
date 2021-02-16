/**********************************************************
*
*  Auth controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import bcrypt from 'bcryptjs'
import { tableRepository, Repository } from '../typeorm'
import User from '../models/User'
import { apiRoute, apiValidate, apiWith } from '.'
import { AuthCredentialsError, BadRequestError, 
	InvalidPasswordError, InvalidTokenError, NotFoundError, 
	UserExistsError } from '../errors'
import { Request, Response } from 'express'
import { body, isEmail, isPassword } from '../validations'
import { encryptResetPassToken, encryptAccessToken, 
	encryptRefreshToken, decryptResetPassToken } 
	from '../tokens'
import { isAuth } from '../middlewares/isAuth'


class Credentials {
	@isEmail() email!: string
	@isPassword() password!: string
}


@tableRepository(User)
export default class Auth extends Repository<User> {
	

	@apiRoute('post', '/auth/login')
	@apiValidate({ body: new Credentials() })
	public async loginUser(req: Request, res: Response) {

		const cred = req.body as Credentials
		const user = await this.findOne({ email: cred.email })

		// Validating user
		if (!user)
			throw new AuthCredentialsError()
		if (!await bcrypt.compare(cred.password, user.password))
			throw new InvalidPasswordError()

		// Creating tokens
		const token = encryptAccessToken(user.id)
		const refreshToken = encryptRefreshToken(user.id)

		// Saving login time and refresh token
		user.refreshToken = refreshToken
		user.lastLogin = new Date()
		await this.save(user)

		// Saving tokens in cookies
		res.cookie('access-token', token, { 
			expires: new Date(Date.now() + 3600000), // in 1mn
			httpOnly: true, signed: true })
		res.cookie('refresh-token', refreshToken, { 
			httpOnly: true, signed: true })

		// Logged in !
		res.set('access-token', token)
		res.set('refresh-token', token)
		return { userId: user.id }
	}


	@apiRoute('post', '/auth/signup')
	@apiValidate({ body: new Credentials() })
	public async createUser(req: Request) {

		const cred = req.body as Credentials

		// Checking if email already exists
		if (await this.findOne({ email: cred.email }))
			throw new UserExistsError()

		// Creating a new user
		const user = new User()
		user.email = cred.email
		user.password = await bcrypt.hash(cred.password, 12)

		// Saving the new user
		return await this.save(user)
	}


	@apiRoute('post', '/auth/logout')
	@apiWith(isAuth)
	public async logoutUser(req: Request, res: Response) {

		// Removing refresh token
		const user = (await this.findOne(req.userId))!
		user.refreshToken = ''
		this.save(user)
		
		// Removing cookies
		res.clearCookie('access-token')
		res.clearCookie('refresh-token')
		
		// Logged out, return nothing
		return {}
	}


	@apiRoute('post', '/auth/send-reset')
	@apiWith(body('email').isEmail())
	public async sendPassReset(req: Request) {

		// Getting the corresponding user
		const email = req.body.email
		const user = await this.findOne({ email })
		if (!user)
			throw new NotFoundError()

		// Encrypt a new reset password token and save it
		const token = encryptResetPassToken(user.id)
		user.resetPassToken = token
		this.save(user)

		// TODO: Send reset link with token by email

		// WIP for testing only
		return { token }
	}


	@apiRoute('post', '/auth/reset')
	@apiWith(body('password').isLength({ min: 6, max: 32 }))
	public async resetPass(req: Request) {

		const token = req.query.token as string
		const decrypted = decryptResetPassToken(token)
		if (!decrypted)
			throw new InvalidTokenError()
		
		const userId = decrypted.userId
		const user = await this.findOne(userId)
		if (!user)
			throw new BadRequestError()
			
		if (token !== user.resetPassToken)
			throw new BadRequestError()

		const newPassword = req.body.password
		user.password = await bcrypt.hash(newPassword, 12)
		user.resetPassToken = ''
		this.save(user)

		return {}
	}
}
