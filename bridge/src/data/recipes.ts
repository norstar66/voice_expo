interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export const RECIPES: Record<string, RecipeItem[]> = {
  // Pizza
  'Margherita Pizza': [
    { ingredientId: 'dough', quantity: 1 },
    { ingredientId: 'sauce_tomato', quantity: 0.2 }
  ],
  'Mushroom Pizza': [
    { ingredientId: 'dough', quantity: 1 },
    { ingredientId: 'sauce_white', quantity: 0.2 },
    { ingredientId: 'mushrooms', quantity: 0.2 }
  ],
  'Carne Pizza': [
    { ingredientId: 'dough', quantity: 1 },
    { ingredientId: 'sauce_tomato', quantity: 0.2 }
  ],

  // Starters
  'Whipped Feta': [
    { ingredientId: 'whip_feta', quantity: 0.3 }
  ],
  'Polpette': [
    { ingredientId: 'meatballs', quantity: 3 },
    { ingredientId: 'sauce_tomato', quantity: 0.2 }
  ],
  'Sautéed Garlic Shrimp': [
    { ingredientId: 'shrimp', quantity: 0.5 }
  ],
  'Crispy Calamari': [
    { ingredientId: 'calamari', quantity: 0.5 }
  ],

  // Mains
  'Chicken Parmesan': [
    { ingredientId: 'breaded_chx', quantity: 1 },
    { ingredientId: 'sauce_tomato', quantity: 0.3 }
  ],
  'Veal Parmesan': [
    { ingredientId: 'breaded_veal', quantity: 1 },
    { ingredientId: 'sauce_tomato', quantity: 0.3 }
  ],
  'Salmon': [
    { ingredientId: 'salmon', quantity: 1 }
  ],
  'Filet Mignon': [
    { ingredientId: 'filet', quantity: 1 }
  ],
  'Grilled Pork Chop': [
    { ingredientId: 'pork_chop', quantity: 1 }
  ],
  'Spaghetti & Meatballs': [
    { ingredientId: 'meatballs', quantity: 3 },
    { ingredientId: 'sauce_tomato', quantity: 0.3 }
  ]
};
