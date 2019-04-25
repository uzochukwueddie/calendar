import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Events, CalendarEvents } from 'src/app/services/events.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  eventCollection: AngularFirestoreCollection<Events>;
  eventDoc: AngularFirestoreDocument<Events>;
  calendarEvents: Events;

  constructor(
    private afs: AngularFirestore
  ) {
    this.eventCollection = this.afs.collection<Events>('events');
  }

  getEvents() {
    return this.eventCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  userCalendarEvents(id) {
    return this.eventCollection.doc<CalendarEvents>(id).snapshotChanges().pipe(
      map(actions => {
        return actions.payload.data();
      })
    );
  }

  public addEvent(event: CalendarEvents) {
    this.calendarEvents = {
      events: [event]
    };
    return this.eventCollection.add(this.calendarEvents);
  }

  addMoreEvent(event: CalendarEvents, id: string, events) {
    this.eventDoc = this.eventCollection.doc<Events>(`${id}`);
    if (events.length === 1) {
      event.eventId = events[0].eventId + 1;
    } else if (events.length > 1) {
      event.eventId = events[events.length - 1].eventId + 1;
    }
    let arr = [];
    arr = events;
    arr.push(event);
    this.calendarEvents = {
      events: arr
    };
    return this.eventDoc.set(this.calendarEvents);
  }

  deleteEvent(eventId, userEvents, id?: any) {
    this.eventDoc = this.eventCollection.doc<Events>(`${id}`);
    const arr = userEvents.events.filter(event => event.eventId !== Number(eventId));
    const calendarEvents = {
      events: arr
    };
    this.deleteAllEvents(id);
    return this.eventDoc.set(calendarEvents);
  }

  deleteAllEvents(id) {
    this.eventDoc = this.eventCollection.doc<Events>(`${id}`);
    const userEvents = {
      events: []
    };
    return this.eventDoc.set(userEvents);
  }
}
