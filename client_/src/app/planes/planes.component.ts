import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { PlanService } from 'src/services/plan/plan.service';
import { AppComponent } from '../app.component';

declare var M: any;

@Component({
	selector: 'app-planes',
	templateUrl: './planes.component.html',
	styleUrls: [ './planes.component.css' ]
})
export class PlanesComponent implements OnInit {
	token: string;

	constructor(
		private planService: PlanService,
		private router: Router,
		private appComponent: AppComponent
	) {
		this.appComponent.menu1 = 'block';
		this.appComponent.menu2 = 'none';
	}

	ngOnInit() {
		console.log('init');
	}

	comprarPlan(plan_id) {
		let fechaInicio = moment().format('YYYY-MM-DD');
		let fechafin = moment().add(1, 'M').format('YYYY-MM-DD');

		let info = {
			usuario_id: JSON.parse(localStorage.getItem('id')),
			plan_id: plan_id,
			fech_ini: fechaInicio,
			fech_fin: fechafin
		};

		this.planService.asociarPlan(info).subscribe((res) => {
			if (res.success) {
				M.toast({ html: res.message });
				this.router.navigate([ '/proyecto' ]);
			} else {
				M.toast({ html: res.message });
			}
		});
	}
}
