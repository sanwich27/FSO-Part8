import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

import Book from './models/book.js';
import Author from './models/author.js';
import User from './models/user.js'

import jwt from 'jsonwebtoken'
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'
const pubsub = new PubSub()

export const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => { 
      if (!args.author && !args.genre) {
        return Book.find({}).populate('author')
      }
      if (args.author && !args.genre) {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author._id }).populate('author')
      }
      if (!args.author && args.genre) {
        return Book.find({ genres: args.genre}).populate('author')
      }
      const author = await Author.findOne({ name: args.author })
      return Book.find({ genres: args.genre, author: author._id }).populate('author')
    },
    allAuthors: async () => {
      console.log('Author.find')
      const authors = await Author.find({})
      const books = await Book.find({})
      return authors.map(a => ({
        name: a.name,
        born: a.born,
        bookCount: books.filter(b => {
          return b.author.toString() === a._id.toString() 
        }).length
      }))
    },
    me: (root, args, context) => { return context.currentUser }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError("not authenticated")
      }

      if (args.title.length < 2) {
        throw new GraphQLError("title is too short")
      }

      if (args.author.length < 4) {
        throw new GraphQLError("author name is too short")
      }

      let author = await Author.findOne({ name: args.author})

      if (!author) {
        try {
          author = new Author({name: args.author})
          await author.save()
        } catch (error) {
          throw new GraphQLError(error.message, {
            extensions: { invalidArgs: args },
          })
        }
      } 

      const book = new Book({...args, author})

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { invalidArgs: args },
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError("not authenticated")
      }

      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { invalidArgs: args },
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })
      
      return user.save()
        .catch(error => {
          throw new GraphQLError(error.message, {
            extensions: { invalidArgs: args },
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials')
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET, { expiresIn: 60 * 60 }) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
}