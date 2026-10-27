export const predictBMI = (weight: number, height: number): { bmi: number, category: string, risk: string } => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  let risk = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    risk = 'Moderate';
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normal';
    risk = 'Low';
  } else if (bmi >= 25 && bmi <= 29.9) {
    category = 'Overweight';
    risk = 'Moderate';
  } else if (bmi >= 30 && bmi <= 34.9) {
    category = 'Obesity (Class I)';
    risk = 'High';
  } else if (bmi >= 35 && bmi <= 39.9) {
    category = 'Obesity (Class II)';
    risk = 'Very High';
  } else {
    category = 'Extreme Obesity (Class III)';
    risk = 'Extremely High';
  }

  return { bmi: parseFloat(bmi.toFixed(1)), category, risk };
};

export const predictSleepQuality = (duration: number, deepSleepHours: number, remSleepHours: number): string => {
  const totalIdeal = 8;
  const idealDeep = totalIdeal * 0.20; // 20% of sleep
  const idealRem = totalIdeal * 0.25;  // 25% of sleep
  
  let score = 0;
  
  if (duration >= 7 && duration <= 9) score += 40;
  else if (duration >= 6 && duration < 7) score += 20;
  
  if (deepSleepHours >= idealDeep) score += 30;
  else if (deepSleepHours >= idealDeep * 0.7) score += 15;
  
  if (remSleepHours >= idealRem) score += 30;
  else if (remSleepHours >= idealRem * 0.7) score += 15;
  
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
};
