import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CommentsSection from "../components/CommentsSection";
import PostCard from "../components/PostCard";
import { useSelector } from "react-redux";

function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser);

  const handleDeletePost = async () => {
    setPostIdToDelete(post._id);
    console.log(postIdToDelete);

    try {
      const res = await fetch(
        `/api/v1/post/delete-post/${postIdToDelete}/${currentUser?._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        const postView = data.data.posts[0];
        console.log(postView.userId);
        console.log(postView?._id);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(postView);
          setPostIdToDelete(postView._id);

          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);
  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/v1/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          console.log(data.data.posts);
          const recentPosts = data.data.posts;
          setRecentPosts(recentPosts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  console.log(post);
  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      {loading && <div>Loading...</div>}
      {error && <div>Error occurred while fetching post.</div>}
      {post && (
        <div>
          <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
            {post.title}
          </h1>
          <div className=" container mx-auto flex flex-row justify-between">
            <Link
              to={`/search?category=${post.category}`}
              className="self-center mt-5"
            >
              <Button color="gray" pill size="xs">
                {post.category}
              </Button>
            </Link>
            <div className="flex flex-row justify-between gap-8">
              {currentUser?._id === post.userId || currentUser?.isAdmin ? (
                <Link to="/" className="self-center mt-5">
                  <Button color="red" pill size="xs" onClick={handleDeletePost}>
                    delete
                  </Button>
                </Link>
              ) : null}
              {currentUser?._id === post.userId ? (
                <Link
                  to={`/update-post/${post._id}`}
                  className="self-center mt-5"
                >
                  <Button color="green" pill size="xs">
                    update
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          <img
            src={post.image}
            alt={post.title}
            className="mt-10 p-3 max-h-[600px] w-full object-cover"
          />
          <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="italic">
              {(post.content.length / 1000).toFixed(0)} mins read
            </span>
          </div>
          <div
            className="p-3 max-w-2xl mx-auto w-full post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          {post && <CommentsSection postId={post._id} />}
        </div>
      )}

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center md:flex-row">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
}

export default PostPage;
