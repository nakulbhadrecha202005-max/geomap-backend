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
// index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');

// ---------------------------------------------------------------------------
// CRITICAL: Register the User schema FIRST, before anything that calls
// .populate('members'/'admin'/'target'/'guardian', ...). Mongoose resolves
// ref: 'User' lazily at populate-time, so if models.js (which references
// 'User' but never defines it) loads before the User model itself has been
// compiled, every populate() call throws:
//   MissingSchemaError: Schema hasn't been registered for model "User"
// Requiring it here, before ./models, guarantees it's already in Mongoose's
// model registry by the time Room/RouteHistory documents are populated.
// ---------------------------------------------------------------------------
require('./UserAuthentication/model'); // registers 'User'
const { Room, RouteHistory } = require('./models'); // registers 'Room', 'RouteHistory'

const signup = require('./UserAuthentication/signupRoutes');
const protect = require('./configDB/Auth_User_middleware');

const app = express();
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: '*' }));

require('./configDB/db');

app.use('/signupRoutes', signup);

// ---------------------------------------------------------------------------
// Room creation / joining
// ---------------------------------------------------------------------------

app.post('/create-room', protect, async (req, res) => {
  try {
    const { roomName } = req.body;
    if (!roomName || !roomName.trim()) {
      return res.status(400).send('Room name is required');
    }

    const newRoom = await Room.create({
      roomName: roomName.trim(),
      admin: req.user._id,
      members: [req.user._id]
    });

    res.redirect(`/Home?roomId=${newRoom._id}`);
  } catch (err) {
    console.error('create-room error:', err);
    res.status(500).send('Error creating room');
  }
});

app.post('/join-room', protect, async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send('Room not found');

    const alreadyMember = room.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!alreadyMember) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.redirect(`/Home?roomId=${room._id}`);
  } catch (err) {
    console.error('join-room error:', err);
    res.status(500).send('Error joining room');
  }
});

// ---------------------------------------------------------------------------
// Home / map view
// ---------------------------------------------------------------------------

app.get('/Home', protect, async (req, res) => {
  try {
    const roomId = req.query.roomId || null;
    let roomDetails = null;
    let isGuardian = false;

    if (roomId) {
      roomDetails = await Room.findById(roomId).populate('members', 'name email');

      if (!roomDetails) {
        return res.status(404).send('Room not found');
      }

      const isMember = roomDetails.members.some(
        (m) => m._id.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).send('You are not a member of this room');
      }

      isGuardian = roomDetails.admin.toString() === req.user._id.toString();
    }

    res.render('index', {
      user: req.user,
      room: roomDetails,
      isGuardian
    });
  } catch (err) {
    console.error('Home route error:', err);
    res.status(500).send('Error loading map');
  }
});

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h2>Welcome to RakshaPath</h2>
        <form action="/signupRoutes/login" method="POST" style="display: inline-block; text-align: left; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
            <label>Email:</label><br/>
            <input type="email" name="email" required placeholder="email" style="padding: 8px; margin-bottom: 15px; width: 200px;"/><br/>
            <label>Password:</label><br/>
            <input type="password" name="password" required placeholder="Password" style="padding: 8px; margin-bottom: 15px; width: 200px;"/><br/>
            <button type="submit" style="padding: 8px 15px; background: #1e90ff; color: white; border: none; border-radius: 4px; cursor: pointer;">Log In</button>
        </form>
    </div>
  `);
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// ---------------------------------------------------------------------------
// Socket.io real-time layer
// ---------------------------------------------------------------------------

const io = socketio(server, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true }
});

// roomId -> { guardianId, memberIds: Set<string>, sockets: Map<userId, Set<socketId>> }
const roomIndex = new Map();

async function loadRoomIndex(roomId) {
  if (roomIndex.has(roomId)) return roomIndex.get(roomId);
  const room = await Room.findById(roomId);
  if (!room) return null;

  const entry = {
    guardianId: room.admin.toString(),
    memberIds: new Set(room.members.map((m) => m.toString())),
    sockets: new Map()
  };
  roomIndex.set(roomId, entry);
  return entry;
}

io.on('connection', (socket) => {
  // Loops each incoming user connection safely into its own isolated room
  // channel, after verifying the user actually belongs to that room.
  socket.on('join-room', async ({ roomId, userId }) => {
    try {
      const entry = await loadRoomIndex(roomId);
      if (!entry || !entry.memberIds.has(userId)) {
        socket.emit('join-error', { message: 'Not authorized to join this room' });
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.isGuardian = entry.guardianId === userId;

      if (!entry.sockets.has(userId)) entry.sockets.set(userId, new Set());
      entry.sockets.get(userId).add(socket.id);

      socket.emit('join-ack', { isGuardian: socket.isGuardian });
    } catch (err) {
      console.error('join-room error:', err);
      socket.emit('join-error', { message: 'Server error joining room' });
    }
  });

  // Securely spreads latitude, longitude, username, and email to matching
  // active room clients only — never to sockets outside socket.roomId.
  socket.on('send-Location', (data) => {
    if (!socket.roomId || !socket.userId) return;

    io.to(socket.roomId).emit('received_Location', {
      userId: socket.userId,
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        username: data.username,
        email: data.email
      }
    });
  });

  // Guardian assigns a route to a specific tracked member.
  socket.on('assign-new-route', async (payload) => {
    try {
      if (!socket.roomId || !socket.isGuardian) return; // server-verified role

      const { targetUserId, start, end, geometry } = payload;
      const entry = roomIndex.get(socket.roomId);
      if (!entry || !entry.memberIds.has(targetUserId)) return;

      const history = await RouteHistory.create({
        roomId: socket.roomId,
        target: targetUserId,
        guardian: socket.userId,
        status: 'on-route',
        assignedRoute: { start, end, geometry },
        roamingPath: []
      });

      io.to(socket.roomId).emit('route-assigned-broadcast', {
        historyId: history._id,
        targetUserId,
        start,
        end,
        geometry
      });
    } catch (err) {
      console.error('assign-new-route error:', err);
    }
  });

  // Member's client detected it drifted more than 50m off the assigned path.
  socket.on('member-deviated-update', async (payload) => {
    try {
      if (!socket.roomId || !socket.userId) return;
      const { historyId, lat, lng } = payload;

      await RouteHistory.findByIdAndUpdate(historyId, {
        status: 'off-route',
        $push: { roamingPath: { lat, lng, timestamp: new Date() } }
      });

      // Alert the guardian in real time — only the guardian's own socket(s),
      // not the whole room.
      const entry = roomIndex.get(socket.roomId);
      if (!entry) return;
      const guardianSockets = entry.sockets.get(entry.guardianId);
      if (!guardianSockets) return;

      guardianSockets.forEach((sid) => {
        io.to(sid).emit('guardian-notification-alert', {
          userId: socket.userId,
          lat,
          lng,
          message: 'Warning! A member has moved away from the designated safety path!'
        });
      });
    } catch (err) {
      console.error('member-deviated-update error:', err);
    }
  });

  socket.on('disconnect', () => {
    if (!socket.roomId || !socket.userId) return;
    const entry = roomIndex.get(socket.roomId);
    if (entry && entry.sockets.has(socket.userId)) {
      entry.sockets.get(socket.userId).delete(socket.id);
      if (entry.sockets.get(socket.userId).size === 0) {
        entry.sockets.delete(socket.userId);
        io.to(socket.roomId).emit('user-disconnected', { userId: socket.userId });
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Bind to 0.0.0.0 (not just localhost) so phones/laptops on the same LAN
// can reach the dev server via the host machine's local network IP.
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});