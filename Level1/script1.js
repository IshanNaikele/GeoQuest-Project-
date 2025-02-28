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
const voiceBtn = document.getElementById('voice-btn');
const voiceStatus = document.getElementById('voice-status');
const dataStatus = document.getElementById('data-status');

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', showNextQuestion);
restartBtn.addEventListener('click', restartQuiz);

// Sample data (for testing without JSON file)
const sampleData = [
    {
        "Country": "United States",
        "Capital": "Washington D.C.",
        "Continent": "North America",
        "Currency": "US Dollar"
    },
    {
        "Country": "France",
        "Capital": "Paris",
        "Continent": "Europe",
        "Currency": "Euro"
    },
    {
        "Country": "Japan",
        "Capital": "Tokyo",
        "Continent": "Asia",
        "Currency": "Yen"
    },
    {
        "Country": "Australia",
        "Capital": "Canberra",
        "Continent": "Oceania",
        "Currency": "Australian Dollar"
    },
    {
        "Country": "Brazil",
        "Capital": "Brasília",
        "Continent": "South America",
        "Currency": "Real"
    },
    {
        "Country": "Egypt",
        "Capital": "Cairo",
        "Continent": "Africa",
        "Currency": "Egyptian Pound"
    },
    {
        "Country": "India",
        "Capital": "New Delhi",
        "Continent": "Asia",
        "Currency": "Indian Rupee"
    },
    {
        "Country": "Germany",
        "Capital": "Berlin",
        "Continent": "Europe",
        "Currency": "Euro"
    },
    {
        "Country": "Canada",
        "Capital": "Ottawa",
        "Continent": "North America",
        "Currency": "Canadian Dollar"
    },
    {
        "Country": "Mexico",
        "Capital": "Mexico City",
        "Continent": "North America",
        "Currency": "Mexican Peso"
    },
    {
        "Country": "United Kingdom",
        "Capital": "London",
        "Continent": "Europe",
        "Currency": "Pound Sterling"
    },
    {
        "Country": "China",
        "Capital": "Beijing",
        "Continent": "Asia",
        "Currency": "Yuan"
    }
];

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('../Data/processed_data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        geographyData = await response.json();
        startBtn.disabled = false;
        dataStatus.textContent = "Data loaded successfully! Click Start Quiz to begin.";
    } catch (error) {
        console.error('Error loading data:', error);
        // Use sample data instead
        geographyData = sampleData;
        dataStatus.textContent = "Using sample data. Click Start Quiz to begin.";
        startBtn.disabled = false;
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
    
    // Reset voice button
    if (voiceBtn) {
        voiceBtn.disabled = false;
        voiceStatus.textContent = "Speak Answer";
    }
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

    // Display feedback directly on the screen
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('feedback');

    if (selectedOption === currentQuestion.correctAnswer) {
        feedbackElement.textContent = "Correct!";
        feedbackElement.style.color = "green";
        score++;
        answeredCorrectly = true;
        currentScoreElement.textContent = score;
    } else {
        feedbackElement.textContent = `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`;
        feedbackElement.style.color = "red";

        // Highlight correct answer
        options.forEach((option, index) => {
            if (currentQuestion.options[index] === currentQuestion.correctAnswer) {
                option.classList.add('correct');
            }
        });
    }

    // Append feedback to the question container
    questionContainer.appendChild(feedbackElement);

    // Disable all options
    options.forEach(option => {
        option.removeEventListener('click', selectOption);
        option.style.cursor = 'default';
    });

    // Disable voice button after answering
    if (voiceBtn) {
        voiceBtn.disabled = true;
    }

    // Move to the next question after a short delay
    setTimeout(() => {
        feedbackElement.remove(); // Remove feedback after a delay
        nextBtn.style.display = 'inline-block';
    }, 2000); // 2 seconds delay
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
    
    // Add feedback based on score
    const resultFeedback = document.getElementById('result-feedback');
    const percentage = (score / quiz.length) * 100;
    
    let message = "";
    let color = "";
    
    if (percentage >= 90) {
        message = "Outstanding! You're a geography expert!";
        color = "#2ecc71"; // Green
    } else if (percentage >= 70) {
        message = "Great job! You have excellent geography knowledge!";
        color = "#3498db"; // Blue
    } else if (percentage >= 50) {
        message = "Good effort! You know your geography basics.";
        color = "#f39c12"; // Orange
    } else {
        message = "Keep learning! Geography is a fascinating subject.";
        color = "#e74c3c"; // Red
    }
    
    resultFeedback.textContent = message;
    resultFeedback.style.backgroundColor = color + "20"; // Add transparency
    resultFeedback.style.color = color;
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

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    console.error("Speech recognition not supported in this browser.");
    voiceBtn.style.display = 'none'; // Hide voice button if not supported
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one utterance
    recognition.interimResults = false; // Only final results
    recognition.lang = 'en-US'; // Set language

    // Event listener for voice input
    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.trim().toLowerCase();
        checkSpokenAnswer(spokenText);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        voiceStatus.textContent = "Error: " + event.error;
    };

    recognition.onstart = () => {
        voiceStatus.textContent = "Listening...";
    };

    recognition.onend = () => {
        voiceStatus.textContent = "Speak Answer";
    };

    // Start/stop voice input
    voiceBtn.addEventListener('click', () => {
        if (selectedOptionIndex !== -1) return; // Don't allow if already answered
        
        try {
            recognition.start();
            voiceBtn.textContent = "Listening...";
        } catch (e) {
            console.error("Speech recognition error:", e);
            recognition.stop();
            voiceBtn.textContent = "Speak Answer";
        }
    });
}

