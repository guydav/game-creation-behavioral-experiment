import React from 'react';
import seedrandom from 'seedrandom';
import { PropTypes } from 'prop-types';

const QUIZ_STEPS = {
    DISPLAY_INSTRUCTIONS: 'display_insturctions',
    DISPLAY_QUIZ: 'display_quiz',
    QUIZ_SUCCESS: 'quiz_success',
    QUIZ_FAILURE: 'quiz_failure',
};

const QUIZ_QUESTIONS = [
    {
        'id': 'objects-not-in-room',
        'question': 'Can the game you create use objects that are not present in the room?',
        'multiSelect': false,
        'answers': [
            'Yes, if they are objects you expect a person to have lying around the house',
            'Yes, if they are similar to existing objects in the room',
            'No, you cannot use objects that are not present in the room',
            'No, unless you absolutely cannot create anything with the objects in the room',
        ],
        'correctAnswer': 2,  // zero-based
    },
    {
        'id': 'scorable',
        'question': 'Does the game you create have to be scorable?',
        'multiSelect': false,
        'answers': [
            'Yes, the game must have a scoring system',
            'No, but the game should have a scoring system if it makes sense',
            'No, the game does not need to have a scoring system',
            'Maybe, only if it makes sense for the game you create'
        ],
        'correctAnswer': 0,  // zero-based
    },
    {
        'id': 'space-beyond-room',
        'question': 'Can the game you create use space beyond the room you are in?',
        'multiSelect': false,
        'answers': [
            'Yes, the game can assume other similar rooms exist',
            'Yes, the game can use any additional space you think is relevant',
            'No, the game must be playable within the room shown',
            'No, but the game can can also be played outside if you prefer'
        ],
        'correctAnswer': 2,  // zero-based
    },
    {
        'id': 'num-players',
        'question': 'How many players can the game you create be for?',
        'multiSelect': false,
        'answers': [
            'Any number of players',
            'One player only',
            'Two or more players',
            'One or two players',
        ],
        'correctAnswer': 1,  // zero-based
    },
    // {
    //     'id': 'same-game-different-rooms',
    //     'question': 'Can you submit the same game for two different rooms?',
    //     'multiSelect': false,
    //     'answers': [
    //         'Yes, if the game could be played in both of them',
    //         'No, unless you cannot come up with any better ideas',
    //         'No, you cannot submit the same game for two different rooms',
    //         'Yes, if the rooms are identical (you will not see identical rooms)',
    //     ],
    //     'correctAnswer': 2,  // zero-based
    // },
    {
        'id': 'submittables',
        'question': 'Which of the following will we ask you to submit for each game?',
        'multiSelect': true,
        'answers': [
            'A description of the game',
            'The scoring system for the game',
            'The names of the players in the game',
            'Additional items the game requires',
            'Your guess of the difficulty of the game',
            'The names of other, similar games that inspired you',
            'How many points you predict a player will score on the first time they play the game',
            'Any setup required to prepare the room before you can play the game'
        ],
        'correctAnswer': [0, 1, 4, 6, 7],  // zero-based
    },
];

