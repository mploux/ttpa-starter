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
*  - Other renaming for simplifications
*
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import "reflect-metadata"

import {
	Connection, Repository, BaseEntity, getConnection,

	Entity									as table, 
	Column									as column, 
	PrimaryColumn						as primaryColumn,
	PrimaryGeneratedColumn	as primaryGeneratedColumn,
	EntityRepository				as tableRepository,

} from "typeorm"


export abstract class TableEntity extends BaseEntity {

	@primaryGeneratedColumn()
	id!: number

	@column({ nullable: true })
	createdAt!: Date

	@column({ nullable: true })
	updatedAt!: Date
}

export {
	Connection, Repository, getConnection,
	
	table, column, primaryColumn, primaryGeneratedColumn, 
	tableRepository
}
