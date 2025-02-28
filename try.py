import pandas as pd
import random

df = pd.read_csv(r'D:\Ishan\GeoQuest-Project-\Data\new_countries_data.csv', encoding='latin-1')

# Drop rows with missing values in important columns
df = df.dropna(subset=['Country', 'Currency', 'Continent', 'Capital'])

# Function to generate unique incorrect options
def get_unique_options(df, column, correct_answer, num_options=3):
    unique_values = set(df[column].unique()) - {correct_answer}  # Remove correct answer
    return random.sample(list(unique_values), min(len(unique_values), num_options))  # Get unique wrong options

# Function to generate quiz questions
def generate_quiz(df, num_questions=10):
    quiz_questions = []
    selected_countries = df.sample(n=num_questions)

    for index, row in selected_countries.iterrows():
        country = row['Country']
        currency = row['Currency']
        continent = row['Continent']
        capital = row['Capital']

        # Get unique wrong options + correct answer
        currency_options = get_unique_options(df, 'Currency', currency) + [currency]
        continent_options = get_unique_options(df, 'Continent', continent) + [continent]
        capital_options = get_unique_options(df, 'Capital', capital) + [capital]
        country_options = get_unique_options(df, 'Country', country) + [country]
        # Shuffle the choices
        random.shuffle(currency_options)
        random.shuffle(continent_options)
        random.shuffle(capital_options)

        # Add questions to the quiz list
        quiz_questions.append({
            "question": f"Which currency is used in {country}?",
            "options": currency_options,
            "answer": currency
        })
        quiz_questions.append({
            "question": f"What is the capital of {country}?",
            "options": capital_options,
            "answer": capital
        })
        quiz_questions.append({
            "question": f"Which continent does {country} belong to?",
            "options": continent_options,
            "answer": continent
        })
        quiz_questions.append({
            "question": f"Which country has the capital {capital}?",
            "options": country_options,
            "answer": country
        })
        quiz_questions.append({
            "question": f"Which country uses the currency {currency}?",
            "options": country_options,
            "answer": country
        })
        quiz_questions.append({
            "question": f"Which continent has the country {country}?",
            "options": continent_options,
            "answer": continent
        })
     

    return quiz_questions[:num_questions]  # Return only required number of questions

# Generate quiz
quiz = generate_quiz(df, 10)

# Display quiz
for i, q in enumerate(quiz):
    print(f"\nQ{i+1}: {q['question']}")
    for j, option in enumerate(q['options']):
        print(f"  {chr(65+j)}) {option}")
    print(f"✅ Correct Answer: {q['answer']}")  # Remove this line to hide answers
