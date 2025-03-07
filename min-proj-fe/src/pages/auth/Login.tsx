import { Button, Form, Input, Spin } from "antd";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useState } from "react";

interface FieldType {
  email: string;
  password: string;
}

const Login = () => {
  const [form] = Form.useForm<FieldType>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState<null | boolean>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (values: FieldType) => {
    setMessage("");
    setIsLoading(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URI;
    try {
      const response = await axios.post(`${baseUrl}/auth/login`, values);

      if (response.status === 200) {
        setIsSuccess(true);
        setMessage("Wellcome again");
        localStorage.setItem("ticket-token", response.data.token);
        setTimeout(() => {
          navigate("/");
        }, 600);
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
    <div className="min-h-dvh flex items-center justify-center !p-6 w-full">
      <div className=" lg:w-1/3 min-w-[350px] !p-6 border flex flex-col gap-4 justify-center items-center bg-white border-gray-50 shadow-lg rounded-lg">
        <h3>Wellcome again!</h3>
        <p
          className={`${
            isSuccess !== null
              ? !isSuccess
                ? "text-red-600"
                : "text-green-600"
              : "d-none"
          } text-xs`}
        >
          {message}
        </p>
        <Form
          layout={"vertical"}
          onFinish={onSubmit}
          form={form}
          className="w-[90%]"
        >
          <Form.Item<FieldType>
            name="email"
            label="email"
            rules={[{ required: true, message: "Please input your email" }]}
          >
            <Input placeholder="email@gmail.com" />
          </Form.Item>
          <Form.Item<FieldType>
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password" }]}
          >
            <Input.Password placeholder="password..." />
          </Form.Item>

          <Form.Item>
            <Button
              color="default"
              variant="solid"
              type="primary"
              htmlType="submit"
              disabled={isLoading}
            >
              {isLoading ? <Spin size="small" /> : "Login"}
            </Button>
          </Form.Item>
          <div className="flex flex-col gap-1">
            <p>
              <span className="text-xs text-zinc-700">Have no account? </span>
              <Link to="/register">Register</Link>
            </p>
            <Link to="/" className="text-blue-600 text-sm self-start">
              HomePage
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
