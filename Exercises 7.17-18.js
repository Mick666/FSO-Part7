import React, { useState } from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addComment, addLike, removeBlog } from '../reducers/blogReducer'

const BlogHeader = ({ title, author, id }) => {
    return (
        <div  className='blogStyle'>
            <Link to={`/blogs/${id}`}>
                {title} by {author}
            </Link>
        </div>
    )
}

const Blog = ({ blogs, user }) => {
    const dispatch = useDispatch()
    const history = useHistory()
    const blogId = useParams().id
    const blog = blogs.find(n => n.id.toString() === blogId.toString())
    const [comment, setComment] = useState('')

    if (!blog) return null

    [...]

    const addBlogComment = (event, blog, comment) => {
        event.preventDefault()
        const updatedBlog = {
            ...blog,
            comments: blog.comments.concat(comment),
            user: blog.user && blog.user.id ? blog.user.id : blog.user
        }
        dispatch(addComment(updatedBlog, comment))
        setComment('')
    }

    return (
        <div>
            <div>
                <h2>{blog.title}</h2>
                    Url: {blog.url}
                <br />
                    Likes: {blog.likes}  <button onClick={() => increaseLikes(blog)}>Like</button>
                <br />
                    Author: {blog.author}
                <br />
                {user && (user.username === blog.user.username) ?
                    <button onClick={removePost} data-id={blog.id}>Remove</button> : <div></div>}
                <h3>Comments</h3>
                <ul>
                    {blog.comments.map((comment, index) =>
                        <li key={index}>{comment}</li>
                    )}
                </ul>
                <form onSubmit={(event) => addBlogComment(event, blog, comment)}>
                    Add a comment:
                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button type="submit">Post</button>
                </form>
            </div>
        </div>
    )
}

export { Blog, BlogHeader }

// blogReducer.js

import blogService from '../services/blogs'
import { setNotification } from './notificationReducer'
import { initializeUsers } from './blogUsersReducer'

const blogReducer = (state = [], action) => {
    switch (action.type) {
    case 'UPDATE_BLOG':
        const id = action.data.id
        return state.map(blog => blog.id !== id ? blog : action.data)
    case 'NEW_BLOG':
        return [ ...state, action.data]
    case 'INIT_BLOGS':
        return action.data
    case 'REMOVE_BLOG':
        return state.filter(blog => blog.id !== action.data)
    default:
        return state
    }
}

[...]

export const addLike = (content) => {
    return async dispatch => {
        const updatedBlog = await blogService.increaseLikes(content)
        dispatch({
            type: 'UPDATE_BLOG',
            data: updatedBlog
        })
    }
}


export const addComment = (blog) => {
    return async dispatch => {
        const updatedBlog = await blogService.addComment(blog)
        dispatch({
            type: 'UPDATE_BLOG',
            data: updatedBlog
        })
    }
}
[...]

export default blogReducer

//services.blog.js

import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
    token = `bearer ${newToken}`
}
[...]

const addComment = async (updatedBlog) => {
    const config = {
        headers: { Authorization: token },
    }

    const response = await axios.put(`${baseUrl}/${updatedBlog.id}`, updatedBlog, config)
    console.log(response)
    return response.data
}

[...]

export default { getAll, setToken, create, increaseLikes, deletePost, addComment }