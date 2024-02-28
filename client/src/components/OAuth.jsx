import { Button, Spinner } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { response } from "express";
function OAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);
  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      setLoading(true);
      dispatch(signInStart());
      const resultFromGoogle = await signInWithPopup(auth, provider);
      const res = await fetch("/api/v1/users/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: resultFromGoogle.user.displayName,
          email: resultFromGoogle.user.email,
          googlePhotoUrl: resultFromGoogle.user.photoURL,
        }),
      });
      const data = await res.json();
      if (!response.ok) {
        dispatch(signInFailure(response));
        toast.error("Error in authentication");
        setLoading(false);
        return setError(response);
      }
      if (data.success === true) {
        console.log(data.data);
        dispatch(signInSuccess(data.data));
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError("something went wrong");
      dispatch(signInFailure(error.message));
      toast.error("something went wrong");
    }
  };
  return (
    <Button
      outline
      gradientDuoTone="pinkToOrange"
      type="submit"
      disabled={loading}
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      {loading ? (
        <Spinner>
          <span>loading...</span>
        </Spinner>
      ) : (
        "Continue with Google"
      )}
    </Button>
  );
}

export default OAuth;
