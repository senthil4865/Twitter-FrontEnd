import { Component, OnInit } from "@angular/core";
import { SocketService } from "../../socket.service";
import { ToastrService } from "ngx-toastr";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { AppService } from "src/app/app.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-find-followers",
  templateUrl: "./find-followers.component.html",
  styleUrls: ["./find-followers.component.css"],
  providers: [SocketService]
})
export class FindFollowersComponent {
  public userId: string;
  public userName: string;
  public userInfo: any;
  public authToken: string;
  public userList: any[] = [];
  public followersList: any[] = [];

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
    this.getFollowers();
    this.socketService.notify(this.userId).subscribe(data => {
      console.log(data);
      this.getFollowers();
    });
    this.verifyUserConfirmation();
  }

  //Function to get all received requests
  getFollowers() {
    this.appService
      .getFollowers(this.userId, this.authToken)
      .subscribe(apiResponse => {
        console.log(apiResponse, "followers list");
        if (apiResponse.status == 200) {
          this.followersList = [];
          apiResponse.data[0]["followers"].forEach(following => {
            console.log(following.followerName);

            this.followersList.push(following);
          });
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
