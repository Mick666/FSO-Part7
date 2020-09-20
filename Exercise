const CreateNew = ({ addNew, createNotification }) => {
    const content = useField()
    const author = useField()
    const info = useField()
    const history = useHistory()

    const contentProps = { value: content.value, onChange: content.onChange }
    const authorProps = { value: author.value, onChange: author.onChange }
    const infoProps = { value: info.value, onChange: info.onChange }

    const handleSubmit = (e) => {
        e.preventDefault()
        addNew({
            content: content.value,
            author: author.value,
            info: info.value,
            votes: 0
        })
        history.push('/')
        createNotification(`A new anecdote '${content.value}' created`)
        setTimeout(() => createNotification(null), 10 * 1000)
    }

    return (
        <div>
            <h2>create a new anecdote</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    content
                    <input name='content' {...contentProps} />
                </div>
                <div>
                    author
                    <input name='author' {...authorProps} />
                </div>
                <div>
                    url for more info
                    <input name='info' {...infoProps} />
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