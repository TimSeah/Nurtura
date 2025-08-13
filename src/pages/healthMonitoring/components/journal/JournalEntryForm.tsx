import React, { useState } from "react";
import "./JournalEntryForm.css";

interface JournalEntryFormProps {
  recipientId: string;
  recipientName: string;
  onSave?: () => void;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  recipientId,
  recipientName,
  onSave,
}) => {
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

  const saveJournal = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in both title and description");
      return;
    }

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          //userId: "123", // TODO: Get from user context
          recipientId: recipientId,
          title: title.trim(),
          description,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save journal");
      }

      // Reset form fields
      setTitle("");
      setDescription("");

      // Reset date to today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);

      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }

      alert("Journal entry saved successfully!");
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Error saving journal entry. Please try again.");
    }
  };

  return (
    <div className="journal-entry-form">
      <div className="form-group">
        <label htmlFor="journal-title">Title</label>
        <input
          id="journal-title"
          type="text"
          placeholder="Enter journal title..."
          value={title}
          maxLength={50}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="journal-date">Date</label>
        <input
          id="journal-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="journal-description">Description</label>
        <textarea
          id="journal-description"
          placeholder={`${recipientName}'s feelings and thoughts for today...`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className="modal-buttons">
        <button
          type="button"
          className="btn btn-primary"
          onClick={saveJournal}
          disabled={!title.trim() || !description.trim()}
        >
          Save Journal
        </button>
      </div>
    </div>
  );
};

export default JournalEntryForm;
