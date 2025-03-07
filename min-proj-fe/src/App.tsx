import { Link, useNavigate } from "react-router";
import "./App.css";
import { Button, Form, Input, Modal, Select, Spin } from "antd";
import { useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";
import axios from "axios";

type FieldType = {
  title: string;
  description: string;
  status: "open" | "inprogress" | "closed";
};
interface CustomJwtPayload extends JwtPayload {
  role?: string;
}

export const getUserInfo = (token: string | null) => {
  if (!token) return null;
  try {
    const decodedToken: CustomJwtPayload = jwtDecode(token);

    return decodedToken;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode the payload
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    return null;
  }
};

const scheduleAutoLogout = (token: string, logout: () => void) => {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) return;

  const delay = expiresAt - Date.now(); // Time remaining
  if (delay > 0) {
    setTimeout(logout, delay);
  } else {
    logout(); // Logout immediately if expired
  }
};

function App() {
  const token = localStorage.getItem("ticket-token");
  const decodedtocken = getUserInfo(token);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  if (token) {
    scheduleAutoLogout(token, () => {
      localStorage.removeItem("ticket-token"); // Clear token
      window.location.href = "/login"; // Redirect to login
    });
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState<null | boolean>(null);
  const [message, setMessage] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FieldType) => {
    setMessage("");
    setIsLoading(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URI;
    try {
      const response = await axios.post(`${baseUrl}/tickets`, values, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token
          "Content-Type": "application/json", // Optional
        },
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setMessage("Ticket created successfuly!");
        form.resetFields();
      }
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again!";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage =
            error.response.data.message ||
            `Error: ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
      }
      setIsSuccess(false);
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSuccess(null);
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="h-dvh">
      <div className="flex flex-col items-center justify-center px-4 h-full gap-4">
        <h1 className="text-4xl font-bold text-center lg:w-1/2 md:w-[80%]">
          Wellcome to mini ticket system where you can create and manage tickets
        </h1>
        {!decodedtocken ? (
          <div className="flex flex-col gap-4 items-center">
            <p>Register to view and create tickets.</p>
            <Link to={"/login"}>
              <Button variant="solid" color="default">
                Register / Login
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <Button variant="solid" color="default" onClick={openModal}>
                Create Ticket
              </Button>
              <Link to={"/tickets"}>
                <Button variant="solid" color="default">
                  {decodedtocken.role === "admin"
                    ? "manage tickets"
                    : "View Tickets"}
                </Button>
              </Link>
            </div>
            <Button
              variant="outlined"
              color="danger"
              onClick={() => {
                localStorage.removeItem("ticket-token");
                setTimeout(() => {
                  navigate("/");
                }, 400);
              }}
            >
              Logout
            </Button>
          </div>
        )}

        <Modal
          title="Create Ticket"
          open={isModalOpen}
          footer={null}
          onCancel={() => setIsModalOpen(false)}
        >
          <p
            className={`${
              isSuccess !== null
                ? !isSuccess
                  ? "text-red-600"
                  : "text-green-600"
                : "d-none"
            }`}
          >
            {message}
          </p>
          <Form layout={"vertical"} onFinish={onSubmit} form={form}>
            <Form.Item<FieldType>
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input the title" }]}
            >
              <Input placeholder="ticket title" />
            </Form.Item>
            <Form.Item<FieldType>
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please input the description" },
              ]}
            >
              <Input placeholder="description..." />
            </Form.Item>
            <Form.Item<FieldType>
              name="status"
              label="Status"
              rules={[
                {
                  required: true,
                  message: "Please choose status of the ticket",
                },
              ]}
            >
              <Select
                options={[
                  {
                    value: "open",
                    label: <span className="text-blue-400">Open</span>,
                  },
                  {
                    value: "inprogress",
                    label: <span className="text-yellow-400">In progress</span>,
                  },
                  {
                    value: "closed",
                    label: <span className="text-red-400">Closed</span>,
                  },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button
                color="default"
                variant="solid"
                type="primary"
                htmlType="submit"
                disabled={isLoading}
              >
                {isLoading ? <Spin size="small" /> : "Submit"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default App;
