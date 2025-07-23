import { useState, useEffect } from "react";
import "./healthmonitoring.css";

interface Carerecepient {
  _id?: string;
  name: string;
  remark: string;
  caregiverId: string;
}

const HealthMonitoring = () => {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [recepients, setRecepients] = useState<Carerecepient[]>([]);
  const dummyId = "123";

  const saveRecepient = async () => {
    const newRecepient: Carerecepient = {
      name,
      remark,
      caregiverId: dummyId,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/carerecepients/`,
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
        `http://localhost:5000/api/carerecepients/${dummyId}`
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
    <div className="health-monitoring">
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
            <strong>{r.name}</strong>: {r.remark}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthMonitoring;
