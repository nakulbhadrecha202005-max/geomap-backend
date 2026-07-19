// models.js
const mongoose = require('mongoose')

// NOTE: This file only registers 'Room' and 'RouteHistory'. It intentionally
// does NOT register 'User' — that schema lives in ./UserAuthentication/model.js
// and must be required once, early, by the entry file (index.js) before any
// .populate('...') call touches it. Otherwise Mongoose throws:
//   MissingSchemaError: Schema hasn't been registered for model "User"

const RoomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
)

const RouteHistorySchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guardian: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['on-route', 'off-route', 'completed'],
      default: 'on-route'
    },
    assignedRoute: {
      start: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      end: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      // Full OSRM-calculated polyline, stored point-for-point so the
      // exact path geometry can be replayed/audited later with full fidelity.
      geometry: [
        {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
          _id: false
        }
      ]
    },
    // Every point recorded once a member has drifted more than 50m off
    // their assigned route, with a timestamp for each deviation event.
    roamingPath: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        _id: false
      }
    ]
  },
  { timestamps: true }
)

// Guard against OverwriteModelError if this file is ever required twice
// (e.g. hot-reload in dev).
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema)
const RouteHistory =
mongoose.models.RouteHistory || mongoose.model('RouteHistory', RouteHistorySchema)

module.exports = { Room, RouteHistory, RoomSchema, RouteHistorySchema}