// Check Spoken Answer
function checkSpokenAnswer(spokenText) {
    if (selectedOptionIndex !== -1) return; // Already answered
    
    const currentQuestion = quiz[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer.toLowerCase();
    const options = document.querySelectorAll('.option');
    let matchFound = false;
    let matchedIndex = -1;
    
    // Check if spoken text matches any of the options
    currentQuestion.options.forEach((option, index) => {
        if (option.toLowerCase() === spokenText) {
            matchFound = true;
            matchedIndex = index;
            
            // Highlight the selected option
            options[index].classList.add('selected');
            selectedOptionIndex = index;
        }
    });
    
    // If no exact match, try to find the closest option
    if (!matchFound) {
        // Find the closest match (basic implementation)
        let bestMatchIndex = 0;
        let bestSimilarity = 0;
        
        currentQuestion.options.forEach((option, index) => {
            // Simple similarity check (could be improved)
            const similarity = stringSimilarity(option.toLowerCase(), spokenText);
            if (similarity > bestSimilarity && similarity > 0.6) { // Threshold for similarity
                bestSimilarity = similarity;
                bestMatchIndex = index;
            }
        });
        
        if (bestSimilarity > 0.6) {
            matchFound = true;
            matchedIndex = bestMatchIndex;
            
            // Highlight the selected option
            options[bestMatchIndex].classList.add('selected');
            selectedOptionIndex = bestMatchIndex;
        }
    }
    
    // Create a feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('feedback');
    
    if (matchFound) {
        const selectedOption = currentQuestion.options[matchedIndex];
        
        if (selectedOption === currentQuestion.correctAnswer) {
            feedbackElement.textContent = "Correct!";
            feedbackElement.style.color = "green";
            score++;
            currentScoreElement.textContent = score;
            answeredCorrectly = true;
        } else {
            feedbackElement.textContent = `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`;
            feedbackElement.style.color = "red";
            
            // Highlight correct answer
            options.forEach((option, index) => {
                if (currentQuestion.options[index] === currentQuestion.correctAnswer) {
                    option.classList.add('correct');
                }
            });
        }
    } else {
        feedbackElement.textContent = `Sorry, couldn't recognize "${spokenText}". The correct answer is: ${currentQuestion.correctAnswer}`;
        feedbackElement.style.color = "red";
        
        // Highlight correct answer
        options.forEach((option, index) => {
            if (currentQuestion.options[index] === currentQuestion.correctAnswer) {
                option.classList.add('correct');
            }
        });
        
        selectedOptionIndex = -1; // Reset to allow selection
    }

    // Append feedback to the question container
    questionContainer.appendChild(feedbackElement);

    // Disable all options
    options.forEach(option => {
        option.removeEventListener('click', selectOption);
        option.style.cursor = 'default';
    });

    // Disable voice button after answering
    voiceBtn.disabled = true;

    // Move to the next question after a short delay
    setTimeout(() => {
        feedbackElement.remove(); // Remove feedback after a delay
        nextBtn.style.display = 'inline-block'; // Show the Next button
    }, 2000); // 2 seconds delay
}

// Simple string similarity function
function stringSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Early return for empty strings
    if (len1 === 0) return len2 === 0 ? 1.0 : 0.0;
    if (len2 === 0) return 0.0;
    
    let matches = 0;
    let i = 0, j = 0;
    
    while (i < len1 && j < len2) {
        if (str1[i] === str2[j]) {
            matches++;
            i++;
            j++;
        } else if (len1 > len2) {
            i++;
        } else {
            j++;
        }
    }
    
    return matches / Math.max(len1, len2);
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadData);