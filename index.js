// const express = require('express')

// const compression = require('compression')
// const cors = require('cors')
// const app = express()

// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(compression())
// // middlewares
// app.use(cors({
//   origin: '*'
// }))

// app.get('/', (req, res) => {
//   res.send('Map running')
// })

// const http = require('http')
// const socketio = require('socket.io')
// const path = require('path')
// // setup ejs server
// const server = http.createServer(app, {
//   cors: {
//     origin: 'http://localhost:3001',
//     methods: ['GET', 'POST'],
//     credentials: true

//   }
// })
// const io = socketio(server)

// // ejs
// // app.set('view engine', 'ejs')
// // app.use(express.static(path.join(__dirname, 'public')))

// io.on('connection', (socket) => {
//   socket.on('send-Location', (data) => {
//     console.log(data)
//     io.emit('recived_Location', {_id: socket.id, data}) // we send location to all clients
//   })
//   console.log('Connected')
// })

// // 404 no page /  Routes found
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API Route Not Found'
//   })
// })

// // global error messages
// app.use((err, req, res) => {
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   })
// })

// server.listen(3000, () => console.log('https://rakshapath-inky.vercel.app'))

const express = require('express')
const cors = require('cors')
const http = require('http')
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: 'https://rakshapath-inky.vercel.app'
}))

app.get('/', (req, res) => {
  res.send('Map server running')
})
const sockek_io_steup = socketio(server, {
  cors: {
    origin: 'https://rakshapath-inky.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

sockek_io_steup.on('connection', (socket) => {
  // console.log(`Connected: ${socket.id}`)

  socket.on('send-Location', (data) => {
    // console.log('Location received:', data)
    sockek_io_steup.emit('recived_Location', { _id: socket.id, data})
  })

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`)
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found'
  })
})

server.listen(4000, () => console.log('Server listening on http://localhost:4000'))
