import { Button, Form, Input, Select, Spin } from "antd";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

interface FieldType {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

const Register = () => {
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
      const response = await axios.post(`${baseUrl}/auth/signup`, values);

      if (response.status === 201) {
        setIsSuccess(true);
        setMessage("registerd successfuly!");
        setTimeout(() => {
          navigate("/login");
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
    <div className="min-h-dvh flex justify-center items-center !p-6 w-full">
      <div className="lg:w-1/3 min-w-[350px] !p-6 border flex flex-col gap-4 justify-center items-center bg-white border-gray-50 shadow-xl rounded-lg">
        <h3>Hello there Wellcome to mini ticket.</h3>
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
        <Form
          layout={"vertical"}
          onFinish={onSubmit}
          form={form}
          className="w-[90%]"
        >
          <Form.Item<FieldType>
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name" }]}
          >
            <Input placeholder="name" />
          </Form.Item>
          <Form.Item<FieldType>
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input your name" }]}
          >
            <Input placeholder="example@gmail.com" />
          </Form.Item>
          <Form.Item<FieldType>
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password" }]}
          >
            <Input.Password placeholder="password..." />
          </Form.Item>
          <Form.Item<FieldType> name="role" label="Role">
            <Select
              // defaultValue={"user"}
              options={[
                {
                  value: "user",
                  label: <span>User</span>,
                },
                {
                  value: "admin",
                  label: <span>Admin</span>,
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("role") === "admin" ? (
                <Form.Item
                  name="adminsecret"
                  label="Role Secret key"
                  rules={[
                    { required: true, message: "Please input admin secret" },
                  ]}
                >
                  <Input />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item>
            <Button
              color="default"
              variant="solid"
              type="primary"
              htmlType="submit"
              disabled={isLoading}
            >
              {isLoading ? <Spin size="small" /> : "Sign up"}
            </Button>
          </Form.Item>
          <div className="flex flex-col gap-1">
            <p>
              <span className="text-xs text-zinc-700">
                Already have an account?{" "}
              </span>
              <Link to="/login">Login</Link>
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

export default Register;
