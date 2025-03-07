const Ticket = require("../models/Ticket");

exports.createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    const ticket = await Ticket.create({ title, description, user: req.user.id });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = req.user.role === "admin"
      ? await Ticket.find().populate("user", "name email")
      : await Ticket.find({ user: req.user.id });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// exports.deleteTicket = async (req, res) => {
//     try {
//       const { status } = req.body;
//       const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
  
//       if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  
//       res.json(ticket);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   };