export interface CalendarEvents {
    eventId: number;
    title: string;
    location: string;
    description: string;
    start: string;
    end: string;
    remind: number;
    allDay: boolean;
}

export interface Events {
    id?: string;
    events: CalendarEvents[];
}

