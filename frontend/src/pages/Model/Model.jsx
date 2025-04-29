import { useState, useEffect } from "react";
import "./Model.css";
import Title from '../../Components/Title/Title';
import { Link, useNavigate } from "react-router-dom";
import Sidebar from '../../Components/Sidebar/sidebar';

const Model = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload an image first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    const token = localStorage.getItem("token"); // get token from localStorage
  
    try {
      const response = await fetch("https://peter-kanyi-potato.hf.space/predict", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction failed");
      }
  
      const data = await response.json();
      navigate("/result", { state: data });
  
    } catch (error) {
      console.error("Error making prediction:", error.message);
      alert("Prediction failed: " + error.message);
    }
  };
  

  const [mobileMenu, setMobileMenu] = useState(false)
  const toggleMenu = () =>{
        mobileMenu ? setMobileMenu(false) : setMobileMenu(true);
    }

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="model_container">
      <Title subTitle={" "} title='Potato Leaf Disease Detection AI' />
      <Sidebar/>
      <div className="upload-card">
      <div className="upload-container" onDrop={handleDrop} onDragOver={handleDragOver}>
        {preview ? (
          <img src={preview} alt="Uploaded" className="preview-image" />
        ) : (
          <h3>Drag & Drop an image here or click to upload</h3>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="upload-btn" />
      </div>

      <button className="model_button" onClick={handleSubmit}>Predict</button>
    </div>
    </div>
  );
};

export default Model;