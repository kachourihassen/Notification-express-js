const pushNotificationController = require("../controller/push-notification.controller");
const express = require("express");
const router = express.Router();
const schedule = require('node-schedule');
const app = express()
var http = require('http');
var server = http.createServer(app);
var io = require("socket.io")(server);
 


const Port1 = process.env.Port || 6000;
app.use(express.json());
//app.use(cors());
var clients={};
io.on("connection",(socket)=>{
    console.log("Connected");
    console.log(socket.id,"has joined");
    socket.on("signin",(email)=>{
        console.log(email);
        clients[email]=socket;
        //console.log(clients);
    });
    socket.on("message",(msg)=>{
        console.log(msg);
        let targetEmail=msg.targetEmail;
        if(clients[targetEmail])
        clients[targetEmail].emit("message",msg);
    });
});


server.listen(Port1,"0.0.0.0",()=>console.log(`Server OI started  on port ${Port1}`)
 );


router.post('/send-notification' , pushNotificationController.sendPushNotification);
router.post('/save-token' , pushNotificationController.saveUserToken);
router.post('/connectqr' , pushNotificationController.chatqr);


module.exports = router;