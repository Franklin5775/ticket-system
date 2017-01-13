import { Injectable } from '@angular/core';
import {Http, Headers, RequestOptions, Response, HttpModule} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthenticationService {
    constructor(private _http: Http) { }

    loginWin(event, username, password) {
        event.preventDefault();
         
        let url = "http://localhost:5000/api/login";
        let body = "username=" + username + "&password=" + password + "&grant_type=password";
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({ headers: headers });        
         
        this._http.post(url, body, options).subscribe(
            response => {
                localStorage.setItem('access_token', response.json().access_token);
                localStorage.setItem('expires_in', response.json().expires_in);
                localStorage.setItem('token_type', response.json().token_type);
                localStorage.setItem('userName', response.json().userName);
                //this._router.navigate(['Dashboard']);
            },
            error => {
                alert(error.text());
                console.log(error.text());
            }
        );
    }    

    login(username: string, password: string): Promise<CurrentUser> {

        let url = "http://localhost:5000/api/security/authenticate";
        let body = "username=" + username + "&password=" + password + "&grant_type=password";
        body = JSON.stringify({ username: username, password: password });
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({ headers: headers });       

        return this._http.post(url, body, options) 
            .toPromise()
            .then(response => this.extractArray(response))
            .catch(this.handleErrorPromise);
    }    

    protected extractArray(res: Response, showprogress: boolean = true) {
        let user = res.json() || {};
        // login successful if there's a jwt token in the response
        let token = user && user.token;
        if (token) {
            // store username and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify({ user }));

            // return true to indicate successful login
            
        } else {
            // return false to indicate failed login
            localStorage.removeItem('currentUser');
        }
        return user;
    }

    protected handleErrorPromise(error: any): Promise<void> {
        try {
            error = JSON.parse(error._body);
        } catch (e) {
        }

        let errMsg = error.errorMessage
            ? error.errorMessage
            : error.message
                ? error.message
                : error._body
                    ? error._body
                    : error.status
                        ? `${error.status} - ${error.statusText}`
                        : 'unknown server error';

        console.error(errMsg);
        return Promise.reject(errMsg);
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        //this.token = null;
        localStorage.removeItem('currentUser');
    }
}
export interface CurrentUser {
    userName :string;
    fullName: string;
    isAdmin: boolean;
    accessToken:string;
    expiresIn: Date;
    tokenType :string;
    message:string

}