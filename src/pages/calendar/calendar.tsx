import React, { useState, useEffect } from "react";
import "./Calendar.css";

interface Event {
  _id?: string;
  title: string;
  date: string;
  startTime: string;
  remark: string;
  month: string;
  userId: string;
  reminderSent?: boolean;
  reminderEmail?: string;
  enableReminder?: boolean;
}

interface EventMap {
  [date: string]: Event[];
}

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const Calendar: React.FC = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth())
  );
  const [events, setEvents] = useState<EventMap>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", hour: "", remark: "" });

  const [editingEvent, setEditingEvent] = useState<{
    key: string;
    index: number;
  } | null>(null);

  const [editFormData, setEditFormData] = useState({
    title: "",
    hour: "",
    remark: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const dateKey = (day: number) => `${year}-${month + 1}-${day}`;

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const openForm = (day: number) => {
    setSelectedDay(day);
    setFormData({ title: "", hour: "", remark: "" });
  };

  const openEditForm = (key: string, index: number) => {
    const event = events[key][index];
    console.log("Editing event:", event);
    setEditingEvent({ key, index });
    setEditFormData({
      title: event.title,
      hour: event.startTime,
      remark: event.remark,
    });
  };

  const closeForm = () => {
    setSelectedDay(null);
    setEditingEvent(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateEvent = async () => {
    if (!editingEvent) return;
    const { key, index } = editingEvent;
    const event = events[key][index];

    const updatedEvent: Event = {
      ...event,
      title: editFormData.title,
      startTime: editFormData.hour,
      remark: editFormData.remark,
    };

    try {
      await fetch(`http://localhost:5000/api/events/${event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      setEvents((prev) => {
        const updatedEvents = [...prev[key]];
        updatedEvents[index] = updatedEvent;
        return { ...prev, [key]: updatedEvents };
      });
      setEditingEvent(null);
    } catch (error) {
      console.error("Error updating event: ", error);
    }

    closeForm();
  };

  const saveEvent = async () => {
    if (!selectedDay) return;

    const pad = (n: number) => n.toString().padStart(2, "0");
    const isoDate = new Date(
      `${year}-${pad(month + 1)}-${pad(selectedDay)}T00:00:00.000Z`
    ).toISOString();

    const newEvent: Event = {
      title: formData.title,
      date: isoDate,
      startTime: formData.hour,
      remark: formData.remark,
      month: monthNames[month],
      userId: defaultId, // CHANGE TO ACTUAL USER ID LATER
      enableReminder: true, // Enable reminders by default
      reminderSent: false
    };

    try {
      const response = await fetch(`http://localhost:5000/api/events/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        
        const key = dateKey(selectedDay);
        setEvents((prev) => ({
          ...prev,
          [key]: [...(prev[key] || []), savedEvent],
        }));
      } else {
        console.error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }

    closeForm();
  };

  const deleteEvent = async (key: string, index: number) => {
    const event = events[key][index];
    try {
      await fetch(`http://localhost:5000/api/events/${event._id}`, {
        method: "DELETE",
        // headers: { "Content-Type": "application/json"},
        // body: JSON.stringify(event),
      });
      setEvents((prev) => {
        const updatedEvents = [...prev[key]];
        updatedEvents.splice(index, 1);
        return { ...prev, [key]: updatedEvents };
      });
      setEditingEvent(null);
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  const generateCalendarCells = (): React.ReactElement[] => {
    const cells: React.ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(day);
      cells.push(
        <div
          key={day}
          className={`calendar-day ${isToday(day) ? "today" : ""}`}
          onClick={() => openForm(day)}
        >
          <div className="day-number">{day}</div>
          <ul className="event-list">
            {(events[key] || []).map((ev, idx) => (
              <button
                key={idx}
                className={`event-item`}
                style={{ "--color-index": day % 5 } as React.CSSProperties}
                onClick={() => {
                  openEditForm(key, idx);
                }}
              >
                <div>{ev.title} </div>
                <div className="time">{ev.startTime}</div>
              </button>
            ))}
          </ul>
        </div>
      );
    }

    return cells;
  };

  const defaultId = "123";

  useEffect(() => {
    const fetchEventsThisMonth = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/events/month/${monthNames[month]}/${defaultId}`
        );
        if (!response.ok)
          throw new Error("Failed to fetch events for this month");

        const data: Event[] = await response.json();
        const eventMap: EventMap = {};

        data.forEach((event) => {
          const day = new Date(event.date).getDate();
          const key = dateKey(day);

          if (!eventMap[key]) {
            eventMap[key] = [];
          }

          eventMap[key].push(event);
        });

        setEvents(eventMap);
      } catch (err) {
        console.log("Error in fetching data for this month", err);
      }
    };

    fetchEventsThisMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          className="nav-button"
        >
          &lt; Previous Month
        </button>
        <h2 className="month-title">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          className="nav-button"
        >
          Next Month &gt;
        </button>
      </div>

      <div className="calendar-weekdays">
        {daysOfWeek.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{generateCalendarCells()}</div>

      {selectedDay && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingEvent ? "Edit Event" : "Schedule Event"} in{" "}
              {dateKey(selectedDay)}
            </h3>
            <input
              type="text"
              name="title"
              placeholder={
                editingEvent ? editFormData.title : "e.g. Doctor's Appointment"
              }
              value={editingEvent ? editFormData.title : formData.title}
              onChange={
                editingEvent ? handleEditInputChange : handleInputChange
              }
            />
            <input
              type="time"
              name="hour"
              value={editingEvent ? editFormData.hour : formData.hour}
              onChange={
                editingEvent ? handleEditInputChange : handleInputChange
              }
            />
            <textarea
              name="remark"
              placeholder={
                editingEvent
                  ? editFormData.remark
                  : "Add remarks e.g. bring documents"
              }
              value={editingEvent ? editFormData.remark : formData.remark}
              onChange={
                editingEvent ? handleEditInputChange : handleInputChange
              }
            ></textarea>
            <div className="modal-buttons">
              <button onClick={editingEvent ? updateEvent : saveEvent}>
                Save
              </button>
              {editingEvent && (
                <>
                  <button
                    onClick={() => {
                      deleteEvent(editingEvent.key, editingEvent.index);
                      closeForm();
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const event = events[editingEvent.key][editingEvent.index];
                        const response = await fetch(`http://localhost:5000/api/events/${event._id}/send-reminder`, {
                          method: 'POST'
                        });
                        if (response.ok) {
                          alert('Test reminder sent successfully!');
                        } else {
                          alert('Failed to send test reminder');
                        }
                      } catch (error) {
                        console.error('Error sending test reminder:', error);
                        alert('Error sending test reminder');
                      }
                    }}
                  >
                    Test Reminder
                  </button>
                </>
              )}
              <button onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
