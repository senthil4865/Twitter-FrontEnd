import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cookie } from "ng2-cookies/ng2-cookies";

@Injectable({
  providedIn: "root"
})
export class AppService {
  public baseUrl = "http://localhost:3000/api/v1";

  public userFriends: any = [];

  constructor(private _http: HttpClient) {
    //console.log("App Service called")
  }

  public signUp(data): Observable<any> {
    const params = new HttpParams()
      .set("firstName", data.firstName)
      .set("lastName", data.lastName)
      .set("mobileNumber", data.mobileNumber)
      .set("email", data.email)
      .set("password", data.password)
      .set("countryName", data.countryName)
     
    return this._http.post(`${this.baseUrl}/users/signup`, params);
  } //end signUp

  public signIn(data): Observable<any> {
    const params = new HttpParams()
      .set("email", data.email)
      .set("password", data.password);

    return this._http.post(`${this.baseUrl}/users/login`, params);
  } //end signIn

  public getCountryNames(): Observable<any> {
    return this._http.get("./../assets/countryNames.json");
  } //end getCountryNames

  public getCountryNumbers(): Observable<any> {
    return this._http.get("./../assets/countryPhoneCodes.json");
  } //end getCountryNumbers

  public setUserInfoInLocalStorage = data => {
    localStorage.setItem("userInfo", JSON.stringify(data));
  }; //end of setlocalstorage Function

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("userInfo"));
  }; //end getlocalstorage function

  public verifyEmail(userId): Observable<any> {
    const params = new HttpParams().set("userId", userId);

    return this._http.put(`${this.baseUrl}/users/verifyEmail`, params);
  } //end verifyEmail

  public logout(userId, authToken): Observable<any> {
    const params = new HttpParams().set("authToken", authToken);

    return this._http.post(`${this.baseUrl}/users/${userId}/logout`, params);
  }

  public addTweet(data): Observable<any> {
    const params = new HttpParams()
      .set("tweetDescription", data.tweetDescription)
      .set("hashTags", data.hashTags)
      .set("tweetCreatorId", data.tweetCreatorId)
      .set("tweetCreatorName", data.tweetCreatorName)
    return this._http.post(`${this.baseUrl}/tweet/addTweet`, params);
  }


  public getTweets(pageSize, pageIndex, id): any {
    return this._http.get(
      `${
        this.baseUrl
      }/tweet/${id}/getAllTweets?pageSize=${pageSize}&pageIndex=${pageIndex}&authToken=${Cookie.get(
        "authToken"
      )}`
    );
  }

  public getAllUsers(authToken): any {
    return this._http.get(
      `${this.baseUrl}/users/view/all?authToken=${authToken}`
    );
  }


  public sendFollowRequest(followRequest): any {
    const params = new HttpParams()
      .set("senderId", followRequest.senderId)
      .set("senderName", followRequest.senderName)
      .set("receiverId", followRequest.receiverId)
      .set("receiverName", followRequest.receiverName)
      .set("authToken", followRequest.authToken);
    return this._http.post(
      `${this.baseUrl}/following/send/follow/request`,
      params
    );
  }

  public getFollowers(userId, authToken): any {
    return this._http.get(
      `${this.baseUrl}/following/view/follow/received/${userId}?authToken=${authToken}`
    );
  }


  public getUserDetails(userId, authToken): Observable<any> {
    return this._http.get(
      `${this.baseUrl}/users/${userId}/details?authToken=${authToken}`
    );
  }

  public unFollowRequest(data): any {
    const params = new HttpParams()
      .set("senderId", data.senderId)
      .set("senderName", data.senderName)
      .set("receiverId", data.receiverId)
      .set("receiverName", data.receiverName)
      .set("authToken", data.authToken);


      console.log(data,'un follow function');

    return this._http.post(`${this.baseUrl}/following/unfollow/user`, params);
  }


  public getUserNotification(id) {
    return this._http.get(
      `${this.baseUrl}/notification/${id}/notification?authToken=${Cookie.get(
        "authToken"
      )}`
    );
  }

  public saveUserNotification(data): any {
    const params = new HttpParams()
      .set("senderName", data.senderName)
      .set("senderId", data.senderId)
      .set("receiverName", data.receiverName)
      .set("receiverId", data.receiverId)
      .set("redirectId", data.redirectId)
      .set("message", data.message)
      .set("authToken", data.authToken);
    return this._http.post(
      `${this.baseUrl}/notification/saveNotification`,
      params
    );
  }

  public resetPassword(data): Observable<any> {
    const params = new HttpParams().set("email", data.email);

    return this._http.post(`${this.baseUrl}/users/resetPassword`, params);
  }

  public updatePassword(data): Observable<any> {
    const params = new HttpParams()
      .set("validationToken", data.validationToken)
      .set("password", data.password);

    return this._http.put(`${this.baseUrl}/users/updatePassword`, params);
  } //end updatePassword

}
