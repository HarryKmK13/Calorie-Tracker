import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, Image, StyleSheet } from 'react-native';
import axios from 'axios';

export default function App() {
    const [ingredient, setIngredient] = useState('');
    const [nutritionData, setNutritionData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNutrition = async () => {
        if (!ingredient) {
            setError('Please enter an ingredient.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8002/get-nutrition', { ingredient });
            setNutritionData(response.data.foods[0]);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calorie Deficit Tracker</Text>
            <TextInput
                placeholder="Enter an ingredient (e.g., 1 egg)"
                value={ingredient}
                onChangeText={setIngredient}
                style={styles.input}
            />
            <Button title="Check Nutrition" onPress={fetchNutrition} />

            {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 10 }} />}

            {error && <Text style={styles.error}>{error}</Text>}

            {nutritionData && (
                <ScrollView style={styles.resultContainer}>
                    <Text style={styles.foodName}>{nutritionData.food_name}</Text>
                    <Image source={{ uri: nutritionData.photo.highres }} style={styles.image} />
                    <Text style={styles.text}>Calories: {nutritionData.nf_calories} kcal</Text>
                    <Text style={styles.text}>Fat: {nutritionData.nf_total_fat} g</Text>
                    <Text style={styles.text}>Protein: {nutritionData.nf_protein} g</Text>
                    <Text style={styles.text}>Cholesterol: {nutritionData.nf_cholesterol} mg</Text>
                    <Text style={styles.text}>Carbohydrates: {nutritionData.nf_total_carbohydrate} g</Text>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    resultContainer: {
        marginTop: 20,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
    text: {
        fontSize: 16,
    },
});
