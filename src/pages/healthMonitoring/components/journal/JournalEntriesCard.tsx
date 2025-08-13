import React, { useState, useEffect } from "react";
import { Calendar, BookOpen, Edit, Trash2, Plus } from "lucide-react";
import "./JournalEntriesCard.css";

interface Journal {
  _id: string;
  title: string;
  userId: string;
  recipientId: string;
  description: string;
  date: string;
}

interface JournalEntriesCardProps {
  recipientId: string;
  recipientName: string;
  onAddJournal?: () => void;
}

const JournalEntriesCard: React.FC<JournalEntriesCardProps> = ({
  recipientId,
  recipientName,
  onAddJournal,
}) => {
  const [journalList, setJournalList] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
  }, [recipientId]);

  useEffect(() => {
    if (selectedJournal) {
      setEditTitle(selectedJournal.title);
      setEditDescription(selectedJournal.description);
      setEditDate(selectedJournal.date);
      setIsEditing(false);
    }
  }, [selectedJournal]);

  const fetchJournals = async () => {
    if (!recipientId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/journal?recipientId=${recipientId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data: Journal[] = await response.json();
        setJournalList(data);
      } else {
        console.log("Error fetching journals");
        setJournalList([]);
      }
    } catch (error) {
      console.log("Error fetching journals: ", error);
      setJournalList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJournal = async () => {
    if (!selectedJournal) return;

    try {
      const response = await fetch(`/api/journal/${selectedJournal._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          date: editDate,
        }),
      });

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
      alert("Error updating journal entry. Please try again.");
    }
  };

  const handleDeleteJournal = async () => {
    if (!selectedJournal) return;

    if (
      !window.confirm("Are you sure you want to delete this journal entry?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/${selectedJournal._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete journal");
      }

      // Update UI
      setJournalList(journalList.filter((j) => j._id !== selectedJournal._id));
      setSelectedJournal(null);
    } catch (error) {
      console.error("Error deleting journal:", error);
      alert("Error deleting journal entry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <BookOpen className="title-icon" />
            Journal Entries - {recipientName}
          </h2>
          {onAddJournal && (
            <div className="card-actions">
              <button className="btn btn-primary" onClick={onAddJournal}>
                <Plus className="btn-icon" />
                Add New Journal
              </button>
            </div>
          )}
        </div>
        <div className="journal-loading">
          <p>Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <BookOpen className="title-icon" />
          Journal Entries - {recipientName}
        </h2>
        {onAddJournal && (
          <div className="card-actions">
            <button className="btn btn-primary" onClick={onAddJournal}>
              <Plus className="btn-icon" />
              Add New Journal
            </button>
          </div>
        )}
      </div>

      <div className="journal-entries-content">
        {journalList.length === 0 ? (
          <div className="no-entries">
            <BookOpen className="no-entries-icon" />
            <p>No journal entries found for {recipientName}</p>
            <p className="no-entries-subtitle">
              Use the "Add New Journal" button above to get started
            </p>
          </div>
        ) : (
          <div className="journal-entries-grid">
            {journalList.map((journal) => (
              <div
                key={journal._id}
                className="journal-card"
                onClick={() => setSelectedJournal(journal)}
              >
                <div className="journal-card-date">
                  <Calendar className="date-icon" />
                  {new Date(journal.date).toLocaleDateString()}
                </div>
                <h4 className="journal-card-title">{journal.title}</h4>
                <p className="journal-card-preview">
                  {journal.description.length > 100
                    ? `${journal.description.substring(0, 100)}...`
                    : journal.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journal Detail Modal */}
      {selectedJournal && (
        <div
          className="journal-modal-overlay"
          onClick={() => setSelectedJournal(null)}
        >
          <div className="journal-modal" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div className="edit-journal-form">
                <h3>Edit Journal Entry</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={8}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    onClick={handleEditJournal}
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="journal-detail-header">
                  <h3>{selectedJournal.title}</h3>
                  <div className="journal-detail-date">
                    <Calendar className="date-icon" />
                    {new Date(selectedJournal.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="journal-detail-content">
                  <p>{selectedJournal.description}</p>
                </div>
                <div className="modal-actions">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary"
                  >
                    <Edit className="btn-icon" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteJournal}
                    className="btn btn-danger"
                  >
                    <Trash2 className="btn-icon" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedJournal(null)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntriesCard;
