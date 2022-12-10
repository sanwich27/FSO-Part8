import { useQuery } from "@apollo/client"
import { useState } from "react";
import Select from 'react-select';

import { ALL_BOOKS, ALL_BOOKS_GENRE } from "../query"

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)

  const [selectedOption, setSelectedOption] = useState(null);

  const resultByGenre = useQuery(ALL_BOOKS_GENRE, {
    variables: { genre: selectedOption ? selectedOption.value : null },
    skip: !selectedOption
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  if (resultByGenre.loading && selectedOption) {
    return <div>loading...</div>
  }


  let temp = result.data.allBooks.map(a => a.genres).flat()
  let allGenres = []
  
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].includes(',')) { 
      let genresArray = temp[i].split(', ')

      for (let j = 0; j < genresArray.length; j++) {
        if (!allGenres.includes(genresArray[j])) {
          allGenres = allGenres.concat(genresArray[j])
        }
      }
      continue
    }
     if (!allGenres.includes(temp[i])) {
      allGenres = allGenres.concat(temp[i])
     }
  }

  const options = [{value: null, label: 'all(no filter)'}].concat(allGenres.map(g => ({ value: g, label: g })))

  return (
    <div>
      <h2>books</h2>
      <div>filter by genre</div>
      <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
          placeholder='Select genre...'
      />
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          { !selectedOption 
              ? result.data.allBooks.map((a) => (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
            ))
              : resultByGenre.data.allBooks.map((a) => (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default Books