class InstructionsQuiz extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            step: ('step' in props && props.step) ? props.step : QUIZ_STEPS.DISPLAY_INSTRUCTIONS,
            shuffleAnswers: 'shuffleAnswers' in props ? props.shuffleAnswers : true,
            quizAttempt: 0,
        }

        Object.assign(this.state, this.emptyQuizAnswers());
    
        this.emptyQuizAnswers = this.emptyQuizAnswers.bind(this);
        this.transitionToStep = this.transitionToStep.bind(this);
        this.onQuizChange = this.onQuizChange.bind(this);
        this.onQuizSubmit = this.onQuizSubmit.bind(this);
    }

    emptyQuizAnswers() {
        const quizAnswers = {};
        for (const questionInfo of QUIZ_QUESTIONS) {
            quizAnswers[questionInfo.id] = questionInfo.multiSelect ? [] : null;
        }
        return quizAnswers;
    }

    transitionToStep(step) {
        this.setState({
            step: step,
            shuffleAnswers: true,
            quizAttempt: this.state.quizAttempt + (step === QUIZ_STEPS.DISPLAY_QUIZ ? 1 : 0),
        });

        if (step === QUIZ_STEPS.QUIZ_FAILURE) {
            this.setState(this.emptyQuizAnswers());
        } 
    }

    onQuizChange(questionKey, event, isMulti) {
        const value = parseInt(event.target.value);
        // const value = event.target.value;
        let newAnswer = value;
        if (isMulti) {
            newAnswer = this.state[questionKey].slice();
            const index = newAnswer.indexOf(value);
            if (index === -1) {
                newAnswer.push(value);
            } else {
                newAnswer.splice(index, 1);
            }
        } 
        this.setState({
            [questionKey]: newAnswer,
        });
    }

    onQuizSubmit(event) {
        event.preventDefault();
        // TODO: switch the questions data structure to be an Object with keys?
        const allCorrect = QUIZ_QUESTIONS.map((questionInfo) => {
            const value = this.state[questionInfo.id]
            if (questionInfo.multiSelect) {
                return value.map((v) => { return questionInfo.correctAnswer.includes(v) }).reduce((reduceValue, currentValue) => reduceValue && currentValue, true);

            } else {
                return value === questionInfo.correctAnswer;
            }
        }).every(v => v === true);

        this.transitionToStep(allCorrect ? QUIZ_STEPS.QUIZ_SUCCESS : QUIZ_STEPS.QUIZ_FAILURE);
    }

    render() {
        switch (this.state.step) {
            case QUIZ_STEPS.DISPLAY_INSTRUCTIONS:
                return (
                    // TODO: three rooms? One room?
                    // TODO: video game? Or environment?
                    // TODO: are we still asking all of these questions?
                    // TODO: bonus amounts?
                    <div id="instructions" className="grid grid-cols-1 gap-2 text-left text-base">
                        <div className="row section-title">Experiment Instructions</div>

                        <div className={`${this.props.rowClasses} font-bold`}>
                            Please note: as the Prolific ad mentions, this experiment requires a reasonably strong computer and must be run from a desktop or laptop computer.
                            Unfortunately, we will not be able to compensate you if your computer fails to run the experiment website.
                        </div>
                        <div className={this.props.rowClasses}>
                            In this experiment, you will play a video game controling an agent in a small room, and you will be asked to create a game you could play to pass some time in the room.
                            In addition to describing how the game is played, you will be asked to describe any setup required to play your game from the initial state of the room.
                            You will also be asked to explain how the game is scored.
                            Before you begin creating games, you will go through a tutorial to learn the controls for the video game.
                            After creating your game, we will ask you to play it, and then give you a chance to edit your game before submitting it.
                            Our experiment has the following rules:
                        </div>
                        <div className={this.props.rowClasses}>
                            <ul className="list-disc list-inside">
                                <li>The game you create must be playable in the room: it cannot use any additional space.</li>
                                <li>The game you create must be playable using only the objects present in the room.</li>
                                <li>The game must be for a single player (you, passing some time in the room).</li>
                                <li>The game you create must be scorable: you should be able to keep score as you play.</li>
                                {/* <li>You cannot submit the same game for different rooms.</li> */}
                            </ul>
                        </div>
                        <div className={this.props.rowClasses}>
                            For each game you create, we will ask you to report the following:
                            <ol className="list-decimal list-inside">
                                <li>A description of the game -- how you would explain the game to a friend who asked how you passed the time.</li>
                                <li>Optionally, any setup required to prepare the room before you can play your game in. </li>
                                <li>The scoring system for the game -- how you keep track of how many points you get as you play.</li>
                                <li>Your guess for the difficulty of the game -- how hard might you find it the first time you play.</li>
                                <li>A scoring prediction -- how many points you would expect to score the first time you play.</li>
                            </ol>
                        </div>
                        {/* <div className={this.props.rowClasses}>
                            The games you create will be judged based on the rules described above.
                            We will choose one of the rooms we show you, and carefully review the game you create for that room.
                            If the game we review follows all of the rules, you will receive a bonus of $2.
                        </div> */}
                        <div className={this.props.rowClasses}>
                            After you finish, we will ask you a few short questions about your experience with our experiment.
                        </div>
                        <div className="row text-center">
                            <button onClick={() => { this.transitionToStep(QUIZ_STEPS.DISPLAY_QUIZ) }} className="btn btn-gray">Next</button>
                        </div>
                    </div>
                );
            case QUIZ_STEPS.DISPLAY_QUIZ: {
                const questionRows = QUIZ_QUESTIONS.map((questionInfo, index) => {
                    return (
                        <React.Fragment key={questionInfo.id}> 
                            <QuizQuestion
                                id={questionInfo.id}
                                shuffle={this.state.shuffleAnswers}
                                questionKey={questionInfo.id}
                                value={this.state[questionInfo.id]}
                                handleChange={this.onQuizChange}
                                question={questionInfo.question}
                                answers={questionInfo.answers}
                                multiSelect={questionInfo.multiSelect}
                                seed={this.state.quizAttempt}
                            /> 
                        </React.Fragment>
                    );
                });
                
                return (
                    <form id="instructions" className="grid grid-cols-1 gap-2 text-left text-base" onSubmit={this.onQuizSubmit}>
                        <div className="row section-title">Instructions Quiz</div>
                        {questionRows}
                        <input type="submit" className="btn btn-gray" value="Submit Quiz"
                        disabled={!QUIZ_QUESTIONS.every((questionInfo) => {
                            const value = this.state[questionInfo.id];
                            return value != null && value !== [];
                        })}
                        />
                    </form>
                );
            }
            case QUIZ_STEPS.QUIZ_SUCCESS:
                return (
                    <div id="instructions" className="grid grid-cols-1 gap-2 text-left text-base">
                        <div className="row section-title">Instructions Quiz</div>

                        <div className={this.props.rowClasses}>
                            Congratulations! You answered all of the quiz questions correctly, and you may proceed to the tutorial.
                        </div>

                        <div className={this.props.rowClasses}>
                            In the next screen, you will receive instructions about the controls in the experiment video game. 
                        </div>

                        <div className="row text-center">
                            <button onClick={() => this.props.quizPassed(this.state.quizAttempt)} className="btn btn-gray">Proceed to Tutorial</button>
                        </div>
                    </div>
                );
            
            case QUIZ_STEPS.QUIZ_FAILURE:
                return (
                    <div id="instructions" className="grid grid-cols-1 gap-2 text-left text-base">
                        <div className="row section-title">Instructions Quiz</div>

                        <div className={this.props.rowClasses}>
                            Unfortunately, you answered at least one question incorrectly.
                            Please read the instructions and attempt the quiz again.
                        </div>

                        <div className="row text-center">
                            <button onClick={() => { this.transitionToStep(QUIZ_STEPS.DISPLAY_INSTRUCTIONS) }} className="btn btn-gray">Return to Instructions</button>
                        </div>
                    </div>
                );
            
            default:
                break

        }
    }
}

