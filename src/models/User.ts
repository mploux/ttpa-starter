/**********************************************************
*
*  User entity
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { column, TableEntity, table } 
	from '../typeorm'
import { isEmail, length } from '../validations'

@table("users")
export default class User extends TableEntity {

	@column({ nullable: true })
	firstname!: string
	
	@column({ nullable: true })
	lastname!: string
	
	@column()
	@isEmail()
	email!: string
	
	@column()
	@length(8, 32)
	password!: string

}
