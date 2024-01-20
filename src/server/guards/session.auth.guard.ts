import { Request, Response } from 'express';
import { Action, UnauthorizedError } from 'routing-controllers';

export class SessionAuthGuard {
	async intercept(action: Action, result: any): Promise<any> {
		const req: Request = action.request;
		const res: Response = action.response;

		const userInfo = req.session!.userInfo;

		if (!userInfo) {
			res.redirect('/unauthorized');
			return Promise.reject(new UnauthorizedError('Not authorized'));
		}

		return result;
	}
}
