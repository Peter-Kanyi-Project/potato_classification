import { useEffect, useState } from "react";
import "./History.css"; // Add styling if you want
import Title from "../../Components/Title/Title";
import Sidebar from "../../Components/Sidebar/sidebar";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("https://peter-kanyi-potato.hf.space/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="history-page">
      <Title subTitle="" title="Analysis History" />
      <Sidebar />

      <div className="history-list">
        {history.length === 0 ? (
          <p>No analysis history available.</p>
        ) : (
          history.map((item, index) => (
            <div className="history-card" key={index}>
              <img
                src={`https://peter-kanyi-potato.hf.space/uploads/${item.filename}?t=${Date.now()}`}
                alt="Uploaded"
                className="history-image"
              />
              <div className="history-info">
                <p><strong>Result:</strong> {item.result}</p>
                <p><strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
