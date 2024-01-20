import { Request } from 'express';
import { Action } from 'routing-controllers';

export class SessionAuthGuard {
	static async checkAuth(action: Action): Promise<boolean> {
		const req: Request = action.request;

		const userInfo = req.session!.userInfo;

		if (!userInfo) {
			return false;
		}

		return true;
	}
}
