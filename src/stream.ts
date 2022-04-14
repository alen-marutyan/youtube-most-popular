import {google} from "googleapis";
import AWS from "aws-sdk";

let YouTube_API: string, YOUTUBE_TABLE: string;
YouTube_API = process.env["YouTube_API"];
YOUTUBE_TABLE = process.env["YOUTUBE_TABLE"];
const docClient = new AWS.DynamoDB.DocumentClient();


const service = google.youtube({
    version: 'v3',
    auth: YouTube_API
})


export const handler = async (event) => {
    const res = await service.videos.list({
        "part": [
            "snippet, contentDetails, statistics"
        ],
        "chart": "mostPopular",
    });

    let title = [];

    event.Records.forEach(el=>{
        console.log('amen mi element', el.dynamodb)
        title.push(el.dynamodb.Keys.title.S);
    });


  let items = [];
  for (let i = 0; i < res.data.items.length; i++){
      for (let j = 0; j < title.length; j++) {
          if (res.data.items[i].snippet.title == title[j]) {
              items.push({
                  videoId: res.data.items[i].id,
                  duration: res.data.items[i].contentDetails.duration
              });
          }

      }

  }



 for (const el of items) {
     await docClient.put({
          TableName: 'my_table',
          Item: el
     }).promise();
  }

 return {
     statusCode: 200
 }

}