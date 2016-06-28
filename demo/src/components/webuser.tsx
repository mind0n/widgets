export class WebUser {
    UserId: string;
    Pwd: string;
    constructor(userId?: string, pwd?: string) {
        this.UserId = userId;
        this.Pwd = pwd;
    }
}

export {WebUser as _WebUser}

