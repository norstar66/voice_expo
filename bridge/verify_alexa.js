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
const axios_1 = __importDefault(require("axios"));
const ALEXA_ENDPOINT = 'http://localhost:8787/alexa';
function verifyAlexa() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting Alexa Verification...');
        // 1. Test Launch Request
        console.log('\n--- Testing Launch Request ---');
        const launchRequest = {
            version: '1.0',
            session: {
                new: true,
                sessionId: 'amzn1.echo-api.session.test',
                application: { applicationId: 'amzn1.ask.skill.test' },
                user: { userId: 'amzn1.ask.account.test' }
            },
            context: {
                System: {
                    application: { applicationId: 'amzn1.ask.skill.test' },
                    user: { userId: 'amzn1.ask.account.test' },
                    device: { supportedInterfaces: {} }
                }
            },
            request: {
                type: 'LaunchRequest',
                requestId: 'amzn1.echo-api.request.test',
                timestamp: new Date().toISOString(),
                locale: 'en-US'
            }
        };
        try {
            const launchResponse = yield axios_1.default.post(ALEXA_ENDPOINT, launchRequest);
            console.log('Launch Response Status:', launchResponse.status);
            console.log('Launch Speech:', launchResponse.data.response.outputSpeech.ssml);
        }
        catch (error) {
            console.error('Launch Request Failed:', error.message);
            if (error.code)
                console.error('Code:', error.code);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        // 2. Test Get Inventory Intent
        console.log('\n--- Testing GetInventoryIntent ---');
        const intentRequest = {
            version: '1.0',
            session: {
                new: false,
                sessionId: 'amzn1.echo-api.session.test',
                application: { applicationId: 'amzn1.ask.skill.test' },
                user: { userId: 'amzn1.ask.account.test' }
            },
            context: {
                System: {
                    application: { applicationId: 'amzn1.ask.skill.test' },
                    user: { userId: 'amzn1.ask.account.test' },
                    device: { supportedInterfaces: {} }
                }
            },
            request: {
                type: 'IntentRequest',
                requestId: 'amzn1.echo-api.request.test',
                timestamp: new Date().toISOString(),
                locale: 'en-US',
                intent: {
                    name: 'GetInventoryIntent',
                    confirmationStatus: 'NONE'
                }
            }
        };
        try {
            const intentResponse = yield axios_1.default.post(ALEXA_ENDPOINT, intentRequest);
            console.log('Intent Response Status:', intentResponse.status);
            console.log('Intent Speech:', intentResponse.data.response.outputSpeech.ssml);
        }
        catch (error) {
            console.error('Intent Request Failed:', error.message);
            if (error.code)
                console.error('Code:', error.code);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
    });
}
verifyAlexa();
