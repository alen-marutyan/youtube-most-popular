import AWS from "aws-sdk";
import {google} from "googleapis";

let YouTube_API: string, MY_TABLE: string;
YouTube_API = process.env["YouTube_API"];
MY_TABLE = process.env["MY_TABLE"];
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

    const batchParams = [];

    for (const el of event.Records) {
        const streamData = res.data.items.find(item => item.snippet.title === el.dynamodb.Keys.title.S);
        const params = {
            PutRequest: {
                Item: {
                    "videoId": streamData.id,
                    "duration": streamData.contentDetails.duration
                }
            }
        }
        batchParams.push(params);
    }

    const batchPutItems = {
        RequestItems: {
            'my_table': batchParams
        }
    };

    await docClient.batchWrite(batchPutItems).promise();

    return {
        statusCode: 200
    }
}
