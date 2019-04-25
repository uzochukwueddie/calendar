import { Router } from '@angular/router';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import {
  CalendarEvent,
  CalendarView,
  CalendarDateFormatter,
  CalendarMonthViewBeforeRenderEvent
} from 'angular-calendar';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';

import { CustomDateFormatter } from 'src/app/pages/calendar/custom-date-formatter';
import { AddEventModalPage } from 'src/app/pages/add-event-modal/add-event-modal.page';
import { CalendarService } from 'src/app/services/calendar.service';
import { CalendarEvents } from 'src/app/services/events.interface';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./calendar.page.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]
})
export class CalendarPage implements OnInit, OnDestroy {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  sourceEvents: CalendarEvent[] = [];
  eventSource: CalendarEvents[] = [];
  id: string;
  isIdPresent: boolean;
  calendarEvents = [];

  private destroySusbscriptions = false;

  constructor(
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private calendarService: CalendarService,
    private localNotification: LocalNotifications,
    private router: Router,
  ) {}

  ngOnInit() {
    this.id = window.localStorage.getItem('user_id');
    if (!this.id) {
      this.isIdPresent = false;
    }
    this.loadData(this.id, this.isIdPresent);
  }

  ngOnDestroy() {
    this.destroySusbscriptions = true;
  }

  viewEvent(event) {
    this.router.navigate(['/view-event', event.eventId]);
  }

  deleteCalendarEvent(events) {
    this.deleteAlert(events);
  }

  schedulePage() {
    this.router.navigate(['/schedule']);
  }

  loadData(id, idPresent?) {
    if (idPresent) {
      return;
    }
    this.calendarService.getEvents()
      .pipe(takeWhile(() => !this.destroySusbscriptions))
      .subscribe((data: any) => {
        const userEvents = _.filter(data, ['id', id]);
        if (userEvents[0].events.length === 0) {
          this.sourceEvents.length = 0;
          this.eventSource.length = 0;
          return;
        }
        if (userEvents.length === 0) {
          return;
        }
        this.calendarEvents = userEvents[0];
        if (userEvents && userEvents[0].events.length > 0) {
          const result = userEvents[0].events;
          result.forEach((value) => {
            const start = this.formatDate(new Date(value.start));
            const curr = this.formatDate(new Date());
            const a = moment(curr, 'DD/MM/YYYY');
            const b = moment(start, 'DD/MM/YYYY');
            const diff = b.diff(a, 'days');
            if (diff === 0) {
              this.todaysEvent(value, result);
            } else if (diff > 0) {
             this.futureEvent(value);
            }
          });
        }
      });

    this.displayNofications(id);
    this.reminderNofications(id);
  }

  displayNofications(id) {
    let iCounter = 0;
    this.calendarService.userCalendarEvents(id)
      .pipe(takeWhile(() => !this.destroySusbscriptions))
      .subscribe((data: any) => {
        if (data && data.events.length > 0) {
          const value = data.events;
          for (let i = 0; i < value.length; i++) {
            iCounter = i + 1;
            const text = `Today from ${moment(value[i].start).format('hh:mm a')} -
            ${moment(value[i].end).format('hh:mm a')} / ${value[i].location}`;
            this.localNotification.schedule({
              id: iCounter,
              title: `${value[i].title}`,
              text: text,
              trigger: { at: new Date(value[i].start)}
            });
          }
        }
      });
  }

  reminderNofications(id) {
    let jCounter = 0;
    this.calendarService.userCalendarEvents(id)
      .pipe(takeWhile(() => !this.destroySusbscriptions))
      .subscribe((data: any) => {
        if (data && data.events.length > 0) {
          const value = data.events;
          for (let j = 0; j < value.length; j++) {
            jCounter = j + 1;
            const duration = moment.duration(value[j].remind, 'minutes');
            const start = new Date(value[j].start).toISOString();
            const diff = moment(start).subtract(duration);
            const text = `You have a calendar event at ${moment(value[j].start).format('hh:mm a')} today`;
            this.localNotification.schedule({
              id: jCounter,
              title: 'Reminder',
              text: text,
              trigger: { at: new Date(diff.format())}
            });
          }
        }
      });
  }

  todaysEvent(value, result) {
    const arrSource = [];
    const todaysEvent = {
      start: new Date(value.start),
      end: new Date(value.end),
      title: value.title,
      allDay: value.allDay,
      description: value.description,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true,
      eventId: value.eventId,
    };
    arrSource.push(value);
    this.eventSource = _.uniqBy(arrSource, 'eventId');
    this.eventSource = this.removeDeletedEvent(result, this.eventSource);
    this.events.push(todaysEvent);

    this.sourceEvents = _.uniqBy(this.events, 'eventId');
    if (result.length < this.sourceEvents.length && this.calendarEvents.length > 1) {
      value['start'] = new Date(value['start']);
      value['end'] = new Date(value['end']);
      this.sourceEvents = this.removeDeletedEvent(result, this.sourceEvents);
    }
  }

  futureEvent(value) {
    const futureEvents = {
      start: new Date(value.start),
      end: new Date(value.end),
      title: value.title,
      allDay: value.allDay,
      description: value.description,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true,
      eventId: value.eventId,
    };
    this.events.push(futureEvents);
    this.sourceEvents = _.uniqBy(this.events, 'eventId');
  }

  removeDeletedEvent(resultArr, eventSource) {
    return resultArr.filter((element) => {
      return eventSource.indexOf(element.eventId) === -1;
    });
  }

  async deleteAlert(eventToDelete) {
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
            this.calendarService.deleteEvent(eventToDelete.eventId, this.calendarEvents, this.id);
            this.events = this.events.filter((event: any) => event.eventId !== eventToDelete.eventId);
            setTimeout(() => {
              this.sourceEvents.length = 0;
              this.loadData(this.id);
            }, 500);
          }
        }
      ]
    });
    return await alert.present();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: AddEventModalPage
    });
    modal.onDidDismiss()
      .then((value) => {
        if (value['data']) {
          const id = value['data'].id;
          this.loadData(id);
        }
      });

    await modal.present();
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      const dayOfMonth = day.date.getDate();
      const getMonth = day.date.getMonth();
      this.sourceEvents.forEach((value) => {
        if (dayOfMonth === new Date(value.start).getDate()
          && getMonth === new Date(value.start).getMonth()) {
            day.cssClass = 'bg-pink';
          }
      });
    });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

}