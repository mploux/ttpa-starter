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

export {
	validate,
	isInt, length, isEmail, isFQDN, isDate, min, max,
	param, body, query
}
