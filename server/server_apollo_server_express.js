const express = require('express')

const User = require('./models/User')

const { ApolloServer, gql } = require('apollo-server-express')

const cors = require('cors')
const errorHandler = require('./middleware/error')
const colors = require('colors')
const connectDB = require('./config/db')

// Connect Database
connectDB()


const typeDefs = gql`
            type Query {
                user(id:ID!): User!
            }
            type Mutation{
                addUser( userInput:UserInput!):User!
            }
            type User {
                _id: ID!
                name: String!
                email: String!
                password: String!
                role: String
            }
            input UserInput {
                name: String!
                email: String!
                password: String!
                role: String
            }    
`;

const resolvers = {
    Query:{
        user:async (parent, args, context, info) =>{
            try{
                const user = await User.findOne({ _id:args.id })
                return { ...user._doc }
            } catch(err){
                throw err
            }
        }
    },
    Mutation:{
        addUser:async (parent, args, context, info) => {
            try {
                const user = new User({
                    name: args.userInput.name,
                    email: args.userInput.email,
                    password: args.userInput.password
                })
                const result = await user.save()

                return {
                    ...result._doc
                }
            } catch(err){
                throw err
            }
        }
    }
}


const server = new ApolloServer({ typeDefs, resolvers })
const app = express()
server.applyMiddleware({ app })

app.use(cors())

// Error Handler
app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen( PORT, console.log(`Running running on port ${PORT}`.yellow.bold))



// Handle unhandled rejection from database
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    // Close server and exit process
    server.close(() => process.exit(1))
})