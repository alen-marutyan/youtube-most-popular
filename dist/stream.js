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
    const res = yield service.videos.list({
        "part": [
            "snippet, contentDetails, statistics"
        ],
        "chart": "mostPopular",
    });
    let title = [];
    event.Records.forEach(el => {
        console.log('amen mi element', el.dynamodb);
        title.push(el.dynamodb.Keys.title.S);
    });
    let items = [];
    for (let i = 0; i < res.data.items.length; i++) {
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
        yield docClient.put({
            TableName: 'my_table',
            Item: el
        }).promise();
    }
    return {
        statusCode: 200
    };
});
exports.handler = handler;
//# sourceMappingURL=stream.js.map