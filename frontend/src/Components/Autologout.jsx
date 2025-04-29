import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the local storage when the page is closed or reloaded
    window.onbeforeunload = () => {
      localStorage.removeItem("token");  // Remove the access token
    };

    // Cleanup the onbeforeunload event when the component unmounts
    return () => {
      window.onbeforeunload = null;
    };
  }, [navigate]);

  return null;
};

export default AutoLogout;
