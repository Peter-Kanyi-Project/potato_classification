import React from "react";
import "./How.css";
import step1 from "../../assets/step1.png";
import step2 from "../../assets/step2.png";
import step3 from "../../assets/step3.png";
import { Link } from "react-router-dom";

const How = () => {
  return (
    <div className="how-it-works">
      <div className="steps">
        <div className="step">
          <Link to="/model">
            <img src={step1} alt="Step 1" />
            <h3>Upload Image</h3>
            <p>
              Take an image of a potato leaf and upload it.
            </p>
          </Link>
        </div>

        <div className="step">
          <Link to="/model">
            <img src={step2} alt="Step 2" />
            <h3>Click Predict</h3>
            <p>
              Hit the "Predict" button, and our AI will analyze your Image
              instantly.
            </p>
          </Link>
        </div>

        <div className="step">
          <Link to="/model">
            <img src={step3} alt="Step 3" />
            <h3>Get Your Results</h3>
            <p>
              Recieve feedback Whether the leaf is healthy or not.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default How;
