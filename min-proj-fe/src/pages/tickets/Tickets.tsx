import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Select,
  Spin,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { EditOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { getUserInfo } from "@/App";

interface TicketType {
  createdAt: string;
  description: string;
  status: "open" | "inprogress" | "closed";
  title: string;
  updatedAt: string;
  user: {
    email: string;
    name: string;
    _id: string;
  };
  _id: string;
}

type statusType = "open" | "inprogress" | "closed";

const Tickets = () => {
  const token = localStorage.getItem("ticket-token");
  const decodedToken = getUserInfo(token);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [message, setMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSuccess, setIsSuccess] = useState<null | boolean>(null);
  const [newStatus, setNewStatus] = useState<statusType>("open");
  const [selectedTicket, setSelectedTicket] = useState("");

  const fetchTickets = async () => {
    setErrorMessage("");
    setIsLoading(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URI;
    const token = localStorage.getItem("ticket-token");
    try {
      const tickets = await axios.get(`${baseUrl}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
      });
      const data: TicketType[] = tickets.data;
      setTickets(data);

      console.log("tickets", tickets);
    } catch (error) {
      let errorMessage = "Faild to fetch tickets";

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
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (tiketId: string, newStatus: statusType) => {
    setMessage("");
    setIsUpdateLoading(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URI;
    try {
      console.log("baseUrl", baseUrl);
      const response = await axios.put(
        `${baseUrl}/tickets/${tiketId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token
            "Content-Type": "application/json", // Optional
          },
        }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        setMessage("Ticket updated successfuly!");
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
      setIsUpdateLoading(false);
      setTimeout(() => {
        setIsSuccess(null);
        setMessage("");
      }, 3000);
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchTickets();
  }, [token]);

  const handleTimeFormat = (time: string) => {
    const date = new Date(time);
    return date.toLocaleDateString();
  };
  // const { Meta } = Card;
  return (
    <div className="!p-6 flex flex-col gap-8">
      <Breadcrumb
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },

          {
            title: "Tickets",
          },
        ]}
      />
      {isLoading ? (
        <Spin className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-8" />
      ) : errorMessage !== "" ? (
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : (
        <Row gutter={8}>
          {tickets.map((ticket) => (
            <Col span={8} key={ticket._id}>
              <Card
                className="min-w-[280px]"
                title={
                  <p className="flex items-center justify-between gap-x-2 !mt-4">
                    <Avatar icon={<UserOutlined />} />{" "}
                    <span className="text-xl">{ticket.title}</span>
                    <span
                      className={`text-sm font-bold cursor-pointer ${
                        ticket.status === "inprogress"
                          ? "text-amber-400"
                          : ticket.status === "open"
                          ? "text-blue-600"
                          : "text-red-800"
                      }`}
                      onClick={() => {
                        if (decodedToken?.role === "admin") {
                          setSelectedTicket(ticket._id);
                          setNewStatus(ticket.status);
                          setIsModalOpen(true);
                        }
                      }}
                    >
                      {ticket.status}
                      {decodedToken && decodedToken.role === "admin" && (
                        <EditOutlined key="edit" />
                      )}
                    </span>
                  </p>
                }
              >
                <p>{ticket.description}</p>

                <p className="text-ms text-zinc-500 w-full flex justify-between items-center !mt-8">
                  <span className="text-zinc-700">created at:</span>{" "}
                  <span className="text-xs">
                    {handleTimeFormat(ticket.createdAt)}
                  </span>
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Update Ticket status"
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

        <div className="flex flex-col gap-4">
          <Select
            defaultValue={newStatus}
            onChange={(value) => setNewStatus(value)}
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

          <Button
            color="default"
            variant="solid"
            type="primary"
            // htmlType="submit"
            disabled={isUpdateLoading}
            onClick={() => onSubmit(selectedTicket, newStatus)}
          >
            {isUpdateLoading ? <Spin size="small" /> : "Submit"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Tickets;
