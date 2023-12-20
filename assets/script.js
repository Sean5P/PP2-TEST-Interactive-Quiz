/*jshint esversion: 8 */
/*jshint asi: true */

// Import SweetAlert2

// Fetch API questions

async function fetchRandomQuestions(amount, category, difficulty) {
    const apiUrl = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
    console.log("Fetching questions from API:", apiUrl); // Log the API URL
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("Questions fetched:", data.results); // Log fetched data
        return data.results.map(q => ({
            question: q.question,
            correct: q.correct_answer,
            answers: shuffleArray([...q.incorrect_answers, q.correct_answer])
        }));
    } catch (error) {
        console.error("Error fetching questions:", error); // Log error if fetch fails
        Swal.fire('Error', 'Failed to fetch questions.', 'error');
        return [];
    }
}

// Shuffle Answers
function shuffleArray(array) {
    console.log("Shuffling answers"); // Log shuffling action
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let quizData = []; // Array to Hold Questions
let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById('question');
const answerEls = document.getElementById('answerList');
const submitBtn = document.getElementById('submit');

console.log("Initial quizData, currentQuestion, score:", quizData, currentQuestion, score); // Log initial values

// Load Quiz Question
function loadQuestion() {
    deselectAnswers();
    const currentQuizData = quizData[currentQuestion];
    console.log("Loading question:", currentQuizData); // Log current question
    questionEl.innerHTML = currentQuizData.question;
    answerEls.innerHTML = '';

    currentQuizData.answers.forEach(answer => {
        const answerEl = document.createElement('li');
        answerEl.innerHTML = `
            <input type="radio" name="answer" id="${answer}" value="${answer}">
            <label for="${answer}">${answer}</label>
        `;
        answerEls.appendChild(answerEl);
    });
}

// Deselect All Answers
function deselectAnswers() {
    console.log("Deselecting answers"); // Log action
    document.querySelectorAll('input[name="answer"]').forEach(answerEl => {
        answerEl.checked = false;
    });
}

// Get Selected Answer
function getSelected() {
    let answer;
    document.querySelectorAll('input[name="answer"]').forEach(answerEl => {
        if (answerEl.checked) {
            answer = answerEl.value;
            console.log("Selected answer:", answer); // Log selected answer
        }
    });
    return answer;
}

// Show Answer Feedback
function showFeedback(isCorrect) {
    console.log("Feedback - Correct:", isCorrect); // Log whether the answer was correct
    Swal.fire({
        title: isCorrect ? 'Correct!' : 'Incorrect!',
        icon: isCorrect ? 'success' : 'error',
        timer: 3000,
        showConfirmButton: false
    });
}

// Show Results at End of Quiz
function showResults() {
    console.log("Showing results - Score:", score); // Log final score
    Swal.fire({
        title: 'Quiz Completed!',
        html: `You answered correctly at ${score}/${quizData.length} questions.`,
        confirmButtonText: 'Restart',
        icon: 'info'
    }).then(() => {
        location.reload();
    });
}

// Submit Button Event Listener
submitBtn.addEventListener('click', () => {
    const answer = getSelected();

    if (answer) {
        const isCorrect = answer === quizData[currentQuestion].correct;
        showFeedback(isCorrect);
        if (isCorrect) {
            score++;
            console.log("Updated score:", score); // Log updated score
        }

        currentQuestion++;
        console.log("Next question - CurrentQuestion index:", currentQuestion); // Log next question index
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    } else {
        Swal.fire('Oops...', 'Please select an answer', 'warning');
    }
});

// Start Quiz
async function initializeQuiz() {
    console.log("Initializing Quiz"); // Log initialization
    quizData = await fetchRandomQuestions(10, 9, 'easy'); // Fetch 10 Questions
    console.log("Quiz data after initialization:", quizData); // Log quiz data after fetch
    if (quizData.length > 0) {
        loadQuestion(); // Load First Question
    } else {
        Swal.fire('Error', 'Failed to load quiz questions. Please try again.', 'error');
    }
}

initializeQuiz(); // Start Quiz
