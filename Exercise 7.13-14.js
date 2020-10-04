import React, { useEffect } from 'react'
import {
    BrowserRouter as Router,
    Switch, Route, Link
} from 'react-router-dom'
import Blog from './components/Blog'
import Notification from './components/Notification'
import { User, Users } from './components/Users'
import { initializeBlogs, createBlog, addLike, removeBlog } from './reducers/blogReducer'
import { initializeUsers } from './reducers/blogUsersReducer'
import { loginUser, logout, setLogin } from './reducers/userReducer'
import Togglable from './components/Togglable'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import { useDispatch, useSelector } from 'react-redux'

const App = () => {
    const dispatch = useDispatch()
    const notification = useSelector(state => state.notification)
    const blogs = useSelector(state => state.blogs)
    const user = useSelector(state => state.user)
    const users = useSelector(state => state.users)


    const blogFormRef = React.createRef()

    useEffect(() => {
        let loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
        if (loggedUserJSON) {
            const userParsed = JSON.parse(loggedUserJSON)
            if (user === null) return
            dispatch(setLogin(userParsed))
        }
    }, [dispatch])

    const handleLogin = async (username, password) => {
        dispatch(loginUser(username, password))
    }

    const handleLogOut = () => {
        dispatch(logout())
    }

    const addBlog = (blogObject) => {
        blogFormRef.current.toggleVisibility()
        dispatch(createBlog(blogObject))
    }

    const removePost = (event) => {
        dispatch(removeBlog(event.target.dataset.id))
    }


    const loginForm = () => {
        return (
            <Togglable buttonLabel='login'>
                <LoginForm
                    handleSubmit={handleLogin}
                />
            </Togglable>
        )
    }

    const blogForm = () => (
        <Togglable buttonLabel='New blog' ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
        </Togglable>
    )


    const increaseLikes = (blog) => {
        console.log(blog)
        let updatedBlog = blog
        updatedBlog.likes = +updatedBlog.likes + 1
        dispatch(addLike(updatedBlog))
    }

    useEffect(() => {
        dispatch(initializeBlogs())
        dispatch(initializeUsers())
    }, [dispatch])

    return (
        <Router>
            <div>
                {user === null ?
                    <div>
                        <h2>Please log in</h2>
                        {loginForm()}
                    </div> :
                    <div>
                        <div>
                            <Link to='/'>Home</Link>
                            <Link to='/users'>Users</Link>
                        </div>

                        <div>
                            <h2>Blogs</h2>
                            {`${user.username} logged in`} <button onClick={handleLogOut}>Log you out</button>
                            <br></br>
                        </div>
                        <Notification message={notification} />

                        <Switch>
                            <Route path="/users/:id">
                                <User users={users} />
                            </Route>
                            <Route path="/users">
                                <Users />
                            </Route>
                            <Route path="/">
                                <div>
                                    <div>
                                        <h2>Create new blog</h2>
                                        {blogForm()}
                                        <br></br>
                                        {blogs.map(blog =>
                                            <Blog
                                                key={blog.id}
                                                blog={blog}
                                                user={user}
                                                removePost={removePost}
                                                increaseLikes={increaseLikes} />
                                        )}
                                    </div>
                                </div>
                            </Route>
                        </Switch>
                    </div>
                }
            </div>

        </Router>
    )
}

export default App

//Components/Users.js

import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

const User = ({ users }) => {
    const userId = useParams().id
    const user = users.find(n => n.id.toString() === userId.toString())

    if (!user) {
        return null
    }


    return (
        <div>
            <h2>{user.username}</h2>
            <br />
            <h4>Added Blogs</h4>
            <ul>
                {user.blogs.map((blog, index) =>
                    <li key={index}>{blog.title}</li>
                )}
            </ul>
        </div>
    )
}



const Users = () => {
    const users = useSelector(state => state.users)
    console.log(users)
    return (
        <div className='userGridParent'>
            <span className='userGridItem'>
                <b>Users</b>
                <b>Blogs created:</b>
            </span>
            {users.map((user, index) =>
                <div className='userGridItem' key={index}>
                    <Link to={`/users/${user.id}`}>
                        <p>{user.username}</p>
                    </Link>
                    <p>{user.blogs.length}</p>
                </div>
            )}
        </div>
    )
}


export { Users, User }

// Reducers/blogUsersReducer.js
import userService from '../services/user'

const userReducer = (state = [], action) => {
    switch (action.type) {
    case 'INIT_USERS':
        return action.data
    default:
        return state
    }
}

export const initializeUsers = () => {
    return async dispatch => {
        const users = await userService.getAll()
        dispatch({
            type: 'INIT_USERS',
            data: users
        })
    }
}

export default userReducer