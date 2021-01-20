import React from 'react'
import axios from 'axios'


const addUserHandler = () => {

  const userData = {
    name: 'Demo User2',
    email: 'demo2@gmail.com',
    password: '1234567'
  }

  axios({
    url: '/graphql',
    method: 'POST',
    data: {
      query:`
        mutation {
          addUser(userInput:{
            name: "${userData.name}"
            email: "${userData.email}"
            password: "${userData.password}"
          }){
            _id
            name
            email
            password
            role
          }
        }
    `}
  })
    .then(res => {
      console.log(res.data)

    }).catch(err => {
      console.log(err.message)
  })

}


const App = () => {
  return (
    <>
      <button onClick={addUserHandler}>Add User</button>
    </>
  )
}

export default App