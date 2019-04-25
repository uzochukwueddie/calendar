import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as moment from 'moment';

import { CalendarEvents } from 'src/app/services/events.interface';
import { CalendarService } from 'src/app/services/calendar.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.page.html',
  styleUrls: ['./view-event.page.scss'],
})
export class ViewEventPage implements OnInit, OnDestroy {
  events: CalendarEvents;
  eventId: number;
  id: string;
  eventIsToday = false;
  userEvents = [];

  private destroySubscriptions = false;

  constructor(
    private calendarService: CalendarService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.id = window.localStorage.getItem('user_id');
    this.activatedRoute.params.subscribe(data => {
      this.getEvent(this.id, data['id']);
    });
  }

  ngOnDestroy() {
    this.destroySubscriptions = true;
  }

  getEvent(id, eventId) {
    this.calendarService.userCalendarEvents(id)
      .pipe(takeWhile(() => !this.destroySubscriptions))
      .subscribe((data: any) => {
        this.userEvents = data;
        this.events = data.events.find((value) => value.eventId === Number(eventId));
        if (this.events) {
          if (moment(this.events.start).isSameOrBefore(new Date())) {
            this.eventIsToday = true;
          }
        }
      });
  }

  deleteEvent(event) {
    this.presentAlert(event);
  }

  async presentAlert(event) {
    const alert = await this.alertCtrl.create({
      message: 'Delete this event',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'OK',
          handler: () => {
            if (!this.id) {
              this.calendarService.deleteEvent(event.eventId, this.userEvents);
            }
            this.calendarService.deleteEvent(event.eventId, this.userEvents, this.id);
            this.router.navigate(['/calendar']);
          }
        }
      ]
    });
    return await alert.present();
  }

}
