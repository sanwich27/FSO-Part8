import { useState } from 'react'
import Select from 'react-select';
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../query'

const AuthorForm = ({ authors, setError }) => {
  const [birth, setBirth] = useState('')
  const [selectedOption, setSelectedOption] = useState(null);

  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ],
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    },
  })

  const submit = async (event) => {
    event.preventDefault()
    
    const name = selectedOption.value
    const setBornTo = Number(birth)
    updateAuthor({ variables: { name, setBornTo }})

    setBirth('')
  }

  const options = authors.map(a => ({ value: a.name, label: a.name }))

  return (
    <div>
      <h3>Set birth year</h3>
      <form onSubmit={submit}>
        <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
          placeholder='Select author...'
        />
        <div>
          born
          <input
            type="number"
            value={birth}
            onChange={({ target }) => setBirth(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default AuthorForm
