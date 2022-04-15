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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const googleapis_1 = require("googleapis");
let YouTube_API, MY_TABLE;
YouTube_API = process.env["YouTube_API"];
MY_TABLE = process.env["MY_TABLE"];
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
        };
        batchParams.push(params);
    }
    const batchPutItems = {
        RequestItems: {
            'my_table': batchParams
        }
    };
    yield docClient.batchWrite(batchPutItems).promise();
    return {
        statusCode: 200
    };
});
exports.handler = handler;
//# sourceMappingURL=stream.js.map