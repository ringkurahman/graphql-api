const express = require('express')
const app = express()

const User = require('./models/User')

const { graphqlHTTP } = require('express-graphql')
const bodyParser = require('body-parser')
const { buildSchema } = require('graphql')
const expressPlayground = require('graphql-playground-middleware-express').default

const mongoose = require('mongoose')
const cors = require('cors')
const errorHandler = require('./middleware/error')
const colors = require('colors')
const connectDB = require('./config/db')


// Connect Database
connectDB()

app.use(bodyParser.json())
app.use(cors())
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))


app.use(
    '/graphql',
    graphqlHTTP({
        schema:buildSchema(`
            type RootQuery {
                user(id:ID!): User!
            }

            type RootMutation{
                addUser(userInput:UserInput!): User!
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

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            // Get new user by id
            user: async args => {
                try {
                    const user = await User.findOne({ _id: args.id })
                    return { ...user._doc }

                } catch (err) {
                    throw err
                }
            },
            // Create new user
            addUser: async args => {
                try {
                    const user = new User({
                        name: args.userInput.name,
                        email: args.userInput.email,
                        password: args.userInput.password,
                        role: args.userInput.role
                    })

                    const result = await user.save()

                    return { ...result._doc }

                } catch (err) {
                    throw err
                }
            }
        },
        graphiql: true
    })
)

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

