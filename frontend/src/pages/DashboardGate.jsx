import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DashboardGate = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        await api.get("/dashboard/alerts/status");
        setLoading(false);
      } catch (error) {
        if (
          error.response?.status === 403 &&
          error.response?.data?.redirectTo === "/onboarding"
        ) {
          navigate("/onboarding");
        } else {
          navigate("/login");
        }
      }
    };

    checkAccess();
  }, [navigate]);

  if (loading) return null;

  return children;
};

export default DashboardGate;
