const reservationsService = require('./reservationsService');

const Joi = require('joi');


/**
 * Validate a reservation.
 * @param {*} reservation The reservation to validate.
 * @return {Boolean} Whether the reservation is valid.
 */
function validateReservation(reservation) {
  // Create the reservation schema.
  const reservationArraySchema = {
    depart: Joi.string().required(),
    arrive: Joi.string().required(),
    departDate: Joi.string().required(),
    arriveDate: Joi.string().required(),
  };

  // Create the reservation schema.
  const reservationSchema = {
    displayName: Joi.string().required(),
    pointsBalance: Joi.number().integer().required(),
    status: Joi.string().required(),
    reservations: Joi.array().items(reservationArraySchema).required(),
  };

  return Joi.validate(reservation, reservationSchema);
}

/**
 * Get all reservations.
 * @param {Object} _ The HTTP request object.
 * @param {Object} res The HTTP response object.
 */
function getAllReservations(_, res) {
  res.send(reservationsService.getAllReservations());
}

/**
 * Get a specific reservation.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @return {Object} A HTTP response object.
 */
function getReservation(req, res) {
  // Find reservation.
  const reservation = reservationsService.getReservation(req.params.id);
  if (!reservation) {
    return res.status(404).send(
        `Could not find reservation with ID "${req.params.id}".`);
  }

  res.send(reservation);
}

/**
 * Create a new reservation.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @return {Object} A HTTP response object.
 */
function createReservation(req, res) {
  // Validate request body.
  const {error} = validateReservation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  res.send(reservationsService.createReservation(req.body));
}

/**
 * Update an existing reservation.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @return {Object} A HTTP response object.
 */
function updateReservation(req, res) {
  // Find reservation.
  const reservation = reservationsService.getReservation(req.params.id);
  if (!reservation) {
    return res.status(404).send(
        `Could not find reservation with ID "${req.params.id}".`);
  }

  // Validate request body.
  const {error} = validateReservation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  res.send(reservationsService.updateReservation(reservation, req.body));
}

/**
 * Delete an existing reservation.
 * @param {Object} req The HTTP request object.
 * @param {Object} res The HTTP response object.
 * @return {Object} A HTTP response object.
 */
function deleteReservation(req, res) {
  // Find reservation.
  const reservation = reservationsService.getReservation(req.params.id);
  if (!reservation) {
    return res.status(404).send(
        `Could not find reservation with ID "${req.params.id}".`);
  }

  reservationsService.deleteReservation(reservation);

  res.status(204).send();
}

module.exports = {createReservation, getAllReservations, getReservation,
  updateReservation, deleteReservation};
