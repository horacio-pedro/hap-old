import { EditCandidateInterviewComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-interview/edit-candidate-interview.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidatesComponent } from './candidates.component';
import { ManageCandidateInviteComponent } from './manage-candidate-invite/manage-candidate-invite.component';
import { InviteGuard } from '../../@core/role/invite.guard';
import { PermissionsEnum } from '@hap/models';
import { EditCandidateComponent } from './edit-candidate/edit-candidate.component';
import { EditCandidateProfileComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-profile.component';
import { EditCandidateMainComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-main/edit-candidate-main.component';
import { EditCandidateDocumentsComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-documents/edit-candidate-documents.component';
import { EditCandidateHistoryComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-history/edit-candidate-history.component';
import { EditCandidateLocationComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-location/edit-candidate-location.component';
import { EditCandidateHiringComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-hiring/edit-candidate-hiring.component';
import { EditCandidateEmploymentComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-employment/edit-candidate-employment.component';
import { EditCandidateTasksComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-tasks/edit-candidate-tasks.component';
import { EditCandidateExperienceComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-experience/edit-candidate-experience.component';
import { EditCandidateRatesComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-rates/edit-candidate-rates.component';
import { EditCandidateFeedbacksComponent } from './edit-candidate/edit-candidate-profile/edit-candidate-feedbacks/edit-candidate-feedbacks.component';
import { ManageCandidateInterviewsComponent } from './manage-candidate-interviews/manage-candidate-interviews.component';
import { CandidateStatisticComponent } from './candidate-statistic/candidate-statistic.component';
import { InterviewCalendarComponent } from './manage-candidate-interviews/interview-calendar/interview-calendar.component';
import { InterviewPanelComponent } from './manage-candidate-interviews/interview-panel/interview-panel.component';
import { InterviewCriterionsComponent } from './manage-candidate-interviews/interview-criterions/interview-criterions.component';

const routes: Routes = [
	{
		path: '',
		component: CandidatesComponent
	},
	{
		path: 'edit/:id',
		component: EditCandidateComponent
	},
	{
		path: 'edit/:id/profile',
		component: EditCandidateProfileComponent,
		children: [
			{
				path: '',
				redirectTo: 'account',
				pathMatch: 'full'
			},
			{
				path: 'account',
				component: EditCandidateMainComponent
			},
			{
				path: 'rates',
				component: EditCandidateRatesComponent
			},
			{
				path: 'tasks',
				component: EditCandidateTasksComponent
			},
			{
				path: 'experience',
				component: EditCandidateExperienceComponent
			},
			{
				path: 'documents',
				component: EditCandidateDocumentsComponent
			},
			{
				path: 'feedbacks',
				component: EditCandidateFeedbacksComponent
			},
			{
				path: 'history',
				component: EditCandidateHistoryComponent
			},
			{
				path: 'location',
				component: EditCandidateLocationComponent
			},
			{
				path: 'hiring',
				component: EditCandidateHiringComponent
			},
			{
				path: 'employment',
				component: EditCandidateEmploymentComponent
			},
			{
				path: 'interview',
				component: EditCandidateInterviewComponent
			}
		]
	},
	{
		path: 'invites',
		component: ManageCandidateInviteComponent,
		canActivate: [InviteGuard],
		data: {
			expectedPermissions: [
				PermissionsEnum.ORG_INVITE_EDIT,
				PermissionsEnum.ORG_INVITE_VIEW
			]
		}
	},
	{
		path: 'interviews',
		component: ManageCandidateInterviewsComponent,
		children: [
			{
				path: '',
				redirectTo: 'calendar',
				pathMatch: 'full'
			},
			{
				path: 'calendar',
				component: InterviewCalendarComponent
			},
			{
				path: 'interview_panel',
				component: InterviewPanelComponent
			},
			{
				path: 'criterion',
				component: InterviewCriterionsComponent
			}
		]
	},
	{
		path: 'statistic',
		component: CandidateStatisticComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CandidatesRoutingModule {}
