var admin = require('firebase-admin');
var fcm = require('fcm-notification');
var schedule = require ('node-schedule');
var request = require('request');
var serviceAccount = require('../config/push-notification-key.json');
const certPath = admin.credential.cert(serviceAccount);
var FCM = new fcm(certPath);
var _ = require("underscore");
const { scheduleJob } = require('node-schedule');
const fs = require('fs');
 
cryptoname=["SATT","BNB","ETC","BTC","OMG","DAI","USDT","ZRX","MKR","BUSD","MATIC","BTT","TRX","CAKE"];

oldarray=[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0];
notiflistname=[];
notiflistprice=[];
array = [];

//Premier point : Remplissage de la list des oldarray

      request({
        url: "https://api-preprod2.satt-token.com/wallet/cryptoDetails",
        json:true,
        method: "GET",
        timeout: 10000,
        headers: {
            "content-type": "application/json",
        },
        //followRedirect: true,
        //maxRedirects: 10
    },
    function(error, response, body){
    if(!error && (response && response.statusCode) === 200){
        var arrayfile = fs.readFileSync('Token.txt').toString().split(",");
    for(i in arrayfile) {

        if(i==="" && i===" "){console.log("space in list array")}
            else  { array[array.length]=arrayfile[i];}

     }
        array = array.filter(function(elem, pos) {
    return array.indexOf(elem) == pos;
});
        const customer1 = JSON.parse(JSON.stringify(body));
        cryptoname.forEach(function(namecry,index,error, response, body) { 
            oldarray[index]=(Math.abs(customer1["data"][namecry].percent_change_24h.toFixed(20)));
   
     });
    } else {
            console.log(`Error = ${error}, code = ${response && response.statusCode}`);
        }
});

//Deuxième point : Comparaison avec une actualisation

var requestLoop = setInterval(function(){

    request({
        url: "https://api-preprod2.satt-token.com/wallet/cryptoDetails",
        json:true,
        method: "GET",
        timeout: 10000,
        headers: {
            "content-type": "application/json",
        },
        //followRedirect: true,
        //maxRedirects: 10
    },
    
    function(error, response, body){
        if(!error && (response && response.statusCode) === 200){
            try {
                i=0;
                  const customer = JSON.parse(JSON.stringify(body));

            cryptoname.forEach(function(namecry) { 
                  //console.log("cryptoname ///****/****//***" ,Number(Math.abs(customer["data"][namecry].percent_change_24h.toFixed(20)) ));
                    if(Math.abs(Number((customer["data"][namecry].percent_change_24h.toFixed(20)) - (oldarray[i])))>=Number(2)) 
                    {
                        console.log('true');
                        oldarray[i] =  customer["data"][namecry].percent_change_24h.toFixed(20) ;
                        notiflistname.push([namecry]);
                        notiflistprice.push(customer["data"][namecry].price);
                      
                    }
                    else{
                         console.log('Egale');
                      }
                    i++;

                });
                } catch (err) {
                console.log("Error parsing JSON string:", err);
              }
        }else{
            console.log(`Error = ${error}, code = ${response && response.statusCode}`);
        }
    });
    //console.log("list oldarray ****************",oldarray);
    if(notiflistname.length>0)
        j=0;
    notiflistname.forEach(async(i,index) =>{ 
     nametok=i;
     pricetok=notiflistprice[index].toFixed(20);
    await request(
        {
        url: `http://localhost:4000/api/send-notification?i=${nametok}&p=${pricetok}`,
        method: "POST",
       /*body: JSON.stringify({
            "name": nametok,
            "price": pricetok, 
        }), */
          
       
    },
    function(error, response, body){
        if(!error && response.statusCode == 200){
            console.log('sucess!');
        }else{
            console.log('error' + response.statusCode);
        }
    });
 
 j++;
 
  });
  notiflistname=[];
  notiflistprice=[];

 console.log("in cron the list of UserToken array ",array);
  },  50000);


//Troisième point : Push notification

exports.sendPushNotification  = (req, res ,next,)=>{
    try {
        let message ={
            notification: {
                title: 'iHave',
                body: 'the '+ req.query.i+' have more than 2% variation, the current price is : '+ req.query.p  ,
            },
 
              } 

        FCM.sendToMultipleToken(message, array,(err, resp) => {
            if (err) {
                return res.status(500).send({message:err});
            } else {
                return res.status(200).send({message:"Notification Sent!"});
            }

        });

    }
    catch (err) {
        throw console.log("sendPushNotification ",err);
    }
}

//Quatrième point : Save Token

exports.saveUserToken  = (req, res ,next) => {

    array[array.length]= 'Bearer '+ req.query.token;
    console.log("saveUserToken array ",array);
    res.send("Done");

    fs.appendFile('Token.txt', 'Bearer '+ req.query.token+",", function (err) {
    if (err) throw err;
      console.log('Saved in Token.txt !');

    });
    var arrayfile = fs.readFileSync('Token.txt').toString().split(",");
    for(i in arrayfile) {
       if(i==="" && i===" "){console.log("space in list array")}
            else  { array[array.length]=arrayfile[i];}
     }
        array = array.filter(function(elem, pos) {
    return array.indexOf(elem) == pos;
})
        console.log("file to the array ",array);
}