InstructionsQuiz.propTypes = {
    quizPassed: PropTypes.func.isRequired,
    step: PropTypes.string,
    shuffleAnswers: PropTypes.bool,
    rowClasses: PropTypes.string,
};

InstructionsQuiz.defaultProps = {
    rowClasses: "row text-justify"
}

function shuffle(array, seed) {
    let currentIndex = array.length, randomIndex;
    const rng = seedrandom(seed);
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(rng() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

class QuizQuestion extends React.Component {
    render() {
        const answerRows = this.props.answers.map((answer, index) => {
            const idStr = `question-${this.props.id}-answer-${index}`;
            return (
                <div key={idStr} className={this.props.answerRowClasses}>
                    <input 
                        id={idStr} name={idStr} value={index}
                        type={this.props.multiSelect ? 'checkbox' : 'radio'} 
                        checked={this.props.multiSelect ? this.props.value.includes(index) : this.props.value === index} 
                        onChange={(event) => { this.props.handleChange(this.props.questionKey, event, this.props.multiSelect) }}
                    />
                    &nbsp;
                    <label htmlFor={idStr}>{answer}</label>
                </div>
            );
        });
        if (this.props.shuffle) {
            shuffle(answerRows, this.props.seed);
        }
        return (
            <div className="row pb-2 border-b-2">
                <span className={this.props.questionClasses}>{this.props.question}</span>
                {answerRows}
            </div>
        );
    }
}

QuizQuestion.propTypes = {
    handleChange: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    questionKey: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    answers: PropTypes.array.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    answerRowClasses: PropTypes.string,
    questionClasses: PropTypes.string,
    multiSelect: PropTypes.bool,
    shuffle: PropTypes.bool,
    seed: PropTypes.number,
};

QuizQuestion.defaultProps = {
    questionClasses: '',
    answerRowClasses: '',
};

export { InstructionsQuiz, QUIZ_STEPS };