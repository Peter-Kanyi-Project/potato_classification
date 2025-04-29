import React, { useState, useEffect } from 'react';
import "./Results.css";
import Title from '../../Components/Title/Title';
import { Link, useLocation } from "react-router-dom";
import Sidebar from '../../Components/Sidebar/sidebar';

const Result = () => {
    const location = useLocation();
    const prediction = location.state || {};

    const [mobileMenu, setMobileMenu] = useState(false);
    const toggleMenu = () => setMobileMenu(prev => !prev);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // Simulate loading

        return () => clearTimeout(timer);
    }, []);

    const renderResultMessage = (resultClass) => {
        switch (resultClass) {
            case "Early Blight":
                return (
                    <div className="result-card early-blight">
                        <p className="result-text high-risk-text">⚠️ Early Blight Detected</p>
                    </div>
                );
            case "Late Blight":
                return (
                    <div className="result-card late-blight">
                        <p className="result-text high-risk-text">⚠️ Late Blight Detected</p>
                    </div>
                );
            case "Healthy":
                return (
                    <div className="result-card healthy">
                        <p className="result-text low-risk-text">✅ Plant is Healthy</p>
                    </div>
                );
            default:
                return (
                    <p className="error-text">❌ Error: Unknown result</p>
                );
        }
    };

    return (
        <div>
            <div className="model_container">
                <Title subTitle={" "} title='Potato Leaf Disease Detection AI' />
                <Sidebar />
                <div className="content">
                    {loading ? (
                        <p className="loading-text">⌛ Analyzing Image...</p>
                    ) : (
                        renderResultMessage(prediction.class)
                    )}

                    <div className="result-actions">
                        <Link to="/model" className="btn">Try Again</Link>
                        <Link to="/" className="btn">Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
