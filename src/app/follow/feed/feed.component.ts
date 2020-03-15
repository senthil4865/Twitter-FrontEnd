import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AppService } from "../../app.service";
import { ToastrService } from "ngx-toastr";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { MatDialog } from "@angular/material";
import { SocketService } from "../../socket.service";

@Component({
  selector: "app-feed",
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.css"]
})
export class FeedComponent {
  public userId: string;
  public userName: string;
  public userInfo: any;
  public authToken: string;
  public pageSize: number = 10;
  public pageSizeOptions: number[] = [5, 10, 25, 100];
  pageIndex: number = 0;
  tweets = [1, 2, 3];
  tweetList: any[] = [];
  totalTweets;
  followersId: any[] = [];

  constructor(
    public appService: AppService,
    public toastr: ToastrService,
    public router: Router,
    public dialog: MatDialog,
    public socketService: SocketService
  ) {}

  tweetWithTags: any;

  ngOnInit() {
    this.authToken = Cookie.get("authToken");
    this.userId = Cookie.get("userId");
    this.userName = Cookie.get("userName");
    this.userInfo = this.appService.getUserInfoFromLocalStorage();

    this.userInfo["followers"].forEach(follower => {
      this.followersId.push(follower.followerId);
    });

    this.getAllTweets(this.pageSize, this.pageIndex, [
      this.userId,
      ...this.followersId
    ]);

    console.log(this.userInfo, "user info");
  }

  getAllTweets(pageSize, pageIndex, followersId) {
    this.appService
      .getTweets(pageSize, pageIndex, followersId)
      .subscribe(apiResponse => {
        if (apiResponse.message == "Invalid Or Expired AuthorizationKey") {
          this.toastr.info("Missing Authorization Key", "Please login again");
          this.router.navigate(["/user/login"]);
        }

        if ((apiResponse.status = 200)) {
          console.log(apiResponse, "get all  tweets");

          this.tweets = [];
          this.totalTweets = apiResponse["count"];
          if (apiResponse["data"]) {
            this.tweetList = [];
            apiResponse["data"].forEach(tweets => {
              //Add to todo array
              this.tweetList.push(tweets);
            });
          }
          console.log(this.tweetList, "tweet list");

          this.tweetList.forEach(tweet => {
            tweet.tweetHashTags = tweet.tweetHashTags.toString().split(",");
          });
        } else {
          this.toastr.info(apiResponse.message, "Update!");
        }
      });
  }

  // public getServerData(event?: PageEvent) {

  //   console.log(event,'page event');

  //   this.getAllTweets(event.pageSize, event.pageIndex,[this.userId,...this.followersId]);

  //  this.pageSize = event.pageSize

  // }

  postTweet(tweet) {
    let tweetText;
    let hashTags;
    let hashTagString;
    console.log(tweet, "tweet");
    if (tweet.includes("#")) {
      tweetText = tweet.split("#")[0];
      hashTags = tweet.split("#");
      hashTags.splice(0, 1);
      hashTagString = hashTags.toString();
    } else {
      tweetText = tweet;
    }
    console.log(tweetText, "tweet Text");
    console.log(hashTags, "hashTags");

    let data = {
      tweetDescription: tweetText,
      hashTags: hashTagString,
      tweetCreatorId: this.userId,
      tweetCreatorName: this.userName
    };

    console.log(data, "tweet store");

    this.appService.addTweet(data).subscribe(
      apiResponse => {
        if (apiResponse.status == 200) {
          this.toastr.success("Tweet Added", "Success");

          this.getAllTweets(this.pageSize, this.pageIndex, [
            this.userId,
            ...this.followersId
          ]);
        }
      },
      error => {
        if (error.status == 400) {
          this.toastr.warning(
            "Failed to Add Tweet",
            "Not able to insert tweet"
          );
        } else {
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(["/serverError"]);
        }
      }
    );
  }
}
