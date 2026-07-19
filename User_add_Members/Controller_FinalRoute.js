const { RoomSchema } = require('./RouteHistorySchema')

const Controller_FinalRoute = async (req, res) => {
    try {
    console.log(req.user.email);
        const roomname_duplicate = await RoomSchema.findOne({ roomName: req.body.roomName });
        if (roomname_duplicate) {
            return res.send("Room Name already existed.");
        }
      const room = new RoomSchema({
        roomName: req.body.roomName,
        admin: req.user._id,
        // email: req.body.email,
        members: [req.user._id]
      });

      await room.save();

      res.send("Room created successfully");
    } catch (err) {
      res.status(500).send(err.message);
    }
}

module.exports = Controller_FinalRoute;