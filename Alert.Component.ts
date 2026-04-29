import {ChangeDectectorRef, Component, OnInit , OnDestroy, Input} from '@angular/core';
import {Router,NavigationStart} from '@angular/router';
import {Subscription} from 'rxjs';

import {Alert, AlertType} from './alert.model';
import {AlertService} from './alert.service';

@Component({ selector: 'alert', templateUrl: 'alert.component.html', standalone: false })
export class AlertComponent implements OnInit, OnDestroy {
    private scheduleDetectorChanges(){
        setTimeout(() => this.cdr.detectChanges());
    }

    @input() id = 'default-alert';
    @input() fade = true;

    alerts: Alert[] = [];
    alertSubscription?: Subscription;
    routeSubscription?: Subscription;

    constructor(
        private router: Router,
        private alertService: AlertService,
        private cdr: ChangeDectectorRef
    ){ }

    ngOnInit() {

        this.alertSubscription = this.alertService.getAlert(this.id)
        .subscribe(alert => {

            if (!alert.message) {
                this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);
                this.alerts.forEach(x => delete x.keepAfterRouteChange);
                this.scheduleDetectorChanges();
                return;
            }

            this.alerts.push(alert);
            this.scheduleDetectorChanges();

        }
    });

        this.routeSubscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
            this.alertService.clear(this.id);
            this.scheduleDetectorChanges();
        }
    });

    ngOnDestroy() {
        this.alertSubscription?.unsubscribe();
        this.routeSubscription?.unsubscribe();
    }

    removeAlert(alert: Alert) {
        if (!this.alerts.includes(alert)) return;
        if (this.fade) {
            alert.fade = true;
            this.scheduleDetectorChanges();

            setTimeout(() => {
                this.alerts = this.alerts.filter(x => x !== alert);
                this.scheduleDetectorChanges();
            }, 250);
        } else {
            this.alerts = this.alerts.filter(x => x !== alert);
            this.scheduleDetectorChanges();
        }
    }

    cssClass(alert: Alert) {
        if (!alert) return;

        const classes = ['alert', 'alert-dismissable', 'mt-4', 'container'];

        const alertTypeClass = {
            [AlertType.Success]: 'alert-success',
            [AlertType.Error]: 'alert-danger',
            [AlertType.Info]: 'alert-info',
            [AlertType.Warning]: 'alert-warning'
        };
        
        if (alert.type !== undefined) {
            classes.push(alertTypeClass[alert.type]);
        }

        if (alert.fade) {
            classes.push('fade');
        }

        return classes.join(' ');
    } 
}


