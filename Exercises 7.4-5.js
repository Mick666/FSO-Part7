//hooks/index.js

import { useState } from 'react'

export const useTextFieldValue = (input = '') => {
    const [value, setValue] = useState(input)

    const onChange = (event) => {
        setValue(event.target.value)
    }

    const reset = () => setValue('')

    return {
        value,
        reset,
        onChange
    }
}
//App.js

const CreateNew = ({ addNew, createNotification }) => {
    const content = useTextFieldValue()
    const author = useTextFieldValue()
    const info = useTextFieldValue()
    const history = useHistory()
    console.log(content.value)


    const handleSubmit = (e) => {
        e.preventDefault()
        addNew({
            value: content.value,
            author: author.value,
            info: info.value,
            votes: 0
        })
        history.push('/')
        createNotification(`A new anecdote '${content}' created`)
        setTimeout(() => createNotification(null), 10 * 1000)
    }

    return (
        <div>
            <h2>create a new anecdote</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    content
                    <input name='content' {...content} />
                </div>
                <div>
                    author
                    <input name='author' {...author} />
                </div>
                <div>
                    url for more info
                    <input name='info' {...info} />
                </div>
                <button>create</button>
                <button
                    type='button'
                    onClick={() => {
                        content.reset()
                        author.reset()
                        info.reset()
                    }}>reset</button>
            </form>
        </div>
    )

}