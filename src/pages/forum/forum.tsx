import React, { useState } from "react";
import "./forum.css";

interface Post {
    title: string;
    content: string;  
}

const Forum: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [formData, setFormData] = useState({ title: "", content: "" });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const submitPost = (day: number) => {
        setFormData({ title: "", content: "" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title && formData.content) {
        setPosts([...posts, { title: formData.title, content: formData.content }]);
        setFormData({ title: "", content: "" });
        }
    };
    
    const populatePosts = () => {

        if (posts.length === 0) {
            const initialPosts: Post[] = [
                { title: "Welcome to the Forum", content: "Feel free to share your thoughts!" },
                { title: "Forum Guidelines", content: "Please be respectful and constructive." },
            ];
            setPosts(initialPosts);
        }

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
            document.getElementById("posts")?.appendChild(postElement);
        };
    }
    
    return (
        <div className="forum-container">
            <h1>Forum</h1>
            <form onSubmit={handleSubmit} className="post-form">
                <input
                    type="text"
                    name="title"
                    placeholder="Post Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                />
                <textarea
                    name="content"
                    placeholder="Post Content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                ></textarea>
                <button type="submit">Submit Post</button>
            </form>
            <div id="posts" className="posts-list">
                {posts.map((post, index) => (
                    <div key={index} className="post">
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Forum;