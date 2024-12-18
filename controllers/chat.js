const Message = require('../model/chat'); // Adjust the path according to your folder structure
const Notification=require('../model/notification')
const User=require('../model/users')
const sendMessage = async (req, res) => {
    try {
      const { senderId, receiverId, message } = req.body;
  
      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Fetch the sender's email from the User model
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found." });
      }
  
      // Create the new message
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        message,
      });
  
      const savedMessage = await newMessage.save();
  
      // Create a notification for the receiver
      const notification = new Notification({
        userId: receiverId,
        messageId: savedMessage._id,
        content: `You have a new message from ${sender.email}`,  // Use sender's email in the content
      });
  
      await notification.save();
  
      res.status(201).json({ message: "Message sent and notification created." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  const getNotifications = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Get all notifications for the user, where isRead is false
      const notifications = await Notification.find({
        userId,
        isRead: false,
      }).populate('messageId', 'sender message'); // Optional: Populate the message details
  
      res.status(200).json({ notifications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  const getMessages = async (req, res) => {
    try {
      const { userId, targetUserId } = req.params;
  
      if (!userId || !targetUserId) {
        return res.status(400).json({ message: "Both userId and targetUserId are required." });
      }
  
      // Query to get messages where the authenticated user is either the sender or receiver,
      // and the target user is the other participant.
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: targetUserId },
          { sender: targetUserId, receiver: userId },
        ],
      })
        .populate('sender', 'firstname lastname email') // Populate sender details
        .populate('receiver', 'firstname lastname email') // Populate receiver details
        .sort({ createdAt: 1 }); // Sort messages by creation time (ascending)
  
      res.status(200).json({ messages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  const markAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
  
      // Mark the notification as read
      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
  
      res.status(200).json({ notification: updatedNotification });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
module.exports = {markAsRead,getNotifications, sendMessage,getMessages };
  