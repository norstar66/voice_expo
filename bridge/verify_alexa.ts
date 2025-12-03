import axios from 'axios';

const ALEXA_ENDPOINT = 'http://localhost:8787/alexa';

async function verifyAlexa() {
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
    const launchResponse = await axios.post(ALEXA_ENDPOINT, launchRequest);
    console.log('Launch Response Status:', launchResponse.status);
    console.log('Launch Speech:', launchResponse.data.response.outputSpeech.ssml);
  } catch (error: any) {
    console.error('Launch Request Failed:', error.message);
    if (error.code) console.error('Code:', error.code);
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
    const intentResponse = await axios.post(ALEXA_ENDPOINT, intentRequest);
    console.log('Intent Response Status:', intentResponse.status);
    console.log('Intent Speech:', intentResponse.data.response.outputSpeech.ssml);
  } catch (error: any) {
    console.error('Intent Request Failed:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verifyAlexa();
