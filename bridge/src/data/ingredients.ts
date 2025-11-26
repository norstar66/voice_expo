import { Ingredient } from '../inventory/types';

export const INGREDIENTS: Ingredient[] = [
  // Prep Items
  { id: 'dough', name: 'Pizza Dough', type: 'PREP', unit: 'dough balls' },
  { id: 'sauce_tomato', name: 'Tomato Sauce', type: 'PREP', unit: 'qts' },
  { id: 'sauce_white', name: 'White Sauce', type: 'PREP', unit: 'qts' },
  { id: 'whip_feta', name: 'Whipped Feta', type: 'PREP', unit: 'qts' },
  { id: 'meatballs', name: 'Meatballs', type: 'PREP', unit: 'units' },
  { id: 'breaded_chx', name: 'Breaded Chicken', type: 'PREP', unit: 'units' },
  { id: 'breaded_veal', name: 'Breaded Veal', type: 'PREP', unit: 'units' },
  
  // Order Items (Raw ingredients)
  { id: 'shrimp', name: 'Shrimp', type: 'ORDER', unit: 'lbs' },
  { id: 'calamari', name: 'Calamari', type: 'ORDER', unit: 'lbs' },
  { id: 'salmon', name: 'Salmon', type: 'ORDER', unit: 'fillets' },
  { id: 'filet', name: 'Filet Mignon', type: 'ORDER', unit: 'steaks' },
  { id: 'pork_chop', name: 'Pork Chop', type: 'ORDER', unit: 'chops' },
  { id: 'mushrooms', name: 'Mushrooms', type: 'ORDER', unit: 'lbs' },
  { id: 'spinach', name: 'Spinach', type: 'ORDER', unit: 'bags' },
  { id: 'romaine', name: 'Romaine', type: 'ORDER', unit: 'heads' },
];
