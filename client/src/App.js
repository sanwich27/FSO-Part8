import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendation from './components/Recommendation'
import { ALL_BOOKS, BOOK_ADDED, ALL_BOOKS_GENRE } from './query'

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      notify(`${addedBook.title} added`)

      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })

      addedBook.genres.forEach(genre => {
        const existed = client.cache.readQuery({
          query: ALL_BOOKS_GENRE,
          variables: { genre }
        })
        console.log(existed);

        if(existed) {
          client.cache.updateQuery({ 
            query: ALL_BOOKS_GENRE,
            variables: { genre }
          }, ({ allBooks }) => {
            return {
              allBooks: allBooks.concat(addedBook),
            }
          })
        }
      })
    }
  })

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
       <Notify errorMessage={errorMessage} />
       
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {!token 
        ? <button onClick={() => setPage('login')}>login</button>
        : <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendation')}>recommendation</button>
            <button onClick={logout}>logout</button>
            <NewBook show={page === 'add'} setError={notify}  />
            <Recommendation show={page === 'recommendation'} />
          </>
        }
      </div>

      <Authors setError={notify} show={page === 'authors'} />

      <Books show={page === 'books'} />

      <LoginForm
        setPage={setPage}
        show={page ==='login'}
        setToken={setToken}
        setError={notify}
      />
    </div>
  )
}


const Notify = ({errorMessage}) => {
  if ( !errorMessage ) {
    return null
  }
  return (
    <div style={{color: 'red'}}>
    {errorMessage}
    </div>
  )
}

export default App
