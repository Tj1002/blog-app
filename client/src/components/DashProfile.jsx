import { Button, TextInput, Modal, Alert } from "flowbite-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from "../redux/user/userSlice";

export default function DashProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, error, loading } = useSelector((state) => state.user);

  const fileRef = useRef(null);
  const [imageFile, setImageFile] = useState(undefined);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setImageFile(file);

      setImageFileUrl(URL.createObjectURL(file));
      console.log(imageFileUrl);
    }
    console.log("image clicked");
  };
  useEffect(() => {
    if (imageFile) {
      console.log(imageFile);
      uploadImage();
    }
  }, [imageFile]);

  async function uploadImage() {
    try {
      const formData = new FormData();
      formData.append("imageFile", imageFile);

      const res = await fetch("api/v1/users/upload-profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      console.log(data.data.user);
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    console.log(formData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) return;

    try {
      console.log("update");
      dispatch(updateStart());
      const res = await fetch("/api/v1/users/update-account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data.data.user));
        setUpdateUserSuccess("User's profile updated successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  async function handleSignout() {
    try {
      const res = await fetch("/api/v1/users/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  async function handleDeleteUser() {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/v1/users/delete-user`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data.data));
        navigate("/");
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }
  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="font-semibold text-center my-7 text-3xl">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          hidden
          onChange={handleImageChange}
        />
        <div className="w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full">
          {console.log(imageFileUrl)}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="profile"
            id="profilePicture"
            className="rounded-full object-cover w-full h-full border-gray-600 border-8"
            onChange={handleChange}
            onClick={() => fileRef.current.click()}
          />
          {console.log(imageFileUrl)}
        </div>
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          disabled
          type="password"
          id="password"
          placeholder="password"
        />
        <Button outline gradientDuoTone="pinkToOrange" type="submit">
          Update
        </Button>
        {currentUser ? (
          <Link to="/create-post">
            <Button
              type="button"
              gradientDuoTone="purpleToPink"
              className="w-full"
            >
              Create a post
            </Button>
          </Link>
        ) : null}
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignout} className="cursor-pointer">
          Sign Out
        </span>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="mt-5">
          {error}
        </Alert>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, {`I'm sure`}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
