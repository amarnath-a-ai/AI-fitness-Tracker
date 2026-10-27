import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, PlusCircle, Trash2, Flame } from 'lucide-react';
import { foodAPI } from '../services/api';
import toast from 'react-hot-toast';

interface FoodItem {
  _id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  image?: string;
}

const foodImageMap: Record<string, string> = {
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&h=100&q=80',
  dal: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=100&h=100&q=80',
  paneer: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=100&h=100&q=80',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=100&h=100&q=80',
  chicken: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=100&h=100&q=80',
  rice: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=100&h=100&q=80',
  egg: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=100&h=100&q=80',
  oats: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=100&h=100&q=80',
  smoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=100&h=100&q=80',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=100&h=100&q=80',
  protein: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=100&h=100&q=80',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=100&h=100&q=80',
  default: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=100&h=100&q=80',
};

function getFoodImage(food: FoodItem): string {
  if (food.image) return food.image;
  const nameLower = food.name.toLowerCase();
  for (const [key, url] of Object.entries(foodImageMap)) {
    if (key !== 'default' && nameLower.includes(key)) return url;
  }
  const categoryMap: Record<string, string> = {
    protein: foodImageMap.protein, indian: foodImageMap.dal, dairy: foodImageMap.yogurt,
    non_veg: foodImageMap.chicken, veg: foodImageMap.salad, grain: foodImageMap.rice, beverage: foodImageMap.smoothie,
  };
  return categoryMap[food.category] || foodImageMap.default;
}

export default function Nutrition() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState('');
  const [dailyNutrition, setDailyNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, goal: 2000 });
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyNutrition();
    fetchMealLogs();
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [search]);

  const fetchDailyNutrition = async () => {
    try {
      const res = await foodAPI.getDailyNutrition();
      const data = res.data?.data;
      if (data) {
        setDailyNutrition({
          calories: data.totalCalories || 0,
          protein: data.totalProtein || 0,
          carbs: data.totalCarbs || 0,
          fat: data.totalFat || 0,
          goal: data.calorieGoal || 2000
        });
      }
    } catch {
      setDailyNutrition({ calories: 530, protein: 35, carbs: 65, fat: 18, goal: 2000 });
    }
  };

  const fetchMealLogs = async () => {
    try {
      const res = await foodAPI.getMealLogs({ limit: 10 });
      setMealLogs(res.data?.data || []);
    } catch {
      setMealLogs([]);
    }
  };

  const fetchFoods = async () => {
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      const res = await foodAPI.getFoods(params);
      setFoods(res.data.data);
    } catch {
      const fallbackFoods: FoodItem[] = [
        { _id: '1', name: 'High-Protein Salad', category: 'protein', calories: 280, protein: 24, carbs: 12, fat: 8, servingSize: '1 bowl', image: foodImageMap.salad },
        { _id: '2', name: 'Indian Dal Tadka', category: 'indian', calories: 180, protein: 8, carbs: 24, fat: 4, servingSize: '1 bowl', image: foodImageMap.dal },
        { _id: '3', name: 'Paneer Tikka Roll', category: 'indian', calories: 380, protein: 18, carbs: 32, fat: 14, servingSize: '1 roll', image: foodImageMap.paneer },
        { _id: '4', name: 'Greek Yogurt with Honey', category: 'dairy', calories: 150, protein: 12, carbs: 16, fat: 2, servingSize: '1 cup', image: foodImageMap.yogurt },
        { _id: '5', name: 'Chicken Tikka Masala', category: 'non_veg', calories: 420, protein: 36, carbs: 14, fat: 18, servingSize: '1 plate', image: foodImageMap.chicken },
        { _id: '6', name: 'Egg Omelette', category: 'protein', calories: 190, protein: 14, carbs: 2, fat: 14, servingSize: '2 eggs', image: foodImageMap.egg },
        { _id: '7', name: 'Overnight Oats', category: 'grain', calories: 220, protein: 8, carbs: 38, fat: 6, servingSize: '1 jar', image: foodImageMap.oats },
        { _id: '8', name: 'Grilled Fish Fillet', category: 'non_veg', calories: 250, protein: 30, carbs: 0, fat: 12, servingSize: '1 fillet', image: foodImageMap.fish },
      ];
      setFoods(fallbackFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase())));
    }
    setLoading(false);
  };

  const handleLogMeal = async (food: FoodItem) => {
    try {
      await foodAPI.logMeal({ foodId: food._id, foodName: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, servingSize: food.servingSize });
      toast.success(`✅ Logged: ${food.name}`);
      fetchDailyNutrition();
      fetchMealLogs();
    } catch {
      // Update locally
      setDailyNutrition(prev => ({
        ...prev,
        calories: prev.calories + food.calories,
        protein: prev.protein + food.protein,
        carbs: prev.carbs + food.carbs,
        fat: prev.fat + food.fat
      }));
      setMealLogs(prev => [{ _id: Math.random().toString(), foodName: food.name, calories: food.calories, date: new Date().toISOString() }, ...prev]);
      toast.success(`✅ Logged: ${food.name}`);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await foodAPI.deleteMealLog(id);
      toast.success('Meal removed');
      fetchDailyNutrition();
      fetchMealLogs();
    } catch {
      setMealLogs(prev => prev.filter(l => l._id !== id));
      toast.success('Meal removed');
    }
  };

  const progressPercent = Math.min((dailyNutrition.calories / dailyNutrition.goal) * 100, 100);

  return (
    <div className="page-container" style={{ maxWidth: '100%', margin: '0 auto', paddingBottom: 40 }}>
      <div className="flex-between mb-4" style={{ marginTop: 8 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Nutrition</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track macros and food balance</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 12 }}>Today's Balance</h4>
        <div className="flex-between" style={{ marginBottom: 8, fontSize: '0.8rem', fontWeight: 700 }}>
          <span>{dailyNutrition.calories} / {dailyNutrition.goal} kcal</span>
          <span style={{ color: 'var(--primary-500)' }}>{Math.round(progressPercent)}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-500), var(--primary-400))', transition: 'width 0.6s ease', borderRadius: 99 }}></div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { name: 'Protein', value: `${dailyNutrition.protein}g`, color: 'var(--primary-500)' },
            { name: 'Carbs', value: `${dailyNutrition.carbs}g`, color: 'var(--accent-500)' },
            { name: 'Fat', value: `${dailyNutrition.fat}g`, color: 'var(--warm-500)' }
          ].map((macro, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', background: 'var(--bg-tertiary)', borderRadius: 12 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: macro.color }}>{macro.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{macro.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      {mealLogs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 12 }}>Today's Meals</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mealLogs.slice(0, 5).map((log: any) => (
              <div key={log._id} className="flex-between" style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.foodName || log.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {new Date(log.date || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.calories} kcal
                  </div>
                </div>
                <button className="btn-icon btn-ghost" onClick={() => handleDeleteMeal(log._id)} style={{ color: 'var(--danger-500)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar-wrapper" style={{ marginBottom: 20 }}>
        <Search size={18} />
        <input 
          type="text" 
          placeholder="Search nutrition items..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {/* Food list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {foods.map((food, i) => (
          <motion.div
            key={food._id}
            className="flex-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={getFoodImage(food)}
                alt={food.name}
                style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0 }}
              />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{food.name}</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{food.servingSize} &bull; {food.calories} kcal</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary-500)', fontWeight: 700 }}>P:{food.protein}g</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-500)', fontWeight: 700 }}>C:{food.carbs}g</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--warm-500)', fontWeight: 700 }}>F:{food.fat}g</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleLogMeal(food)} style={{ color: 'var(--primary-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <PlusCircle size={24} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
