/* global Swal */
/*jshint esversion: 8 */
/*jshint asi: true */

// Fetch API questions
async function fetchRandomQuestions(numberOfQuestions) {
    const apiUrl = 'https://sean5p.github.io/PP2-TEST-Interactive-Quiz/data/questions.json';
    try {
        const response = await fetch(apiUrl);
        let data = await response.json();
        // Pick 10 Random Questions
        if (data.length > numberOfQuestions) {
            data = data.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);
        }
        return data.map(q => ({
            question: q.question,
            correct: q.correct_answer,
            answers: shuffleArray([...q.incorrect_answers, q.correct_answer])
        }));
    } catch (error) {
        console.error("Error fetching questions:", error);
        // Check Swal Defined before Use       
        if (typeof Swal !== 'undefined') {
            Swal.fire('Error', 'Failed to fetch questions.', 'error');
        }
        return [];
    }
}

// Shuffle Answers
function shuffleArray(array) {
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
const questionCounterEl = document.getElementById('questionCounter'); // Display Current Question Number Element
const submitBtn = document.getElementById('submit');

// Load Quiz Question
function loadQuestion() {
    deselectAnswers();
    const currentQuizData = quizData[currentQuestion];
    questionEl.innerHTML = currentQuizData.question;
    answerEls.innerHTML = '';
    // Update Question Counter
    if (questionCounterEl) {
        questionCounterEl.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    }

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
        }
    });
    return answer;
}

// Show Answer Feedback
function showFeedback(isCorrect) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: isCorrect ? 'Correct!' : 'Incorrect!',
            icon: isCorrect ? 'success' : 'error',
            timer: 2250,
            showConfirmButton: false
        });
    }
}

// Show End of Quiz Result
function showResults() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Quiz Completed!',
            html: `You answered ${score} of ${quizData.length} questions correctly.`,
            confirmButtonText: 'Restart',
            icon: 'info'
        }).then(() => {
            location.reload();
        });
    }
}

// Submit Button Event Listener
submitBtn.addEventListener('click', () => {
    const answer = getSelected();

    if (answer) {
        const isCorrect = answer === quizData[currentQuestion].correct;
        showFeedback(isCorrect);
        if (isCorrect) {
            score++;
        }

        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    } else {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Oops...', 'Please select an answer', 'warning');
        }
    }
});

// Start Quiz when DOM Fully Loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeQuiz();
});

// Initialize Quiz Function
async function initializeQuiz() {
    quizData = await fetchRandomQuestions(10); // Pick Only 10 Random Questions
    if (quizData.length > 0) {
        loadQuestion(); // Load First Question
    } else {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Error', 'Failed to load quiz questions. Please try again.', 'error');
        }
    }
}
