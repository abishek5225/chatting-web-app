const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

// Load environment variables from .env file
require("dotenv").config();

// Socket.io setup
const io = require("socket.io")(8080, {
  cors: {
    origin: "http://localhost:3002",
  },
});

//connection
mongoose.connect(process.env.MONGODB_URL).then(()=>{
  console.log("Connected to database");
}).catch((err)=>{
  console.log(err, "Error connecting to database",process.env.MONGODB_URL);
})

// Define schemas and models
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  token: String,
});

const conversationSchema = new mongoose.Schema({
  members: [String],
});

const messageSchema = new mongoose.Schema({
  conversationId: String,
  messages: [
    {
      senderId: String,
      receiverId: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

// Socket.io handlers
let users = [];
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("addUser", (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  });

  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, message, conversationId }) => {
      const receiver = users.find((user) => user.userId === receiverId);
      const sender = users.find((user) => user.userId === senderId);
      const user = await User.findById(senderId);

      if (!user) {
        console.error(`User with ID ${senderId} not found`);
        return;
      }

      if (receiver) {
        io.to(receiver.socketId)
          .to(sender.socketId)
          .emit("getMessage", {
            senderId,
            message,
            conversationId,
            receiverId,
            user: { id: user._id, fullName: user.fullName, email: user.email },
          });
      } else {
        io.to(sender.socketId).emit("getMessage", {
          senderId,
          message,
          conversationId,
          receiverId,
          user: { id: user._id, fullName: user.fullName, email: user.email },
        });
      }
    }
  );

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Welcome");
});

app.post("/api/register", async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json.apply({message:"Please fill all required fields"});
    }
      const isAlreadyExist = await User.findOne({ email });
      if(isAlreadyExist){
        return res.status(400).json({message:"User already exists"});
      }
      const hashedPassword = await bcryptjs.hash(password, 10);
      const newUser = 
     
    
  } catch (error) {
    console.log(error, "Error");
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send("Please fill all required fields");
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).send("User email or password is incorrect");
      } else {
        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
          res.status(400).send("User email or password is incorrect");
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET_KEY =
            process.env.JWT_SECRET_KEY || "THIS_IS_A_JWT_SECRET_KEY";

          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 84600 },
            async (err, token) => {
              await User.updateOne(
                { _id: user._id },
                {
                  $set: { token },
                }
              );
              user.save();
              return res.status(200).json({
                user: {
                  id: user._id,
                  email: user.email,
                  fullName: user.fullName,
                },
                token: token,
              });
            }
          );
        }
      }
    }
  } catch (error) {
    console.log(error, "Error");
  }
});

app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });
    await newConversation.save();
    res.status(200).send("Conversation created successfully");
  } catch (error) {
    console.log(error, "Error");
  }
});

app.get("/api/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });

    const conversationUserData = await Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );
        const user = await User.findById(receiverId);

        if (!user) {
          console.error(`User with ID ${receiverId} not found`);
          return null;
        }

        return {
          user: {
            receiverId: user._id,
            email: user.email,
            fullName: user.fullName,
          },
          conversationId: conversation._id,
        };
      })
    );

    res.status(200).json(conversationUserData.filter(Boolean));
  } catch (error) {
    console.log(error, "Error");
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId = "" } = req.body;
    if (!senderId || !message)
      return res.status(400).send("Please fill all required fields");

    let convId = conversationId;
    if (convId === "new" && receiverId) {
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      convId = newConversation._id;
    } else if (!convId && !receiverId) {
      return res.status(400).send("Please fill all required fields");
    }

    const existingMessage = await Message.findOne({ conversationId: convId });

    if (existingMessage) {
      existingMessage.messages.push({ senderId, receiverId, message });
      await existingMessage.save();
      res.status(200).json(existingMessage);
    } else {
      const newMessage = new Message({
        conversationId: convId,
        messages: [{ senderId, receiverId, message }],
      });
      await newMessage.save();
      res.status(201).json(newMessage);
    }
  } catch (error) {
    console.log(error, "Error");
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/message/:conversationId", async (req, res) => {
  try {
    const checkMessages = async (conversationId) => {
      console.log(conversationId, "conversationId");
      const messages = await Message.find({ conversationId });
      const messageUserData = await Promise.all(
        messages.map(async (message) => {
          const user = await User.findById(message.senderId);
          if (!user) {
            console.error(`User with ID ${message.senderId} not found`);
            return null;
          }
          return {
            user: { id: user._id, email: user.email, fullName: user.fullName },
            message: message.message,
          };
        })
      );
      res.status(200).json(messageUserData.filter(Boolean));
    };
    const conversationId = req.params.conversationId;
    if (conversationId === "new") {
      const { senderId, receiverId } = req.body;
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      const messages = await checkMessages(newConversation._id);
      res.status(200).send({ messages, conversationId: newConversation._id });
    } else {
      const messages = await checkMessages(conversationId);
      res.status(200).send({ messages, conversationId });
    }
  } catch (error) {
    console.log(error, "Error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
