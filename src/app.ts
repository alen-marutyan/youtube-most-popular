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

  const y = [];


  res.data.items.forEach(el=>{
    y.push({
      PutRequest: {
        Item: {
          title: el.snippet.title,
          count: 0
        }
      }
    })
  });

  let getItem;
  const params = [];
  for (const el of res.data.items){
    getItem = await docClient.get({
      TableName: YOUTUBE_TABLE,
      Key: {
        title: el.snippet.title,
      }
    }).promise();


    if (getItem.Item){

      params.push(docClient.update({
        TableName: YOUTUBE_TABLE,
        Key: {
          title: getItem.Item.title,
        },
        UpdateExpression : "set #createdate = :createdate",
        ExpressionAttributeNames : {
          '#createdate' : 'count'
        },
        ExpressionAttributeValues : {
          ':createdate' : getItem.Item.count+1
        },
        ReturnValues : 'UPDATED_NEW'
      })
      );

      await Promise.all(params).catch(err=>{
        return {
          statusCode: err.statusCode,
          body: err
        }
      })
    }else {
      const batchPutItems = {
        RequestItems: {
          'youtube-table-dev': y
        }
      };

      await docClient.batchWrite(batchPutItems).promise();

    }
  }

  return {
    statusCode: 200
  }
}
