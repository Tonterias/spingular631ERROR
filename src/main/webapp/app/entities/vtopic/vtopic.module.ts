import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SpingularSharedModule } from 'app/shared/shared.module';
import { VtopicComponent } from './vtopic.component';
import { VtopicDetailComponent } from './vtopic-detail.component';
import { VtopicUpdateComponent } from './vtopic-update.component';
import { VtopicDeletePopupComponent, VtopicDeleteDialogComponent } from './vtopic-delete-dialog.component';
import { vtopicRoute, vtopicPopupRoute } from './vtopic.route';

const ENTITY_STATES = [...vtopicRoute, ...vtopicPopupRoute];

@NgModule({
  imports: [SpingularSharedModule, RouterModule.forChild(ENTITY_STATES)],
  declarations: [VtopicComponent, VtopicDetailComponent, VtopicUpdateComponent, VtopicDeleteDialogComponent, VtopicDeletePopupComponent],
  entryComponents: [VtopicDeleteDialogComponent]
})
export class SpingularVtopicModule {}
