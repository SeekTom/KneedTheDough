const express = require("express");
require("dotenv").config();
const Twilio = require("twilio");
var bodyParser = require("body-parser");
var mustacheExpress = require("mustache-express");

const app = express();
const port = 3000;

app.engine("html", mustacheExpress());

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);


app.set("views", __dirname + "/views");
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const account_sid = process.env.TWILIO_ACME_SYNC_ACCOUNT_SID;
const auth_token = process.env.TWILIO_ACME_SYNC_AUTH_TOKEN;

const client = require("twilio")(account_sid, auth_token);
const serviceSid = process.env.TWILIO_ACME_SYNC_SERVICE_SID;
const mapSid = process.env.TWILIO_ACME_SYNC_ORDER_MAP_SID;

const apikey = process.env.TWILIO_ACME_SYNC_API_KEY;
const apisecret = process.env.TWILIO_ACME_SYNC_API_SECRET;

var AccessToken = require("twilio").jwt.AccessToken;
var SyncGrant = AccessToken.SyncGrant;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

app.get("/", function(req, res) {
  res.render("index.html");
});

app.get("/token", (request, response) => {
  let appName = "TwilioSyncDemo";
  let identity = getRandomInt(2000).toString();

  // Create a "grant" which enables a client to use Sync as a given user,
  // on a given device
  let syncGrant = new SyncGrant({
    serviceSid: process.env.TWILIO_ACME_SYNC_SERVICE_SID
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  let token = new AccessToken(
    process.env.TWILIO_ACME_SYNC_ACCOUNT_SID,
    process.env.TWILIO_ACME_SYNC_API_KEY,
    process.env.TWILIO_ACME_SYNC_API_SECRET
  );
  token.addGrant(syncGrant);
  token.identity = identity;

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});

app.get("/maps", (req, res) => {
  var itemList = [];
  client.sync
    .services(serviceSid)
    .syncMaps(mapSid)
    .syncMapItems.list({ limit: 1000 })
    .catch(err => console.log(err))
    .then(syncMapItems =>
      syncMapItems.forEach(s => {
        itemList.push({ customer_order: { id: s.key, data: s.data } });
      })
    )
    .then(result => {
      res.render("maps.html", { orders: JSON.stringify(itemList) });
    });
});

app.get("/delete", (req, res) => {
  client.sync
    .services(serviceSid)
    .syncMaps(mapSid)
    .syncMapItems.list({ limit: 1000 })
    .catch(err => console.log(err))
    .then(syncMapItems =>
      syncMapItems.forEach(s => {
        client.sync
          .services(serviceSid)
          .syncMaps(mapSid)
          .syncMapItems(s.key)
          .remove()
          .catch(error => console.log(error))
          .then(sync_map_item => console.log("Item deleted"));
      })
    );

  res.sendStatus(200);
});

app.get("/create", (req, res) => {
  client.sync
    .services(serviceSid)
    .syncMaps.create({ uniqueName: "customer_orders" })
    .then(orders => {
      res.sendStatus(200);
    });
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/updateMap", (req, res) => {
  let autopilot_memory = JSON.parse(req.body.Memory); //parse autopilot memory recieved by function
  let customer_name =
    autopilot_memory.twilio.collected_data.customer_order.answers.customer_name
      .answer;
  let order =
    autopilot_memory.twilio.collected_data.customer_order.answers.order.answer;
  let epic =
    autopilot_memory.twilio.collected_data.customer_order.answers.epic.answer;
  let dietary =
    autopilot_memory.twilio.collected_data.customer_order.answers.dietary
      .answer;

  client.sync
    .services(serviceSid)
    .syncMaps(mapSid)
    .syncMapItems.create({
      key: getRandomInt(1000),
      data: {
        order: order,
        customer: customer_name,
        epic: epic,
        dietary: dietary
      }
    })

    .catch(err => console.log(err))
    .then(result => {
      let response = {
        actions: [
          { say: "Thank you " + customer_name + ", Your order is confirmed!." }
        ]
      };
      res.send(JSON.stringify(response));
    });
});
