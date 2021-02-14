/**********************************************************
*
*  Middlewares
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/

import { Request, Response, NextFunction } from "express";

export type MiddlewareFunction = 
	(req: Request, res: Response, next: NextFunction) => void
