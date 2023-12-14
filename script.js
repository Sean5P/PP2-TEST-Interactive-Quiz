// Fetch API questions
async function fetchRandomQuestions(amount, category, difficulty) {
    const apiUrl = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.results.map(q => ({
            question: q.question,
            correct: q.correct_answer,
            answers: shuffleArray([...q.incorrect_answers, q.correct_answer])
        }));
    } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
    }
}

// Shuffle answers
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let quizData = []; // Array to hold questions
let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById('question');
const answerEls = document.getElementById('answerList');
const submitBtn = document.getElementById('submit');

// Load a quiz question
function loadQuestion() {
    deselectAnswers();
    const currentQuizData = quizData[currentQuestion];
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

// Deselect all answers
function deselectAnswers() {
    document.querySelectorAll('input[name="answer"]').forEach(answerEl => {
        answerEl.checked = false;
    });
}

// Get selected answer
function getSelected() {
    let answer;
    document.querySelectorAll('input[name="answer"]').forEach(answerEl => {
        if (answerEl.checked) {
            answer = answerEl.value;
        }
    });
    return answer;
}

// Show feedback for answers
function showFeedback(isCorrect) {
    const feedbackEl = document.createElement('div');
    feedbackEl.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
    feedbackEl.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
    document.body.appendChild(feedbackEl);
    setTimeout(() => feedbackEl.remove(), 2000); // Remove feedback after 2 seconds
}

// Show results at quiz end
function showResults() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <h2>You answered correctly at ${score}/${quizData.length} questions.</h2>
        <button onclick="location.reload()">Reload</button>
    `;
}

// Submit button event listener
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
        alert("Please select an answer");
    }
});

// Quiz start
async function initializeQuiz() {
    quizData = await fetchRandomQuestions(10, 9, 'medium'); // Fetch 10 questions
    if (quizData.length > 0) {
        loadQuestion(); // Load the first question
    } else {
        alert("Failed to load quiz questions. Please try again.");
    }
}

initializeQuiz(); // Start the quiz