// const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");


const allMessages =async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};


const sendMessage = async (req, res) => {
  const { content, chatId,ownId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: ownId,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const updateMessageForDeletion = async (req, res) => {
  const { messageId, ownId } = req.body;

  if (!messageId || !ownId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Find the message first to check ownership
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the person trying to delete is the original sender
    if (message.sender.toString() !== ownId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Update the message content to indicate it was deleted
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content: "This message was deleted" },
      { new: true }
    )
      .populate("sender", "name pic email")
      .populate("chat")
      .populate({
        path: "chat.users",
        select: "name pic email",
      });

    // If this is the latest message in the chat, update the latestMessage reference too
    const chat = await Chat.findById(message.chat);
    if (chat.latestMessage && chat.latestMessage.toString() === messageId) {
      await Chat.findByIdAndUpdate(message.chat, { latestMessage: updatedMessage });
    }

    res.json(updatedMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { allMessages, sendMessage ,updateMessageForDeletion};
