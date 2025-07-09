import React, { useState, useEffect } from "react";
import "./Calendar.css";

interface Event {
  title: string;
  date: string;
  startTime: string;
  remark: string;
  month: string;
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

  const closeForm = () => {
    setSelectedDay(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEvent = async () => {
    if (!selectedDay) return;

    const pad = (n: number) => n.toString().padStart(2, "0");
    const isoDate = new Date(
      `${year}-${pad(month)}-${pad(selectedDay)}T00:00:00.000Z`
    ).toISOString();

    const newEvent: Event = {
      title: formData.title,
      date: isoDate,
      startTime: formData.hour,
      remark: formData.remark,
      month: monthNames[month],
    };

    await fetch(`http://localhost:5000/api/events/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });

    const key = dateKey(selectedDay);
    setEvents((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newEvent],
    }));

    closeForm();
  };

  const generateCalendarCells = () => {
    const cells = [];

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
              <li key={idx} className="event-item">
                {ev.startTime} - {ev.title}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return cells;
  };

  useEffect(() => {
    const fetchEventsThisMonth = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/events/${monthNames[month]}`
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
            <h3>Schedule Event in {dateKey(selectedDay)}</h3>
            <input
              type="text"
              name="title"
              placeholder="Event title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <input
              type="time"
              name="hour"
              value={formData.hour}
              onChange={handleInputChange}
            />
            <textarea
              name="remark"
              placeholder="Remarks..."
              value={formData.remark}
              onChange={handleInputChange}
            ></textarea>
            <div className="modal-buttons">
              <button onClick={saveEvent}>Save</button>
              <button onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
