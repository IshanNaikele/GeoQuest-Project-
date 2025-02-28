import pandas as pd
import numpy as np
import random

df = pd.read_csv(r'Data/processed_data.csv', encoding='latin-1')

def get_unique_option(df, column, correct_answer, required_option=3):
    unique_values = set(df[column].unique()) - {correct_answer}
    return random.sample(list(unique_values), min(len(unique_values), required_option))

def generate_quiz(df, num_question=10):
    quiz_questions = []
    selected_countries = df.sample(num_question)  # Select random countries
    
    # Define possible question types and their templates
    question_templates = {
        "currency": [
            f"Which currency is used in {{country}}?",
            f"What is the official currency of {{country}}?",
            f"In {{country}}, what currency do people use?",
            f"The currency used in {{country}} is?",
            f"Which monetary unit is used in {{country}}?",
            f"Identify the currency of {{country}}.",
            f"What do people in {{country}} use to pay for goods?",
            f"Which currency circulates in {{country}}?",
            f"Name the currency of {{country}}.",
            f"What is the legal tender in {{country}}?"
        ],
        "capital": [
            f"What is the capital of {{country}}?",
            f"Which city serves as the capital of {{country}}?",
            f"The capital city of {{country}} is?",
            f"Identify the capital of {{country}}.",
            f"Which city is the administrative center of {{country}}?",
            f"Name the capital of {{country}}.",
            f"Where is the capital of {{country}} located?",
            f"The seat of government in {{country}} is?",
            f"What city represents the capital of {{country}}?",
            f"Which city is considered the heart of {{country}}?"
        ],
        "continent": [
            f"Which continent does {{country}} belong to?",
            f"On which continent is {{country}} located?",
            f"{{country}} is part of which continent?",
            f"Identify the continent where {{country}} is situated.",
            f"Which continent includes {{country}}?",
            f"Name the continent that {{country}} belongs to.",
            f"Where is {{country}} geographically located?",
            f"On what continent can you find {{country}}?",
            f"Which landmass is {{country}} a part of?",
            f"To which continent does {{country}} pertain?"
        ],
        "country": [
            f"Which country has the capital {{capital}}?",
            f"{{capital}} is the capital of which country?",
            f"The country with {{capital}} as its capital is?",
            f"Identify the country whose capital is {{capital}}.",
            f"Which nation has {{capital}} as its capital city?",
            f"Name the country that has {{capital}} as its capital.",
            f"{{capital}} serves as the capital for which country?",
            f"Which sovereign state has {{capital}} as its capital?",
            f"To which country does the capital {{capital}} belong?",
            f"{{capital}} is the administrative center of which country?"
        ]
    }

    for index, row in selected_countries.iterrows():
        country = row['Country']
        capital = row['Capital']
        continent = row['Continent']
        currency = row['Currency']

        # Generate multiple-choice options
        currency_option = get_unique_option(df, 'Currency', currency) + [currency]
        country_option = get_unique_option(df, 'Country', country) + [country]
        capital_option = get_unique_option(df, 'Capital', capital) + [capital]
        continent_option = get_unique_option(df, 'Continent', continent) + [continent]

        # Shuffle the options
        random.shuffle(currency_option)
        random.shuffle(capital_option)
        random.shuffle(continent_option)
        random.shuffle(country_option)

        # Randomly choose one type of question for this country
        chosen_question_type = random.choice(list(question_templates.keys()))

        # Randomly choose a template for the chosen question type
        chosen_template = random.choice(question_templates[chosen_question_type])

        if chosen_question_type == "currency":
            question = chosen_template.format(country=country)
            quiz_questions.append({
                'question': question,
                'options': currency_option,
                'correct_answer': currency
            })
        elif chosen_question_type == "capital":
            question = chosen_template.format(country=country)
            quiz_questions.append({
                'question': question,
                'options': capital_option,
                'correct_answer': capital
            })
        elif chosen_question_type == "continent":
            question = chosen_template.format(country=country)
            quiz_questions.append({
                'question': question,
                'options': continent_option,
                'correct_answer': continent
            })
        elif chosen_question_type == "country":
            question = chosen_template.format(capital=capital)
            quiz_questions.append({
                'question': question,
                'options': country_option,
                'correct_answer': country
            })

        # Stop when we have enough questions
        if len(quiz_questions) >= num_question:
            break

    return quiz_questions[:num_question]  # Ensure exactly 10 questions

# Generate quiz
quiz = generate_quiz(df, 10)

# Display quiz
for i, q in enumerate(quiz):
    print(f"\nQ{i+1}: {q['question']}")
    for j, option in enumerate(q['options']):
        print(f"  {chr(65+j)}) {option}")
    print(f"✅ Correct Answer: {q['correct_answer']}")  # Remove this line to hide answers