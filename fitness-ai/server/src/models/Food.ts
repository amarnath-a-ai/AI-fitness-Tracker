import mongoose, { Document, Schema } from 'mongoose';

export interface IFood extends Document {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  servingWeight: number;
  mealType: string[];
  cuisine: string;
  dietType: string[];
  image: string;
  barcode: string;
  isVerified: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const foodSchema = new Schema<IFood>(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'fruits', 'vegetables', 'grains', 'protein', 'dairy',
        'snacks', 'beverages', 'fast_food', 'indian', 'chinese',
        'italian', 'mexican', 'desserts', 'breakfast', 'supplements',
        'seafood', 'drinks', 'meat', 'poultry'
      ],
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
    sodium: {
      type: Number,
      default: 0,
    },
    servingSize: {
      type: String,
      default: '100g',
    },
    servingWeight: {
      type: Number,
      default: 100,
    },
    mealType: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    }],
    cuisine: {
      type: String,
      default: 'general',
    },
    dietType: [{
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'vegan', 'keto', 'high_protein', 'low_carb', 'gluten_free'],
    }],
    image: {
      type: String,
      default: '',
    },
    barcode: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
foodSchema.index({ name: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ calories: 1 });
foodSchema.index({ dietType: 1 });

export const Food = mongoose.model<IFood>('Food', foodSchema);
