import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FeedComponent } from "./feed/feed.component";
import { FollowersComponent } from "./followers/followers.component";

const routes: Routes = [
  { path: "feed", component: FeedComponent },
  { path: "manage-followers", component: FollowersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FollowRoutingModule {}
