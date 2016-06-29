export default class WebUser {
    UserId: string;
    Pwd: string;
    constructor(userId?: string, pwd?: string) {
        this.UserId = userId;
        this.Pwd = pwd;
    }
    validate():boolean{
        alert(this.UserId);
        return true;
    }
}



