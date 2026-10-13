export type Weight = 1 | 2 | 3; // 3 essential, 2 important, 1 optional
export type Diet = 'vegetarian' | 'vegan';
export type Category =
  | 'meat' | 'fish' | 'egg' | 'dairy' | 'veg' | 'fruit'
  | 'grain' | 'legume' | 'pantry' | 'herb';

export interface Ingredient {
  id: string;
  name: string;
  name_tr?: string;
  emoji: string;
  cat: Category;
  aliases?: string[];
  animal?: 'meat' | 'product';
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
  ingredients: [id: string, Weight][];
  steps: string[]; // data/index.ts drops recipes without steps
  tr?: {
    name?: string;
    steps?: string[];
  };
}
export type Meal = Recipe['meal'];
export const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export interface Substitution {
  from: string;
  to: string;
  compat: 'high' | 'medium' | 'low';
  note: string;
  note_tr?: string;
}

export type TabId = 'now' | 'almost' | 'diff';

export interface Evaluation {
  recipe: Recipe;
  owned: string[];
  missing: string[];
  swaps: Substitution[];
  blocking: string[];
  coverage: number;
  usedSoon: string[];
  tab: TabId;
  score: number;
  core: boolean;              // you own at least one required ingredient
}

export interface Context {
  maxTime?: number;
  meal?: Meal;
  diet?: Diet;
  useSoon?: Set<string>;      // ingredients to use first
  recent?: Set<string>;       // recently cooked recipe ids
}