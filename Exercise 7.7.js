const useCountry = (name) => {
    const [country, setCountry] = useState(null)
  
    useEffect(() => {
      if (name === '') return
      axios
      .get(`https://restcountries.eu/rest/v2/name/${name}?fullText=true`)
      .then(response => {
        if (response.data.length !== 1) {
          let responseData = {
            found: false,
            data: null
          }
          setCountry(responseData)
        } else {
          let responseData = {
            found: true,
            data: response.data[0]
          }
          setCountry(responseData)
        }
      })
      .catch(error => {
        console.log(error)
      })
    },
    [name])
  
    return country
  }