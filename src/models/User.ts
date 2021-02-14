/**********************************************************
*
*  User entity
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { column, Table, table } from '../typeorm'

@table("users")
export default class User extends Table {

	@column({ nullable: true })
	firstname!: string
	
	@column({ nullable: true })
	lastname!: string
	
	@column()
	email!: string
	
	@column()
	password!: string

}
