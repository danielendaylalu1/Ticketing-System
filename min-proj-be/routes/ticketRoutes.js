const express = require("express");
const { createTicket, getTickets, updateTicketStatus } = require("../controllers/ticketController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth(), createTicket);
router.get("/", auth(), getTickets);
router.put("/:id", auth(["admin"]), updateTicketStatus);

module.exports = router;
