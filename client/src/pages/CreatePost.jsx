import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();

  const [uploadFile, setUploadFile] = useState(null);
  // const [fileUrl, setFileUrl] = useState(null);
  const [title, setTitle] = useState(null);
  const [category, setCategory] = useState(null);

  const [content, setContent] = useState({ content: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setTitle(value);
    } else if (name === "category") {
      setCategory(value);
    }
  };

  console.log(title, content, category);

  const handleFileChange = (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    console.log(file);
    if (file) {
      // const fileUrl = URL.createObjectURL(file);
      // console.log(fileUrl);
      // setFileUrl(fileUrl);
      setUploadFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);

      formData.append("content", content.content);
      formData.append("image", uploadFile);
      Array.from(formData.entries()).forEach((entry) => {
        console.log(entry);
      });
      const res = await fetch("/api/v1/post/create-post", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to create post: ${res.status}`);
      }

      const data = await res.json();
      console.log(data.data);
      navigate("/post/${post.slug}");
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            name="title"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={handleInputChange}
          />

          <Select id="category" name="category" onChange={handleInputChange}>
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        {/* {fileUrl && <img src={fileUrl} alt="image" />} */}

        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          name="content"
          onChange={(value) => {
            setContent((prevState) => ({ ...prevState, content: value }));
          }}
        />

        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>

        {/* {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )} */}
      </form>
    </div>
  );
}
