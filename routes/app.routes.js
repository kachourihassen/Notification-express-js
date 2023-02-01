const pushNotificationController = require("../controller/push-notification.controller");
const express = require("express");
const router = express.Router();
const schedule = require('node-schedule');
//var http = require('http');
var request = require('request');

router.post('/send-notification' , pushNotificationController.sendPushNotification);
router.post('/save-token' , pushNotificationController.saveUserToken);



module.exports = router;
