/**********************************************************
*
*  Validations
*
*  - Switching to `camelCase` decorators in respect of
*    the ECMA script standards:
*    https://github.com/tc39/proposal-decorators
*
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import {
	validate,

	IsInt 									as isInt, 
	Length 									as length, 
	IsEmail 								as isEmail, 
	IsFQDN 									as isFQDN, 
	IsDate 									as isDate, 
	Min 										as min, 
	Max 										as max 
} from 'class-validator'

import { param, body, query } from 'express-validator'


export const isPassword = () => length(6, 32)

export {
	validate,
	isInt, isEmail, isFQDN, isDate, min, max,
	param, body, query
}
