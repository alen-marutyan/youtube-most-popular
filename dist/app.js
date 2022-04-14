"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const googleapis_1 = require("googleapis");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
let YouTube_API, YOUTUBE_TABLE;
YouTube_API = process.env["YouTube_API"];
YOUTUBE_TABLE = process.env["YOUTUBE_TABLE"];
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const service = googleapis_1.google.youtube({
    version: 'v3',
    auth: YouTube_API
});
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // const res = await service.videos.list({
    //   "part": [
    //     "snippet, contentDetails, statistics"
    //   ],
    //   "chart": "mostPopular",
    // });
    // const y = [];
    // res.data.items.forEach(el => {
    //   y.push({
    //     PutRequest: {
    //       Item: {
    //         title: el.snippet.title,
    //         count: 0
    //       }
    //     }
    //   });
    // });
    // for (const el of res.data.items) {
    //   const getItem = await docClient.get({
    //     TableName: YOUTUBE_TABLE,
    //     Key: {
    //       title: el.snippet.title,
    //     }
    //   }).promise();
    //   if (getItem.Item) {
    //     await docClient.update({
    //       TableName: YOUTUBE_TABLE,
    //       Key: {
    //         title: getItem.Item.title,
    //       },
    //       UpdateExpression: "set #createdate = :createdate",
    //       ExpressionAttributeNames: {
    //         '#createdate': 'count'
    //       },
    //       ExpressionAttributeValues: {
    //         ':createdate': getItem.Item.count + 1
    //       },
    //       ReturnValues: 'UPDATED_NEW'
    //     }).promise();
    //   }
    //   else {
    //     await docClient.put({
    //       TableName: YOUTUBE_TABLE,
    //       Item: {
    //         title: el.snippet.title,
    //         count: 0,
    //       }
    //     }).promise();
    //   }
    // }
    // return {
    //   statusCode: 200
    // };
    const res = yield service.videos.list({
        "part": [
            "snippet, contentDetails, statistics"
        ],
        "chart": "mostPopular",
    });
    const y = [];
    res.data.items.forEach(el => {
        y.push({
            PutRequest: {
                Item: {
                    title: el.snippet.title,
                    count: 0
                }
            }
        });
    });
    let getItem;
    let arr = [];
    for (const el of res.data.items) {
        getItem = yield docClient.get({
            TableName: YOUTUBE_TABLE,
            Key: {
                title: el.snippet.title,
            }
        }).promise();
        if (getItem.Item) {
            arr.push(docClient.update({
                TableName: YOUTUBE_TABLE,
                Key: {
                    title: getItem.Item.title,
                },
                UpdateExpression: "set #createdate = :createdate",
                ExpressionAttributeNames: {
                    '#createdate': 'count'
                },
                ExpressionAttributeValues: {
                    ':createdate': getItem.Item.count + 1
                },
                ReturnValues: 'UPDATED_NEW'
            }));
            yield Promise.all(arr).catch(err => {
                return {
                    statusCode: err.statusCode,
                    body: err
                };
            });
        }
        else {
            let params = {
                RequestItems: {
                    'youtube-table-dev': y
                }
            };
            yield docClient.batchWrite(params).promise();
        }
    }
    return {
        statusCode: 200
    };
});
exports.handler = handler;
//# sourceMappingURL=app.js.map