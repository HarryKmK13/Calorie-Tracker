import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

// Foods that have different calorie values based on condition
const conditionBasedFoods: Record<string, string[]> = {
  chicken: ["With Skin", "skinless", "Boneless", "With Bone"],
  rice: ["White Rice", "Brown Rice", "Basmati Rice"],
  milk: ["Whole Milk", "Skim Milk", "Almond Milk", "Soy Milk"],
  bread: ["White Bread", "Whole Wheat", "Multigrain"],
  fish: ["Salmon", "Tuna", "Tilapia", "Cod"],
  beef: ["Lean", "Fatty", "Ground Beef"],
  cheese: ["Cheddar", "Mozzarella", "Parmesan", "Feta"],
};


export default function App() {
    const [ingredient, setIngredient] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('grams'); // Default unit
    const [foodCondition, setFoodCondition] = useState(''); // Stores selected condition
    const [nutritionData, setNutritionData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to format the query
    const formatQuery = () => {
      let formattedIngredient = ingredient.toLowerCase();
      
      // Make sure ingredient is formatted correctly (e.g., "Chicken Thigh Skinless")
      if (conditionBasedFoods[formattedIngredient] && foodCondition) {
          formattedIngredient = `${formattedIngredient} ${foodCondition.toLowerCase()}`;
      }
  
      console.log("API Query:", `${quantity} ${unit} of ${formattedIngredient}`);
      return `${quantity} ${unit} of ${formattedIngredient}`;
  };
  
  

    // 🔹 Dynamic calorie adjustments for all foods
const adjustCalories = (ingredient: string, condition: string, calories: number) => {
  const adjustments: Record<string, Record<string, number>> = {
      chicken: { "With Skin": 1.2, "Skinless": 0.85, "Boneless": 0.9, "With Bone": 0.85 },
      rice: { "White Rice": 1.0, "Brown Rice": 0.9, "Basmati Rice": 1.1 },
      milk: { "Whole Milk": 1.0, "Skim Milk": 0.75, "Almond Milk": 0.5, "Soy Milk": 0.6 },
      bread: { "White Bread": 1.0, "Whole Wheat": 0.9, "Multigrain": 0.95 },
      fish: { "Salmon": 1.2, "Tuna": 1.0, "Tilapia": 0.85, "Cod": 0.8 },
      beef: { "Lean": 0.9, "Fatty": 1.2, "Ground Beef": 1.1 },
      cheese: { "Cheddar": 1.1, "Mozzarella": 1.0, "Parmesan": 1.3, "Feta": 0.9 },
  };

  if (adjustments[ingredient.toLowerCase()] && adjustments[ingredient.toLowerCase()][condition]) {
      return calories * adjustments[ingredient.toLowerCase()][condition];
  }

  return calories; // Return unchanged if no adjustment found
};

const fetchNutrition = async () => {
  if (!ingredient || !quantity) {
      setError('Please enter an ingredient and quantity.');
      return;
  }

  setLoading(true);
  setError(null);

  try {
      const response = await axios.post('http://localhost:8002/get-nutrition', { ingredient: formatQuery() });

      if (response.data.foods.length === 0) {
          setError('No nutrition data found for this condition.');
          setLoading(false);
          return;
      }

      let nutrition = response.data.foods[0];

      // 🔹 Apply adjustments dynamically
      if (conditionBasedFoods[ingredient.toLowerCase()] && foodCondition) {
          nutrition.nf_calories = adjustCalories(ingredient, foodCondition, nutrition.nf_calories);
      }

      console.log("Final Calories:", nutrition.nf_calories);
      setNutritionData(nutrition);

  } catch (err) {
      setError('Failed to fetch data. Please try again.');
  } finally {
      setLoading(false);
  }
};

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calorie Deficit Tracker</Text>

            <IngredientInput ingredient={ingredient} setIngredient={setIngredient} />
            <QuantityInput quantity={quantity} setQuantity={setQuantity} />
            <UnitPicker unit={unit} setUnit={setUnit} />

            {/* Condition Picker: Only show if the ingredient has different types */}
            {conditionBasedFoods[ingredient.toLowerCase()] && (
                <ConditionPicker
                    conditions={conditionBasedFoods[ingredient.toLowerCase()]}
                    foodCondition={foodCondition}
                    setFoodCondition={setFoodCondition}
                />
            )}

            <Button title="Check Nutrition" onPress={fetchNutrition} />

            {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 10 }} />}
            {error && <Text style={styles.error}>{error}</Text>}
            {nutritionData && <NutritionInfo nutritionData={nutritionData} />}
        </View>
    );
}

// Function Component for Ingredient Input
const IngredientInput: React.FC<{ ingredient: string; setIngredient: (text: string) => void }> = ({ ingredient, setIngredient }) => (
    <TextInput
        placeholder="Enter an ingredient (e.g., egg, chicken, rice)"
        value={ingredient}
        onChangeText={setIngredient}
        style={styles.input}
    />
);

// Function Component for Quantity Input
const QuantityInput: React.FC<{ quantity: string; setQuantity: (text: string) => void }> = ({ quantity, setQuantity }) => (

    <TextInput
        placeholder="Quantity (e.g., 100)"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
    />
);

// Function Component for Unit Picker
const UnitPicker: React.FC<{ unit: string; setUnit: (unit: string) => void }> = ({ unit, setUnit }) =>(
    <Picker selectedValue={unit} onValueChange={(itemValue) => setUnit(itemValue)} style={styles.picker}>
        <Picker.Item label="Grams" value="grams" />
        <Picker.Item label="Milliliters" value="ml" />
        <Picker.Item label="Pounds" value="lbs" />
        <Picker.Item label="Liters" value="l" />
    </Picker>
);

// Function Component for Food Condition Picker
const ConditionPicker: React.FC<{ conditions: string[]; foodCondition: string; setFoodCondition: (condition: string) => void }> = ({ conditions, foodCondition, setFoodCondition }) => (

    <View>
        <Text style={styles.label}>Select Type:</Text>
        <Picker selectedValue={foodCondition} onValueChange={(itemValue) => setFoodCondition(itemValue)} style={styles.picker}>
            {conditions.map((condition, index) => (
                <Picker.Item key={index} label={condition} value={condition} />
            ))}
        </Picker>
    </View>
);

// Function Component for Displaying Nutrition Data
const NutritionInfo: React.FC<{ nutritionData: any }> = ({ nutritionData }) => (
    <ScrollView style={styles.resultContainer}>
        <Text style={styles.foodName}>{nutritionData.food_name}</Text>
        <Image source={{ uri: nutritionData.photo.highres }} style={styles.image} />
        <Text style={styles.text}>Calories: {nutritionData.nf_calories} kcal</Text>
        <Text style={styles.text}>Fat: {nutritionData.nf_total_fat} g</Text>
        <Text style={styles.text}>Protein: {nutritionData.nf_protein} g</Text>
        <Text style={styles.text}>Cholesterol: {nutritionData.nf_cholesterol} mg</Text>
        <Text style={styles.text}>Carbohydrates: {nutritionData.nf_total_carbohydrate} g</Text>
    </ScrollView>
);

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333333',
    },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
        color: '#000000',
    },
    picker: {
        height: 50,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    resultContainer: {
        marginTop: 20,
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 5,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    image: {
        width: 100,
        height: 100,
        marginTop: 10,
        alignSelf: 'center',
    },
    text: {
        fontSize: 16,
        color: '#333333',
    },
});
