/**********************************************************
*
*  Auth controller
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import bcrypt from 'bcryptjs'
import { tableRepository, Repository } from '../typeorm'
import User from '../models/User'
import { apiRoute, apiValidate, apiWith, CredentialsSchema, 
	PasswordSchema } from '.'
import { AuthCredentialsError, BadRequestError, 
	InvalidPasswordError, InvalidTokenError, NotFoundError, 
	StatusError, UnauthorizedError, UserExistsError } 
	from '../errors'
import { Request, Response } from 'express'
import { body } from '../validations'
import { encryptResetPassToken, encryptAccessToken, 
	encryptRefreshToken, decryptResetPassToken, 
	decryptVerifyToken, encryptVerifyToken } from '../tokens'
import { isAuth } from '../middlewares/isAuth'


@tableRepository(User)
export default class Auth extends Repository<User> {


	@apiRoute('post', '/auth/login')
	@apiValidate({ body: CredentialsSchema })
	public async loginUser(req: Request, res: Response) {

		const cred = req.body as CredentialsSchema
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
		saveCookies(res, token, refreshToken)

		// Logged in !
		res.set('access-token', token)
		res.set('refresh-token', token)
		return { userId: user.id }
	}


	@apiRoute('post', '/auth/signup')
	@apiValidate({ body: CredentialsSchema })
	public async createUser(req: Request) {

		const cred = req.body as CredentialsSchema

		// Checking if email already exists
		if (await this.findOne({ email: cred.email }))
			throw new UserExistsError()

		// Creating a new user
		const user = new User()
		user.email = cred.email
		user.password = await bcrypt.hash(cred.password, 12)

		// Saving the new user
		return (await this.save(user)).email
	}


	@apiRoute('post', '/auth/logout')
	@apiWith(isAuth)
	public async logoutUser(req: Request, res: Response) {

		// Removing refresh token
		const user = (await this.findOne(req.userId))!
		user.refreshToken = ''
		this.save(user)
		
		// Clearing cookies
		clearCookies(res)
		
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
	@apiValidate({ body: PasswordSchema })
	public async resetPass(req: Request) {

		// Getting the reset token
		const token = req.query.token as string
		const decrypted = decryptResetPassToken(token)
		if (!decrypted)
			throw new InvalidTokenError()
		
		// Finding the corresponding user
		const user = await this.findOne(decrypted.userId)
		if (!user)
			throw new BadRequestError()
		
		// Comparing send token with use token
		if (token !== user.resetPassToken)
			throw new BadRequestError()

		// Updating password
		const newPassword = req.body.password
		user.password = await bcrypt.hash(newPassword, 12)
		user.resetPassToken = ''
		this.save(user)

		return {}
	}


	@apiRoute('post', '/auth/verify-email')
	@apiWith(isAuth)
	public async verifyEmail(req: Request) {

		// Getting the verify token
		const token = req.query.token as string
		const decrypted = decryptVerifyToken(token)
		if (!decrypted)
			throw new InvalidTokenError()
		
		// Finding the corresponding user
		const user = await this.findOne(decrypted.userId)
		if (!user)
			throw new BadRequestError()
		
		// Making sure the user to update is the auth. one
		if (req.userId != user.id)
			throw new UnauthorizedError()
		
		// Checking if the user is already verified
		if (user.isVerified)
			throw new StatusError(400, 
				'already-verified', 'Already verified.')

		// Updating password
		user.isVerified = true
		this.save(user)

		return {}
	}


	@apiRoute('post', '/auth/send-email-verif')
	@apiWith(isAuth)
	public async sendEmailVerif(req: Request) {

		const user = (await this.findOne(req.userId))!

		// Checking if the user is already verified
		if (user.isVerified)
			throw new StatusError(400, 
				'already-verified', 'Already verified.')
		
		user.verifyToken = encryptVerifyToken(user.id)
		this.save(user)

		// TODO: send email with verif link

		return {
			// WIP: for testing
			token: user.verifyToken
		}
	}
}


//---------------------------------------------------------
// Utils
//---------------------------------------------------------

function saveCookies(
	res: Response, token: string, refreshToken: string) {

	res.cookie('access-token', token, { 
		expires: new Date(Date.now() + 3600000), // in 1mn
		httpOnly: true, signed: true })
	res.cookie('refresh-token', refreshToken, { 
		httpOnly: true, signed: true })
}

function clearCookies(res: Response) {

	res.clearCookie('access-token')
	res.clearCookie('refresh-token')
}
