import Input from "../../components/Input";
import Button from "../../components/Button";
import "./style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Form = ({ isSignInPage = true }) => {
  const [data, setData] = useState({
    ...(isSignInPage ? {} : { fullName: "" }), // Corrected bracket placement
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log('data=', data);
    e.preventDefault();
   
    const res = await fetch(
      `http://localhost:8000/api/${isSignInPage ? "login" : "register"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const resData = await res.json();
    
    if (res.status === 400) {
      alert(resData.message || "Please fill the required fields");
    } else if (res.status === 200) {
      if (resData.token) {
        localStorage.setItem('user:token', resData.token);
        localStorage.setItem('user:detail', JSON.stringify(resData.user));
        navigate('/');
      } else {
        alert(resData.message || "Registration successful");
        if (!isSignInPage) {
          navigate('/users/sign_in');
        }
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white w-full max-w-md mx-4 p-8 rounded-2xl shadow-xl">
        <div className="text-3xl font-bold mb-2 text-gray-800 text-center animate-fade-in">
          Welcome {isSignInPage && "Back"}
        </div>
        <div className="text-lg mb-8 text-gray-600 text-center">
          {isSignInPage
            ? "Sign in now to get started"
            : "Sign up now to get started"}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isSignInPage && (
            <Input
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
            />
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          <Button label={isSignInPage ? "Sign in" : "Sign up"} type="submit" />
        </form>
        <div className="text-center mt-6 text-gray-600">
          {isSignInPage
            ? "Don't have an account?"
            : "Already have an account?"}
          <span
            className="text-blue-600 cursor-pointer ml-1 underline hover:text-blue-800 transition-colors"
            onClick={() =>
              navigate(`/users/${isSignInPage ? "sign_up" : "sign_in"}`)
            }
          >
            {isSignInPage ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Form;
