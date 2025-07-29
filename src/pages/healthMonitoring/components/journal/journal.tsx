import "./journal.css";
import { useState, useEffect } from "react";

interface Journal {
  _id: string; // Added _id for MongoDB
  title: string;
  userId: string;
  recipientId: string;
  description: string;
  date: string; // Changed to string for easier handling
}

interface JournalProps {
  recipientId: string;

}

const Journal: React.FC<JournalProps> = ({ recipientId }) => {
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

  // We fetch the journals for this recipient (scoped for this user)
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/journal?recipientId=${recipientId}`,
          { credentials: "include" }
        );
         if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data: Journal[] = await response.json();
        setJournalList(data);
      } catch (error) {
        console.log("Error fetching journals: ", error);
      }
    };
    fetchJournals();
  }, [recipientId]); //use this dependency

  const saveJournal = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/journal", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          //userId: "123", // hardcoded
          recipientId,//: "456", // hardcoded
          title: title.trim(),
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

  //const dummyId = "456";

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    if (selectedJournal) {
      setEditTitle(selectedJournal.title);
      setEditDescription(selectedJournal.description);
      setEditDate(selectedJournal.date);
      setIsEditing(false);
    }
  }, [selectedJournal]);

  const handleEditJournal = async () => {
    if (!selectedJournal) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/journal/journalId/${selectedJournal._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            date: editDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update journal");
      }

      const updatedJournal = await response.json();

      // Update UI
      setJournalList(
        journalList.map((j) =>
          j._id === updatedJournal._id ? updatedJournal : j
        )
      );
      setSelectedJournal(updatedJournal);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating journal:", error);
    }
  };

  const handleDeleteJournal = async () => {
    if (!selectedJournal) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/journal/journalId/${selectedJournal._id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete journal");
      }

      // Update UI
      setJournalList(journalList.filter((j) => j._id !== selectedJournal._id));
      setSelectedJournal(null);
    } catch (error) {
      console.error("Error deleting journal:", error);
    }
  };

  return (
    <>
      <div className="journal-post-container">
        <div className="journal-post">
          <h2>New Journal Entry </h2>
          <div className="title-and-date">
            <input
              type="text"
              placeholder="Title"
              value={title}
              maxLength={30}
              className="title-input"
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="date"
              value={date}
              className="date-input"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <textarea
            placeholder={`Your feelings and thoughts for today...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button onClick={saveJournal}>Save Journal</button>
        </div>
      </div>

      <div className="journal-entries">
        {selectedJournal && (
          <div className="journal-entry-details">
            {isEditing ? (
              <div className="edit-journal-form">
                <h2>Edit Journal Entry</h2>
                <input
                  type="text"
                  value={editTitle}
                  className="journal-title-input"
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="date"
                  value={editDate ? editDate : selectedJournal.date}
                  className="journal-date-input"
                  onChange={(e) => setEditDate(e.target.value)}
                />
                <textarea
                  value={editDescription}
                  className="journal-description-input"
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="buttons">
                  <button onClick={handleEditJournal} className="save">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)}>
                    Don't Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>{selectedJournal.title}</h3>
                <h4>{new Date(selectedJournal.date).toLocaleDateString()}</h4>
                <p>{selectedJournal.description}</p>
                {/* Add Edit and Delete buttons */}
                <div className="buttons">
                  <button onClick={() => setIsEditing(true)} id="edit">
                    Edit
                  </button>
                  <button onClick={handleDeleteJournal} id="delete">
                    Delete
                  </button>
                </div>
              </>
            )}
            <button onClick={() => setSelectedJournal(null)}>Close</button>
          </div>
        )}
        <h2>Your Journal Entries </h2>
        <div className="journal-entries-container">
          {journalList.length === 0 ? (
            <p>No journal entries found</p>
          ) : (
            journalList.map((journal) => (
              <div
                key={journal._id}
                className="journal-entry"
                onClick={() => setSelectedJournal(journal)}
              >
                <h4>{new Date(journal.date).toLocaleDateString()}</h4>
                <h3>{journal.title}</h3>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Journal;
