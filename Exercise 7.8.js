const useResource = (baseUrl) => {
    const [resources, setResources] = useState([])
  
    useEffect(() => {
      axios
      .get(baseUrl)
      .then(response => { 
        setResources(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    }, [baseUrl])
  
    const create = (resource) => {
      axios
        .post(baseUrl, resource)
        .then(response => {
          setResources(resources.concat(response.data))
        })
        .catch(error => {
          console.log(error)
        })
    }
  
    const service = {
      create
    }
  
    return [
      resources, service
    ]
  }