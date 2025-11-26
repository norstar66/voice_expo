export type IngredientType = 'PREP' | 'ORDER';

export interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  unit: string;
}

export interface InventoryState {
  ingredientId: string;
  sold: number;
  waste: number;
  prepped: number; // or ordered, depending on type
}

export interface InventoryAction {
  ingredientId: string;
  amount: number;
  type: 'WASTE' | 'PREP' | 'ORDER';
}

export interface InventoryView extends InventoryState {
  name: string;
  type: IngredientType;
  unit: string;
}
