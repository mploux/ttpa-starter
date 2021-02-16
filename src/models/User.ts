/**********************************************************
*
*  User entity
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { column, TableEntity, table } 
	from '../typeorm'
import { isEmail, isPassword } from '../validations'


@table("users")
export default class User extends TableEntity {


//---------------------------------------------------------
// General properties
//---------------------------------------------------------

	@column()
	@isEmail()
	email!: string

	@column()
	@isPassword()
	password!: string

	@column({ nullable: true })
	firstName!: string

	@column({ nullable: true })
	lastName!: string


//---------------------------------------------------------
// Tokens
//---------------------------------------------------------

	@column({ nullable: true })
	refreshToken!: string

	@column({ nullable: true })
	resetPassToken!: string


//---------------------------------------------------------
// Basic analytics
//---------------------------------------------------------

	@column({ nullable: true })
	lastLogin!: Date

	@column({ nullable: true })
	lastAuth!: Date

}
