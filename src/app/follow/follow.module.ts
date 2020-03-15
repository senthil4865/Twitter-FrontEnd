import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { SharedModule } from "../shared/shared.module";

import { FollowRoutingModule } from "./follow-routing.module";
import { FeedComponent } from "./feed/feed.component";

/* Module for Toaster */
import { ToastrModule } from "ngx-toastr";

import {
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatButtonModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatSidenavModule,
  MatMenuModule,
  MatListModule,
  MatDialogModule,
  MatTabsModule,
  MatCardModule,
  MatPaginatorModule
} from "@angular/material";

import { FollowersComponent } from "./followers/followers.component";
import { FollowUnfollowComponent } from "./follow-unfollow/follow-unfollow.component";
import { FindFollowersComponent } from "./find-followers/friend-followers.component";
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {MatChipsModule} from '@angular/material/chips';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTabsModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    RouterModule,
    MatChipsModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: "toast-top-right",
      preventDuplicates: true
    }),

    FollowRoutingModule
  ],

  entryComponents: [],
  declarations: [
    FeedComponent,
    FollowUnfollowComponent,
    FindFollowersComponent,
    FollowersComponent
  ]
})
export class FollowModule {}
