import "./journal.css";
import { useState, useEffect } from "react";

interface Journal {
  _id: string; // Added _id for MongoDB
  title: string;
  description: string;
  date: string; // Changed to string for easier handling
}

const Journal = () => {
  const [journalList, setJournalList] = useState<Journal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Initialize date to today in YYYY-MM-DD format
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/journal/123");
        const data: Journal[] = await response.json();
        setJournalList(data);
      } catch (error) {
        console.log("Error fetching journals: ", error);
      }
    };
    fetchJournals();
  }, []);

  const saveJournal = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "123", // Using same userId as fetch
          title,
          description,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save journal");
      }

      const savedJournal: Journal = await response.json();

      // Update UI with new journal
      setJournalList([...journalList, savedJournal]);

      // Reset form fields
      setTitle("");
      setDescription("");

      // Reset date to today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);
    } catch (error) {
      console.error("Error saving journal:", error);
    }
  };

  return (
    <>
      <h1>Journal Entries</h1>
      <div className="journal-post-container">
        <div className="journal-post">
          <h2>New Journal Entry</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button onClick={saveJournal}>Save Journal</button>
        </div>
      </div>

      <div className="journal-entries-container">
        <h2>Your Journal Entries</h2>
        {journalList.length === 0 ? (
          <p>No journal entries found</p>
        ) : (
          journalList.map((journal) => (
            <div key={journal._id} className="journal-entry">
              <h3>{journal.title}</h3>
              <p className="journal-date">
                {new Date(journal.date).toLocaleDateString()}
              </p>
              <p>{journal.description}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Journal;
