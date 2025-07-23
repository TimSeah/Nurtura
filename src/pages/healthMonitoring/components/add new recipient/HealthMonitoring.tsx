import { useState, useEffect } from "react";
import "./healthmonitoring.css";
import { CareRecipient } from "../../../../types";

const HealthMonitoring = () => {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [recepients, setRecepients] = useState<CareRecipient[]>([]);

  const saveRecepient = async () => {
    const newRecepient = {
      name,
      relationship: remark, // Map the remark field to relationship
      dateOfBirth: new Date(), // You'll need to add a date picker for this
      medicalConditions: [],
      medications: [],
      emergencyContacts: [],
      caregiverNotes: "",
      isActive: true
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/care-recipients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRecepient),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save recepient");
      }

      const data = await response.json();
      console.log("Saved recepient:", data);
      alert("Recepient added!");
      setName("");
      setRemark("");

      await getRecepients();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add recepient");
    }
  };

  const getRecepients = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/care-recipients`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch care recipients");
      }
      const data = await response.json();
      setRecepients(data);
    } catch (error) {
      console.error("Error fetching recepients:", error);
      alert("Could not load care recipients");
    }
  };

  useEffect(() => {
    getRecepients();
  }, []);

  return (
    <div>
      <h3>Add Care Recepient</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Remark"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />
      <button onClick={saveRecepient}>Add Care Recepient</button>
      <ul>
        {recepients.map((r, i) => (
          <li key={r._id || i}>
            <strong>{r.name}</strong>: {r.relationship}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthMonitoring;
