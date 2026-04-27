// server.js
// This is the backend for my ticket booking project
// I am using express and node.js

var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var path = require("path");

var app = express();
var PORT = 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// this is my fake database (array)
var events = [
  {
    id: "e1",
    name: "Coldplay World Tour 2026",
    date: "2026-04-15",
    time: "7:00 PM",
    venue: "Hyderabad Arena",
    category: "Concert",
    price: 2500,
    available: 50,
    image: "🎵",
  },
  {
    id: "e2",
    name: "IPL Final - RCB vs MI",
    date: "2026-05-25",
    time: "6:30 PM",
    venue: "Wankhede Stadium, Mumbai",
    category: "Sports",
    price: 1200,
    available: 200,
    image: "🏏",
  },
  {
    id: "e3",
    name: "Tech Summit India 2026",
    date: "2026-04-30",
    time: "10:00 AM",
    venue: "HITEX, Hyderabad",
    category: "Conference",
    price: 500,
    available: 100,
    image: "💻",
  },
  {
    id: "e4",
    name: "Bahubali Theatre Experience",
    date: "2026-05-10",
    time: "9:00 PM",
    venue: "PVR IMAX, Vijayawada",
    category: "Movie",
    price: 350,
    available: 80,
    image: "🎬",
  },
  {
    id: "e5",
    name: "Comedy Night with Zakir Khan",
    date: "2026-04-22",
    time: "8:00 PM",
    venue: "Shilpakala Vedika, Hyderabad",
    category: "Comedy",
    price: 800,
    available: 60,
    image: "😂",
  },
  {
    id: "e6",
    name: "AR Rahman Live Concert",
    date: "2026-06-01",
    time: "6:00 PM",
    venue: "Chennai Trade Centre",
    category: "Concert",
    price: 1500,
    available: 120,
    image: "🎼",
  },
];

// this array will store all bookings
var bookings = [];

// this is a simple function to make a random ticket id
function makeTicketId() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var result = "TKT-";
  for (var i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// get all events
app.get("/api/events", function(req, res) {
  res.json({ success: true, data: events });
});

// get one event by id
app.get("/api/events/:id", function(req, res) {
  var id = req.params.id;
  var event = null;

  // loop through events and find matching id
  for (var i = 0; i < events.length; i++) {
    if (events[i].id == id) {
      event = events[i];
      break;
    }
  }

  if (event == null) {
    res.json({ success: false, message: "Event not found" });
  } else {
    res.json({ success: true, data: event });
  }
});

// book a ticket
app.post("/api/book", function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var seats = req.body.seats;
  var eventId = req.body.eventId;

  // check if all fields are given
  if (!name || !email || !phone || !seats || !eventId) {
    res.json({ success: false, message: "Please fill all fields" });
    return;
  }

  // find the event
  var foundEvent = null;
  for (var i = 0; i < events.length; i++) {
    if (events[i].id == eventId) {
      foundEvent = events[i];
      break;
    }
  }

  // if event not found
  if (foundEvent == null) {
    res.json({ success: false, message: "Event not found" });
    return;
  }

  // check if enough seats are available
  if (foundEvent.available < seats) {
    res.json({ success: false, message: "Not enough seats available" });
    return;
  }

  // reduce the available seats
  foundEvent.available = foundEvent.available - seats;

  // create a new booking object
  var newBooking = {
    bookingId: makeTicketId(),
    eventId: eventId,
    eventName: foundEvent.name,
    venue: foundEvent.venue,
    date: foundEvent.date,
    time: foundEvent.time,
    name: name,
    email: email,
    phone: phone,
    seats: seats,
    totalAmount: seats * foundEvent.price,
    status: "Confirmed"
  };

  // save booking to array
  bookings.push(newBooking);

  res.json({ success: true, message: "Booking confirmed!", data: newBooking });
});

// get all bookings
app.get("/api/bookings", function(req, res) {
  res.json({ success: true, data: bookings });
});

// cancel a booking
app.delete("/api/bookings/:id", function(req, res) {
  var bookingId = req.params.id;
  var index = -1;

  // find the booking
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId == bookingId) {
      index = i;
      break;
    }
  }

  // if not found
  if (index == -1) {
    res.json({ success: false, message: "Booking not found" });
    return;
  }

  // give back the seats
  var cancelledBooking = bookings[index];
  for (var i = 0; i < events.length; i++) {
    if (events[i].id == cancelledBooking.eventId) {
      events[i].available = events[i].available + cancelledBooking.seats;
      break;
    }
  }

  // remove booking from array
  bookings.splice(index, 1);

  res.json({ success: true, message: "Booking cancelled" });
});

// start the server
app.listen(PORT, function() {
  console.log("Server is running at http://localhost:" + PORT);
});

