import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { SocketService } from "../../socket.service";
import { ToastrService } from "ngx-toastr";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { AppService } from "src/app/app.service";
import { Router } from "@angular/router";

@Component({
  selector: "follow-unfollow",
  templateUrl: "./follow-unfollow.component.html",
  styleUrls: ["./follow-unfollow.component.css"],
  providers: [SocketService]
})
export class FollowUnfollowComponent implements OnInit {
  public userId: string;
  public userName: string;
  public userInfo: any;
  public authToken: string;
  public userList: any[] = [];
  public userDetails: any;
  public userFollowers;
  public userFollowing;
  public sentRequests;
  public receivedRequests;

  constructor(
    public appService: AppService,
    public toastr: ToastrService,
    public router: Router,
    public socketService: SocketService
  ) {}

  ngOnInit() {
    this.authToken = Cookie.get("authToken");
    this.userId = Cookie.get("userId");
    this.userName = Cookie.get("userName");
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.getAllUsersToSendFollowRequest();
    this.socketService.notify(this.userId).subscribe(data => {
      this.getAllUsersToSendFollowRequest();
    });
    this.verifyUserConfirmation();
  }

  //Function to get all users
  getAllUsersToSendFollowRequest() {
    let getSingleUserDetails = () => {
      return new Promise((resolve, reject) => {
        if (this.authToken != null && this.userId != null) {
          this.appService.getUserDetails(this.userId, this.authToken).subscribe(
            apiResponse => {
              if (apiResponse.status == 200) {
                this.userDetails = apiResponse.data;

                this.appService.setUserInfoInLocalStorage(this.userDetails);

                console.log(apiResponse.data, "get all users");

                resolve(this.userDetails);
              }
            },
            error => {
              if (error.status == 400) {
                this.toastr.warning("User Details not found", "Error!");
                reject("User Details not found");
              } else {
                this.toastr.error("Some Error Occurred", "Error!");
                this.router.navigate(["/serverError"]);
              }
            }
          );
        } else {
          this.toastr.info("Missing Authorization Key", "Please login again");
          this.router.navigate(["/user/login"]);
        }
      });
    };
    let getAllUsersExist = userDetails => {
      return new Promise((resolve, reject) => {
        if (this.authToken != null) {
          this.appService.getAllUsers(this.authToken).subscribe(
            apiResponse => {
              if (apiResponse.status == 200) {
                this.userList = apiResponse["data"];
                this.userList = this.userList.filter(
                  user => user.userId != this.userId
                ); //excluding myself from this array so that i cant follow me

                this.userFollowers = userDetails.followers;
                this.userFollowing = userDetails.following;

                for (let user of this.userList) {
                  for (let follower of this.userFollowers) {
                    if (user.userId == follower.followerId) {
                      user.isFollower = true;
                    }
                  }
                }

                /* Removing user from all users list if he is is in the list of followers*/
                for (let user of this.userList) {
                  for (let followers of this.userFollowers) {
                    if (user.userId == followers.followerId) {
                      this.userList = this.userList.filter(
                        user => user.userId != followers.followerId
                      );
                    }
                  }
                }

                /* Remove user from all users list if he is is in the list of following*/
                for (let user of this.userList) {
                  for (let following of this.userFollowing) {
                    if (user.userId == following.followerId) {
                      this.userList = this.userList.filter(
                        user => user.userId != following.followerId
                      );
                    }
                  }
                }

                console.log(this.userFollowers, "user followers");

                resolve(this.userList);
              }
            },
            error => {
              if (error.status == 400) {
                this.toastr.warning("User List falied to Update", "Error!");
                reject("User List falied to Update");
              } else {
                this.toastr.error("Some Error Occurred", "Error!");
                this.router.navigate(["/serverError"]);
              }
            }
          );
        } else {
          this.toastr.info("Missing Authorization Key", "Please login again");
          this.router.navigate(["/user/login"]);
        }
      });
    };

    getSingleUserDetails()
      .then(getAllUsersExist)
      .then(resolve => {
        console.log(resolve);
      })
      .catch(err => {
        console.log(err);
      });
  }

  //Follow
  followRequest(receiver) {
    const followRequest = {
      senderId: this.userId,
      senderName: this.userName,
      receiverId: receiver.userId,
      receiverName: receiver.firstName + " " + receiver.lastName,
      authToken: this.authToken
    };
    console.log(followRequest, "follow request");

    this.appService.sendFollowRequest(followRequest).subscribe(apiResponse => {
      if ((apiResponse.status = 200)) {
        let senderNotifyObj = {
          receiverName: this.userName,
          receiverId: this.userId,
          senderId: receiver.userId,
          senderName: receiver.firstName + " " + receiver.lastName,
          redirectId: "follow",
          message: `You are following ${followRequest.receiverName}`,
          authToken: this.authToken
        };
        this.appService
          .saveUserNotification(senderNotifyObj)
          .subscribe(apiResponse => {
            console.log(apiResponse, "Follow request sent");
            if (apiResponse.status == 200) {
              this.socketService.sendNotify(senderNotifyObj);
            }
          });

        let ReceiverNotifyObj = {
          senderName: this.userName,
          senderId: this.userId,
          receiverId: receiver.userId,
          receiverName: receiver.firstName + " " + receiver.lastName,
          redirectId: "follow",
          message: `${followRequest.senderName} is following you`,
          authToken: this.authToken
        };
        this.appService
          .saveUserNotification(ReceiverNotifyObj)
          .subscribe(apiResponse => {
            if (apiResponse.status == 200) {
              this.socketService.sendNotify(ReceiverNotifyObj);
            }
          });
        this.getAllUsersToSendFollowRequest();
      }
    });
  }

  unFollow(unFollow) {
    const unfriendOption = {
      senderId: this.userId,
      senderName: this.userName,
      receiverId: unFollow.followerId,
      receiverName: unFollow.followerName,
      authToken: this.authToken
    };
    console.log("unfriend option", unfriendOption);
    this.appService.unFollowRequest(unfriendOption).subscribe(apiResponse => {
      if ((apiResponse.status = 200)) {
        let senderNotifyObj = {
          receiverName: this.userName,
          receiverId: this.userId,
          senderName: unFollow.friendName,
          senderId: unFollow.friendId,
          redirectId: "follow",
          message: `You are not following ${unfriendOption.receiverName} anymore  `,
          authToken: this.authToken
        };
        this.appService
          .saveUserNotification(senderNotifyObj)
          .subscribe(apiResponse => {
            if (apiResponse.status == 200) {
              this.socketService.sendNotify(senderNotifyObj);
            }
          });

        let ReceiverNotifyObj = {
          senderName: this.userName,
          senderId: this.userId,
          receiverName: unFollow.friendName,
          receiverId: unFollow.friendId,
          redirectId: "follow",
          message: `${unfriendOption.senderName} is not following you`,
          authToken: this.authToken
        };
        this.appService
          .saveUserNotification(ReceiverNotifyObj)
          .subscribe(apiResponse => {
            if (apiResponse.status == 200) {
              this.socketService.sendNotify(ReceiverNotifyObj);
            }
          });

        this.getAllUsersToSendFollowRequest();
      }
    });
  }

  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser().subscribe(
      () => {
        this.socketService.setUser(this.authToken); //in reply to verify user emitting set-user event with authToken as parameter.
      },
      err => {
        this.toastr.error(err, "Some error occured");
      }
    ); //end subscribe
  }; //end verifyUserConfirmation
}
