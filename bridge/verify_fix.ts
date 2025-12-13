import { MENU_ITEMS } from './src/data/menu';

try {
  console.log('Successfully imported MENU_ITEMS. First item:', MENU_ITEMS[0]);
  console.log('Total items:', MENU_ITEMS.length);
} catch (error) {
  console.error('Failed to access MENU_ITEMS:', error);
  process.exit(1);
}
