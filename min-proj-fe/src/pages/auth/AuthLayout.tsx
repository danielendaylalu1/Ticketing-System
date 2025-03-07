import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

const AuthLayout = () => {
  const token = localStorage.getItem("ticket-token");
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, []);
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
