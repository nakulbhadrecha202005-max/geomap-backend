// models.js
const mongoose = require('mongoose')
const { Room } = require('./Router_Final_map')
const User = require('../UserAuthentication/model')
const RouteHistorySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RakshapathUsers',
    required: true
  },
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RakshapathUsers',
    required: true
  },
  status: { type: String, enum: ['on-route', 'off-route', 'completed'], default: 'on-route' },
  assignedRoute: {
    start: { lat: Number, lng: Number },
    end: { lat: Number, lng: Number },
    geometry: [Array] // Stores the complete path layout coordinates for accurate checking
  },
  roamingPath: [
    {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true })

const RoomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RakshapathUsers'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RakshapathUsers'
  }]
})

module.exports = {
  RouteHistory: mongoose.model('RouteHistory', RouteHistorySchema),
  Room: mongoose.model('Room', RoomSchema)
}
