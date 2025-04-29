import React from "react";
import "./About.css";
import about_img from "../../assets/grab.jpg";

const About = ({ setPlayState }) => {
  return (
    <div className="about">
      <div className="about-left">
        <img src={about_img} alt="" className="about-img" />
      </div>
      <div className="about-right">
        <h2>About</h2>
        <h3>Take a look at our work</h3>
        <p></p>
        <p>
        This AI-powered tool is built to detect and classify potato leaf diseases—specifically 
        Early Blight, Late Blight, and Healthy leaves—by analyzing simple images of potato plants.
        </p>
        <p>
        Using state-of-the-art machine learning, it delivers fast, accurate, and reliable 
        results to help farmers, agronomists, and researchers take early action. The goal 
        is to reduce crop losses, improve disease management, and support healthier harvests 
        through early and accessible plant health diagnostics.
        Whether you're working in the field or in the lab, this tool helps you stay ahead of
        crop diseases.
        </p>
        <p>
        Detect early. Act fast. Harvest more. 🌱
        </p>
      </div>
    </div>
  );
};

export default About;
