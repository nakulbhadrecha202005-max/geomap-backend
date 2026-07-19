// const express = require('express')
// const cors = require('cors')
// const http = require('http')
// const socketio = require('socket.io')
// const app = express()
// const server = http.createServer(app)

// app.use(express.json())

// app.use(cors({
//   origin: '*'
// }))

// app.get('/', (req, res) => {
//   res.send('Map server running')
// })

// require('./configDB/db')
// const signupUserRoute = require('./UserAuthentication/signupRoutes')

// app.use('/signupRoutes', signupUserRoute)

// // location base socket
// const sockek_io_steup = socketio(server, {
//   cors: {
//     // origin: 'https://rakshapath-inky.vercel.app',
//     origin: '*',
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// })

// sockek_io_steup.on('connection', (socket) => {
//   // console.log(`Connected: ${socket.id}`)
//   socket.on('send-Location', (data) => {
//     // console.log('Location received:', data)
//     sockek_io_steup.emit('recived_Location', { _id: socket.id, data})
//   })

//   socket.on('disconnect', () => {
//     console.log(`Disconnected: ${socket.id}`)
//   })
// })

// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API Route Not Found'
//   })
// })

// server.listen(4000, () => console.log('Server listening on http://localhost:4000'))

// ejs
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketio = require('socket.io')
const path = require('path') // 1. Added path module to handle views folder correctly
const signup = require('./UserAuthentication/signupRoutes')

const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const protect = require('./configDB/Auth_User_middleware')

const RouterMap = require('./User_add_Members/Router_Final_map')

const app = express()
const server = http.createServer(app)

// 2. Set up EJS view engine
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views')) // Tells Express to look for templates in a folder named 'views'
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(express.json())

app.use(cors({
  origin: '*'
}))

require('./configDB/db')

app.use('/signupRoutes', signup)
app.use('/Map', RouterMap)

// for  ejs routes
app.get('/create-room', (req, res) => {
  res.render('createRoom')
})

// 3. Changed res.send to res.render
app.get('/Home', protect, (req, res) => {
  res.render('index', { user: req.user }) // This will look for 'views/index.ejs'
})

// Mock Login Route (For testing - you can replace this with your database login checks later)
app.get('/', (req, res) => {
  console.log('req', req.body)
  res.send(`
       <!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RakshaPath - Secure Login</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="h-full flex items-center justify-center p-4 antialiased">
    
    <!-- Decorative background elements for application depth -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.05),transparent_45%)] pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.03),transparent_40%)] pointer-events-none"></div>

    <!-- Login Container Card -->
    <div class="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        
        <!-- Logo & Header Group -->
        <div class="text-center mb-8">
            <div class="inline-flex bg-red-500/10 p-3.5 rounded-2xl text-red-500 border border-red-500/20 mb-4 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Welcome to RakshaPath</h2>
            <p class="text-sm text-slate-400 mt-2">Log in as a test family member to access routing</p>
        </div>

        <!-- Authentication Form -->
        <form action="/signupRoutes/login" method="POST" class="space-y-5">
            
            <!-- Email Field -->
            <div>
                <label for="email" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                </label>
                <div class="relative">
                    <input 
                        type="email" 
                        id="email"
                        name="email" 
                        required 
                        placeholder="name@family.com" 
                        class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm"
                    />
                </div>
            </div>

            <!-- Password Field -->
            <div>
                <label for="password" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Secure Password
                </label>
                <div class="relative">
                    <input 
                        type="password" 
                        id="password"
                        name="password" 
                        required 
                        placeholder="••••••••" 
                        class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm"
                    />
                </div>
            </div>

            <!-- Action Button -->
            <button 
                type="submit" 
                class="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-sky-900/20 hover:shadow-sky-500/10 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 mt-2"
            >
                Generate Token & Log In
            </button>
        </form>

        <!-- Footer Note -->
        <p class="text-center text-xs text-slate-600 mt-6">
            Protected endpoint area. Authorized testing access only.
        </p>
    </div>

</body>
</html>
    `)
})

// Logout Route
app.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/login')
})

// location base socket
const sockek_io_steup = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

sockek_io_steup.on('connection', (socket) => {
  socket.on('send-Location', (data) => {
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
