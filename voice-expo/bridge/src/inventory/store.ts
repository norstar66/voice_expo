import { InventoryState, InventoryAction, InventoryView, Ingredient, IngredientType } from './types';
import { RECIPES } from '../data/recipes';
import { INGREDIENTS } from '../data/ingredients';
import { v4 as uuidv4 } from 'uuid';

class InventoryStore {
  private state: Map<string, InventoryState> = new Map();
  private ingredients: Map<string, Ingredient> = new Map();

  constructor() {
    // Initialize state for all ingredients
    INGREDIENTS.forEach(ing => {
      this.ingredients.set(ing.id, ing);
      this.state.set(ing.id, {
        ingredientId: ing.id,
        sold: 0,
        waste: 0,
        prepped: 0
      });
    });
  }

  getAll(): InventoryView[] {
    return Array.from(this.state.values()).map(state => {
      const ingredient = this.ingredients.get(state.ingredientId);
      return {
        ...state,
        name: ingredient?.name || 'Unknown',
        type: ingredient?.type || 'PREP',
        unit: ingredient?.unit || 'units'
      };
    });
  }

  addIngredient(name: string, unit: string, type: IngredientType): InventoryView {
    const id = uuidv4();
    const newIngredient: Ingredient = { id, name, unit, type };
    
    this.ingredients.set(id, newIngredient);
    this.state.set(id, {
      ingredientId: id,
      sold: 0,
      waste: 0,
      prepped: 0
    });

    return {
      ingredientId: id,
      sold: 0,
      waste: 0,
      prepped: 0,
      name,
      unit,
      type
    };
  }

  recordSale(menuItemName: string) {
    const recipe = RECIPES[menuItemName];
    if (!recipe) return;

    recipe.forEach(item => {
      const currentState = this.state.get(item.ingredientId);
      if (currentState) {
        currentState.sold += item.quantity;
      }
    });
  }

  recordAction(action: InventoryAction) {
    const currentState = this.state.get(action.ingredientId);
    if (!currentState) return;

    if (action.type === 'WASTE') {
      currentState.waste += action.amount;
    } else if (action.type === 'PREP' || action.type === 'ORDER') {
      currentState.prepped += action.amount;
    }
  }
}

export const inventoryStore = new InventoryStore();
