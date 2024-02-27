// import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// import { useEffect, useState } from "react";
// // import { CircularProgressbar } from "react-circular-progressbar";
// // import "react-circular-progressbar/dist/styles.css";
// import { useNavigate, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// export default function UpdatePost() {
//   const navigate = useNavigate();
//   const { postId } = useParams();
//   console.log(postId);
//   const [file, setFile] = useState(null);
//   const [fileUrl, setFileUrl] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [cloudinaryImageUrl, setCloudinaryImageUrl] = useState("");
//   const { currentUser } = useSelector((state) => state.user);
//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const res = await fetch(`/api/v1/post/getposts?postId=${postId}`);
//         const data = await res.json();
//         const posts = data.data.posts;
//         if (res.ok) {
//           setFormData(posts[0]);
//         }
//         if (!res.ok) {
//           return;
//         }
//       } catch (error) {
//         console.log(error.message);
//       }
//     };
//     if (currentUser.isAdmin) {
//       fetchPosts();
//     }
//   }, [currentUser._id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch(
//         `/api/v1/post/update-post/${formData._id}/${currentUser._id}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(formData),
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) {
//         console.log(res.status);
//         return;
//       }

//       if (res.ok) {
//         console.log(data.data);
//         // navigate(`/post/${data.slug}`);
//         navigate("/dashboard?tab===posts");
//       }
//     } catch (error) {
//       console.log("Something went wrong");
//     }
//   };

//   async function handleUpdloadImage(e) {
//     e.preventDefault();
//     if (file) {
//       setFileUrl(URL.createObjectURL(file));

//       try {
//         const formData = new FormData();
//         formData.append("image", file);

//         const res = await fetch("api/v1/upload/image-upload", {
//           method: "PUT",
//           body: formData,
//         });

//         const data = await res.json();
//         console.log(data);
//         console.log(data.data);
//         console.log(data.data.secure_url);
//         setCloudinaryImageUrl(data.data.secure_url);
//         setFormData({ ...formData, image: cloudinaryImageUrl });
//         console.log(formData);
//       } catch (error) {
//         console.log(error.message);
//       }
//     }
//   }

//   return (
//     <div className="p-3 max-w-3xl mx-auto min-h-screen">
//       <h1 className="text-center text-3xl my-7 font-semibold">Update a post</h1>
//       <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
//         <div className="flex flex-col gap-4 sm:flex-row justify-between">
//           <TextInput
//             // encType="multipart/form-data"
//             type="text"
//             placeholder="Title"
//             required
//             id="title"
//             className="flex-1"
//             value={formData.title}
//             onChange={(e) =>
//               setFormData({ ...formData, title: e.target.value })
//             }
//           />
//           {/* {console.log(formData.title)} */}

//           <Select
//             value={formData.category}
//             onChange={(e) =>
//               setFormData({ ...formData, category: e.target.value })
//             }
//           >
//             {console.log(formData.category)}

//             <option value="uncategorized">Select a category</option>
//             <option value="javascript">JavaScript</option>
//             <option value="reactjs">React.js</option>
//             <option value="nextjs">Next.js</option>
//           </Select>
//         </div>
//         <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
//           <FileInput
//             type="file"
//             accept="image/*"
//             // value={formData.image}
//             onChange={(e) => setFile(e.target.files[0])}
//           />

//           <Button
//             type="button"
//             gradientDuoTone="purpleToBlue"
//             size="sm"
//             outline
//             onClick={handleUpdloadImage}
//             // disabled={imageUploadProgress}
//           >
//             Upload Image
//           </Button>
//         </div>
//         {/* {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
//         {formData.image && (
//           <img
//             src={formData.image}
//             alt="upload"
//             className="w-full h-72 object-cover"
//           />
//         )} */}
//         <img src={formData.image} alt="image" />
//         <ReactQuill
//           value={formData.content}
//           theme="snow"
//           placeholder="Write something..."
//           className="h-72 mb-12"
//           required
//           onChange={(value) => {
//             setFormData({ ...formData, content: value });
//           }}
//         />
//         {console.log(formData.content)}

//         <Button type="submit" gradientDuoTone="purpleToPink">
//           Update
//         </Button>
//         {/* {publishError && (
//           <Alert className="mt-5" color="failure">
//             {publishError}
//           </Alert>
//         )} */}
//       </form>
//     </div>
//   );
// }
import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate, useParams } from "react-router-dom";

export default function CreatePost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { postId } = useParams();
  console.log(postId);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [title, setTitle] = useState(null);
  const [category, setCategory] = useState(null);
  const [fetchData, setFetchData] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const [content, setContent] = useState({ content: "" });
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/v1/post/getposts?postId=${postId}`);
        const data = await res.json();
        const posts = data.data.posts;
        if (res.ok) {
          setFetchData(posts[0]);
        }
        if (!res.ok) {
          return;
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser._id]);
  console.log(fetchData);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setTitle(value);
    } else if (name === "category") {
      setCategory(value);
    }
  };
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
      formData.append("title", title || fetchData?.title);
      formData.append("category", category || fetchData?.category);

      formData.append("content", content.content || fetchData?.content);
      formData.append("image", uploadFile || fetchData?.image);
      Array.from(formData.entries()).forEach((entry) => {
        console.log(entry);
      });

      const res = await fetch(
        `/api/v1/post/update-post/${postId}/${currentUser?._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

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
            defaultValue={fetchData?.title}
            className="flex-1"
            onChange={handleInputChange}
          />

          <Select id="category" name="category" onChange={handleInputChange}>
            <option value={fetchData && fetchData?.category}>
              Select a category
            </option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            defaultValue={fetchData?.image}
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <img src={fetchData?.image} alt="image" />

        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          defaultValue={fetchData?.content}
          name="content"
          onChange={(value) => {
            setContent((prevState) => ({ ...prevState, content: value }));
          }}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Update
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
