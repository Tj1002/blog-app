import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import OAuth from "../components/OAuth";

import toast from "react-hot-toast";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  function handleChange(e) {
    e.preventDefault();
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      dispatch(signInFailure("Please fill all the field"));
      return setError("Please fill all the field");
    }
    try {
      dispatch(signInStart());
      const response = await fetch("/api/v1/users/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        console.log(result.data);
        toast.error(result.data);
        setLoading(false);
        return setError(result.data);
      }
      if (response.ok) {
        toast.success("Login successful");
        console.log(result.data.user);
        dispatch(signInSuccess(result.data.user));
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error("Login failure");
    }
  }
  return (
    <div className="min-h-screen mt-20 ">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-2">
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white px-2 py-1 rounded-lg">
              {`Tausif's`}
            </span>
            Blog
          </Link>
          <p className="text-sm mt-5">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aspernatur
            provident nulla rerum explicabo iste, ab vel non.
          </p>
        </div>
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your Email" />
              <TextInput
                type="email"
                placeholder="blog@blog.com"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your Password" />
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>
            <Button
              outline
              gradientDuoTone="pinkToOrange"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Spinner>
                  <span>loading...</span>
                </Spinner>
              ) : (
                "Sign In"
              )}
            </Button>

            <OAuth />
          </form>
          <div className="flex gap-2 mt-5 text-sm">
            <span>{"Didn't"} have an Account ?</span>
            <Link to="/sign-up" className="text-blue-800">
              Sign Up
            </Link>
          </div>
          {error && (
            <Alert className="mt-5" color="failure">
              {error}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignIn;
