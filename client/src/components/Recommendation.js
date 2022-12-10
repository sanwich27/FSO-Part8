import { useQuery } from "@apollo/client"
import { ME, ALL_BOOKS_GENRE } from "../query"

const Recommendation = (props) => {
  const result = useQuery(ME)
  const resultByGenre = useQuery(ALL_BOOKS_GENRE, {
    variables: { genre: result.loading ? null : result.data.me.favouriteGenre },
    skip: result.loading
  })

  if (!props.show) {
    return null
  }

  if (resultByGenre.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>Recommended books</h2>
      <p>books of your favourite genre: <strong>{result.data.me.favouriteGenre}</strong> </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {resultByGenre.data.allBooks.map((a) => (
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

export default Recommendation
