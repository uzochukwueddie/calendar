import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import * as moment from 'moment';

import { CalendarService } from 'src/app/services/calendar.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-add-event-modal',
  templateUrl: './add-event-modal.page.html',
  styleUrls: ['./add-event-modal.page.scss'],
})
export class AddEventModalPage implements OnInit, OnDestroy {
  event = {
    eventId: 0,
    title: '',
    location: '',
    description: '',
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    allDay: false,
    remind: 10
  };
  minDate = new Date().toISOString();
  id: string;
  events = [];

  private destroySubscriptions = false;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private calendarService: CalendarService
  ) { }

  ngOnInit() {
    this.id = window.localStorage.getItem('user_id');
    if (!this.id) {
      return;
    }
    this.calendarService.userCalendarEvents(this.id)
      .pipe(takeWhile(() => !this.destroySubscriptions))
      .subscribe((data: any) => {
        this.events = data.events;
      });
  }

  ngOnDestroy() {
    this.destroySubscriptions = true;
  }

  sendEvent() {
    if (this.event.title === '' || this.event.location === '' || this.event.description === '') {
      this.showMessage('You cannot submit empty fields');
      return;
    }

    const startDate = new Date(this.event.start).toISOString();
    const endDate = new Date(this.event.end).toISOString();
    const diff = moment(startDate).isBefore(endDate);
    if (!diff) {
      this.showMessage('Please select an end date greater than start date in either date or time.');
      return;
    }

    this.event = {
      eventId: 1,
      title: this.event.title,
      location: this.event.location,
      description: this.event.description,
      start: this.event.start,
      end: this.event.end,
      allDay: this.event.allDay,
      remind: this.event.remind
    };

    if (!this.id) {
      this.calendarService.addEvent(this.event)
        .then((data) => {
          this.modalCtrl.dismiss({id: data.id});
          window.localStorage.setItem('user_id', data.id);
        });
    } else {
      this.modalCtrl.dismiss({id: this.id});
      this.calendarService.addMoreEvent(this.event, this.id, this.events);
    }

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async showMessage(message) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: `${message}`,
      buttons: ['OK']
    });
    await alert.present();
  }

}
