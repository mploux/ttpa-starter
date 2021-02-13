/**********************************************************
*
*  User entity
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { column, Table, table } from '../typeorm'

@table("users")
export default class User extends Table {

	@column()
	firstname!: string
	
	@column()
	lastname!: string
	
	@column()
	email!: string
	
	@column()
	password!: string

}
