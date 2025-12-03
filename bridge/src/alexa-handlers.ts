import { HandlerInput, RequestHandler, SkillBuilders, ErrorHandler } from 'ask-sdk-core';
import { Response, SessionEndedRequest } from 'ask-sdk-model';
import { inventoryStore } from './inventory/store';

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = 'Welcome to Victor\'s Toast. You can ask me about the inventory or add items to the prep list.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Victor\'s Toast', speechText)
      .getResponse();
  }
};

const GetInventoryIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetInventoryIntent';
  },
  handle(handlerInput: HandlerInput): Response {
    const inventory = inventoryStore.getAll();
    // Filter for items that might need attention (e.g., low stock or just list a few)
    // For now, let's just list the first 3 items as a summary.
    const summary = inventory.slice(0, 3).map(i => `${i.name}: ${i.prepped} prepped`).join(', ');
    
    const speechText = `Here is a quick inventory check: ${summary}. You can ask for more details or add items.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Inventory Check', speechText)
      .getResponse();
  }
};

const AddItemIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddItemIntent';
  },
  handle(handlerInput: HandlerInput): Response {
    const request = handlerInput.requestEnvelope.request;
    let speechText = 'I didn\'t catch the item name.';

    if (request.type === 'IntentRequest' && request.intent.slots) {
      const itemSlot = request.intent.slots['Item'];
      const quantitySlot = request.intent.slots['Quantity'];
      
      if (itemSlot && itemSlot.value) {
        const itemName = itemSlot.value;
        const quantity = quantitySlot && quantitySlot.value ? parseInt(quantitySlot.value) : 1;
        
        // In a real app, we'd match this to an existing ID or create a new one intelligently.
        // For this prototype, we'll just add it as a "PREP" action if it exists, or add a new ingredient.
        // Let's assume we are adding to the "PREP" count for simplicity of the voice command "Add 5 tomatoes".
        
        // Check if ingredient exists by name (simple fuzzy match or exact match)
        const allItems = inventoryStore.getAll();
        const existingItem = allItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());

        if (existingItem) {
            inventoryStore.recordAction({
                ingredientId: existingItem.ingredientId,
                type: 'PREP',
                amount: quantity
            });
            speechText = `Added ${quantity} ${itemName} to the prep list.`;
        } else {
            // Create new
            inventoryStore.addIngredient(itemName, 'units', 'PREP');
             // We also want to record the initial prep amount? Or just existence?
             // Let's just say we added it to the system.
            speechText = `I've added ${itemName} to the inventory system.`;
        }
      }
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Add Item', speechText)
      .getResponse();
  }
};

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = 'You can ask me to check inventory or add items. For example, say "Add 5 tomatoes".';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Help', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Goodbye', speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput: HandlerInput): Response {
    console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler: ErrorHandler = {
  canHandle(handlerInput: HandlerInput, error: Error): boolean {
    return true;
  },
  handle(handlerInput: HandlerInput, error: Error): Response {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say it again.')
      .reprompt('Sorry, I can\'t understand the command. Please say it again.')
      .getResponse();
  }
};

export const skill = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetInventoryIntentHandler,
    AddItemIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create();
