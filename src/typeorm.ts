/**********************************************************
*
*  TypeORM
*
*  - Switching to `camelCase` decorators in respect of
*    the ECMA script standards:
*    https://github.com/tc39/proposal-decorators
*  
*  - Renamed `@Entity` to `@table` because we are using
*    PostgreSQL tables and not NoSQL documents.
*
*  - Other renamings for simplifications
*
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import {
	Connection,

	Entity									as table, 
	Column									as column, 
	PrimaryColumn						as primaryColumn,
	PrimaryGeneratedColumn	as primaryGeneratedColumn,

} from "typeorm"


export abstract class Table {

	@primaryGeneratedColumn()
	id!: number
}

export {
	Connection,
	table, column, primaryColumn, primaryGeneratedColumn
}
