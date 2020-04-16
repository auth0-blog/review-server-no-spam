const express = require("express");
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("Welcome!"));

app.post("/review", async (req, res) => {
  let statusCode = 403;

  const ipAddress = processIpAddress(req.ip);
  console.log(`Review received from IP ${ipAddress}: ${JSON.stringify(req.body)}`);

  const reputationScore = await getReputationScore(ipAddress);

  switch (reputationScore) {
    case 0:
      storeReview(req.body); 
      statusCode = 201;   //Created
      break;

    case -1:
    case -2:
      toReviewModeration(req.body)
      statusCode = 202;   //Accepted
      break;

    default:
      statusCode = 403;   //Forbidden
      break;
  }
  
  res.status(statusCode).end();
});

app.listen(port, () => console.log(`The server is listening at http://localhost:${port}`));


function storeReview(review) {
  console.log(`Storing review ${JSON.stringify(review)}`);
}

function toReviewModeration(review) {
  console.log(`Review to moderate: ${JSON.stringify(review)}`);
}

async function getReputationScore(ipAddress) {
  try {
    const response = await axios.get(
        `https://signals.api.auth0.com/v2.0/ip/${ipAddress}`,
        {headers: {"X-Auth-Token": "YOUR-API-KEY"}}
      );

    return response.data.fullip.score;
  } catch (error) {
    console.error(error);
  }
}

function processIpAddress(ipAddress) {
  const sampleIpAddressList = [
    "31.217.222.105",
    "45.132.104.18",
    "172.217.21.68",
    "23.222.3.98"
  ];
  let result = ipAddress;

  if (["127.0.0.1", "::ffff:127.0.0.1", "::1"].includes(ipAddress)) {
    result = sampleIpAddressList[Math.floor(Math.random() * Math.floor(4))]
  }

  return result;
}