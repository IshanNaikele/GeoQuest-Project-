 // Define question templates
 const questionTemplates = {
    "currency": [
        "Which currency is used in {country}?",
        "What is the official currency of {country}?",
        "In {country}, what currency do people use?",
        "The currency used in {country} is?",
        
        "Identify the currency of {country}.",
       
       
        "Name the currency of {country}."
         
    ],
    "capital": [
        "What is the capital of {country}?",
        "Which city serves as the capital of {country}?",
        "The capital city of {country} is?",
        "Identify the capital of {country}.",
         
        "Name the capital of {country}.",
        "Where is the capital of {country} located?",
     
        "What city represents the capital of {country}?"
        
    ],
    "continent": [
        "Which continent does {country} belong to?",
        "On which continent is {country} located?",
        "{country} is part of which continent?",
        "Identify the continent where {country} is situated.",
        "Which continent includes {country}?",
        "Name the continent that {country} belongs to.",
        "Where is {country} geographically located?",
        "On what continent can you find {country}?"
       
    ],
    "country": [
        "Which country has the capital {capital}?",
        "{capital} is the capital of which country?",
        "The country with {capital} as its capital is?",
        "Identify the country whose capital is {capital}.",
        "Which nation has {capital} as its capital city?",
        "Name the country that has {capital} as its capital.",
        "{capital} serves as the capital for which country?",
        "Which sovereign state has {capital} as its capital?",
        "To which country does the capital {capital} belong?"
    ]
};

let geographyData = [];
let quiz = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = -1;
let answeredCorrectly = false;

// Elements
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const introContainer = document.querySelector('.intro');
const loadingContainer = document.getElementById('loading');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const finalScoreElement = document.getElementById('final-score');
const maxScoreElement = document.getElementById('max-score');
const restartBtn = document.getElementById('restart-btn');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const currentScoreElement = document.getElementById('current-score');

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', showNextQuestion);
restartBtn.addEventListener('click', restartQuiz);

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('../Data/processed_data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        geographyData = await response.json();
        startBtn.disabled = false;
    } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('.intro').insertAdjacentHTML('beforeend', 
            `<div class="error-message">
                Error loading geography data. Please ensure "processed_data.json" file exists in the same directory as this HTML file.
            </div>`);
        startBtn.disabled = true;
    }
}

// Helper functions
function getUniqueOptions(data, column, correctAnswer, requiredOptionCount = 3) {
    const uniqueValues = [...new Set(data.map(item => item[column]))].filter(value => value !== correctAnswer);
    return uniqueValues.sort(() => 0.5 - Math.random()).slice(0, Math.min(uniqueValues.length, requiredOptionCount));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateQuiz(data, numQuestions = 10) {
    const quizQuestions = [];
    const selectedCountries = shuffleArray([...data]).slice(0, numQuestions);
    
    selectedCountries.forEach(countryData => {
        const country = countryData.Country;
        const capital = countryData.Capital;
        const continent = countryData.Continent;
        const currency = countryData.Currency;
        
        // Generate multiple-choice options
        const currencyOptions = [...getUniqueOptions(data, 'Currency', currency), currency];
        const countryOptions = [...getUniqueOptions(data, 'Country', country), country];
        const capitalOptions = [...getUniqueOptions(data, 'Capital', capital), capital];
        const continentOptions = [...getUniqueOptions(data, 'Continent', continent), continent];
        
        // Shuffle the options
        shuffleArray(currencyOptions);
        shuffleArray(capitalOptions);
        shuffleArray(continentOptions);
        shuffleArray(countryOptions);
        
        // Randomly choose one type of question for this country
        const questionTypes = Object.keys(questionTemplates);
        const chosenQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        // Randomly choose a template for the chosen question type
        const templates = questionTemplates[chosenQuestionType];
        const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        let question, options, correctAnswer;
        
        if (chosenQuestionType === "currency") {
            question = chosenTemplate.replace('{country}', country);
            options = currencyOptions;
            correctAnswer = currency;
        } else if (chosenQuestionType === "capital") {
            question = chosenTemplate.replace('{country}', country);
            options = capitalOptions;
            correctAnswer = capital;
        } else if (chosenQuestionType === "continent") {
            question = chosenTemplate.replace('{country}', country);
            options = continentOptions;
            correctAnswer = continent;
        } else if (chosenQuestionType === "country") {
            question = chosenTemplate.replace('{capital}', capital);
            options = countryOptions;
            correctAnswer = country;
        }
        
        quizQuestions.push({
            question,
            options,
            correctAnswer
        });
    });
    
    return quizQuestions.slice(0, numQuestions);
}

function displayQuestion() {
    const currentQuestion = quiz[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', selectOption);
        optionsContainer.appendChild(optionElement);
    });
    
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    totalQuestionsElement.textContent = quiz.length;
    
    nextBtn.style.display = 'none';
    selectedOptionIndex = -1;
    answeredCorrectly = false;
}

function selectOption(e) {
    if (selectedOptionIndex !== -1) return; // Already answered
    
    const optionIndex = parseInt(e.target.dataset.index);
    const currentQuestion = quiz[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    selectedOptionIndex = optionIndex;
    const selectedOption = currentQuestion.options[optionIndex];
    
    // Mark selected option
    options[optionIndex].classList.add('selected');
    
    // Check if answer is correct
    if (selectedOption === currentQuestion.correctAnswer) {
        options[optionIndex].classList.add('correct');
        score++;
        answeredCorrectly = true;
        currentScoreElement.textContent = score;
    } else {
        options[optionIndex].classList.add('incorrect');
        
        // Highlight correct answer
        options.forEach((option, index) => {
            if (currentQuestion.options[index] === currentQuestion.correctAnswer) {
                option.classList.add('correct');
            }
        });
    }
    
    // Disable all options
    options.forEach(option => {
        option.removeEventListener('click', selectOption);
        option.style.cursor = 'default';
    });
    
    nextBtn.style.display = 'inline-block';
}

function showNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quiz.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    finalScoreElement.textContent = score;
    maxScoreElement.textContent = quiz.length;
}

function startQuiz() {
    loadingContainer.style.display = 'block';
    introContainer.style.display = 'none';
    
    setTimeout(() => {
        quiz = generateQuiz(geographyData, 10);
        currentQuestionIndex = 0;
        score = 0;
        currentScoreElement.textContent = score;
        
        loadingContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        displayQuestion();
    }, 500); // Simulate loading
}

function restartQuiz() {
    resultContainer.style.display = 'none';
    startQuiz();
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadData);