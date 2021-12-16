const reservationsController = require('./reservationsController');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

// Get all reservations.
router.get('/reservations', reservationsController.getAllReservations);

// Get a specific reservation.
router.get('/reservations/:id', reservationsController.getReservation);

// Create a new reservation.
router.post('/reservations', reservationsController.createReservation);

// Update a specific reservation.
router.put('/reservations/:id', reservationsController.updateReservation);

// Delete a specific reservation.
router.delete('/reservations/:id', reservationsController.deleteReservation);

module.exports = router;
