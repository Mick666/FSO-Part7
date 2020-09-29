//App.js

import React, { useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import { initializeBlogs, createBlog, addLike, removeBlog } from './reducers/blogReducer'
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
    }, [dispatch])

    return (
        <div>
            <Notification message={notification}/>
            {user === null ?
                <div>
                    <h2>Please log in</h2>
                    {loginForm()}
                </div>:
                <div>
                    <h2>Blogs</h2>
                    {`${user.username} logged in`} <button onClick={handleLogOut}>Log you out</button>
                    <br></br>
                    <h2>Create new blog</h2>
                    {blogForm()}
                    <br></br>
                    {blogs.map(blog =>
                        <Blog
                            key={blog.id}
                            blog={blog}
                            user={user}
                            removePost={removePost}
                            increaseLikes={increaseLikes}/>
                    )}
                </div>
            }
        </div>
    )
}

export default App

// Index.js

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import store from './components/store'
import './index.css'

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)

// Store.js

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import notificationReducer from '../reducers/notificationReducer'
import blogReducer from '../reducers/blogReducer'
import userReducer from '../reducers/userReducer'

const reducer = combineReducers({
    notification: notificationReducer,
    blogs: blogReducer,
    user: userReducer
})

const store = createStore(
    reducer,
    composeWithDevTools(
        applyMiddleware(thunk)
    )
)

export default store

// notificationReducer.js

let timeoutID

const notificationReducer = (state = null, action) => {
    switch (action.type) {
    case 'SET_NOTIFICATION':
        return action.data
    case 'REMOVE_NOTIFICATION':
        return null
    default:
        return state
    }
}

export const setNotification = (content, style, time) => {
    return dispatch => {
        dispatch({
            type: 'SET_NOTIFICATION',
            data: {
                content: content,
                style: style
            }
        })
        if (timeoutID) clearTimeout(timeoutID)
        timeoutID = setTimeout(() => {
            dispatch({
                type: 'REMOVE_NOTIFICATION',
                data: null
            })
        }, time * 1000)

    }
}

export const removeNotification = () => {
    return {
        type: 'REMOVE_NOTIFICATION',
        data: null
    }
}

export default notificationReducer

// blogReducer.js

import blogService from '../services/blogs'
import { setNotification } from './notificationReducer'

const blogReducer = (state = [], action) => {
    switch (action.type) {
    case 'ADD_LIKE':
        return state.map((blog, i) => i === state.indexOf(action.data) ? action.data : blog)
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

export const createBlog = (content) => {
    return async dispatch => {
        const newBlog = await blogService.create(content)
        const notificationMessage = `New blog ${content.title} by ${content.author} added`
        dispatch(setNotification(notificationMessage, 'green', 5))
        dispatch({
            type: 'NEW_BLOG',
            data: {
                ...newBlog
            }
        })
    }
}

export const initializeBlogs = () => {
    return async dispatch => {
        const blogs = await blogService.getAll()
        dispatch({
            type: 'INIT_BLOGS',
            data: blogs
        })
    }
}

export const addLike = (content) => {
    console.log(content)
    return async dispatch => {
        const updatedBlog = await blogService.increaseLikes(content)
        console.log(updatedBlog)
        dispatch({
            type: 'ADD_LIKE',
            data: updatedBlog
        })
    }
}

export const removeBlog = (blogId) => {
    return async dispatch => {
        try {
            const deletedBlog = await blogService.deletePost(blogId)
        } catch (error) {
            console.log(error)
            return
        }
        dispatch({
            type: 'REMOVE_BLOG',
            data: blogId
        })
    }
}

export default blogReducer

// userReducer.js

import userService from '../services/login'
import blogService from '../services/blogs'
import { setNotification } from './notificationReducer'

const userReducer = (state = [], action) => {
    switch (action.type) {
    case 'LOGIN':
        return action.data
    case 'LOGOUT':
        return null
    default:
        return state
    }
}

export const loginUser = (username, password) => {
    return async dispatch => {
        try {
            const loggedInUser = await userService.login({
                username, password,
            })
            window.localStorage.setItem(
                'loggedBlogappUser', JSON.stringify(loggedInUser)
            )
            blogService.setToken(loggedInUser.token)
            dispatch({
                type: 'LOGIN',
                data: loggedInUser
            })
        } catch (error) {
            const notificationMessage = 'Wrong credentials'
            dispatch(setNotification(notificationMessage, 'red', 5))
        }
    }
}

export const setLogin = (user) => {
    return dispatch => {
        if (user === null) {
            logout()
            return
        } else {
            blogService.setToken(user.token)
            dispatch({
                type: 'LOGIN',
                data: user
            })
        }
    }
}

export const logout = () => {
    return async dispatch => {
        window.localStorage.setItem(
            'loggedBlogappUser', null
        )

        dispatch({
            type: 'LOGOUT',
            data: null
        })
    }
}

export default userReducer