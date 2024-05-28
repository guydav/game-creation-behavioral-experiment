import React from 'react';
import PropTypes from 'prop-types';


const CREATE_GAME_STEPS = {
    INSTRUCTIONS: 'instructions',
    GAME_CREATE: 'game_create',
    GAME_PLAY: 'game_play',
    GAME_SCORE: 'game_score',
    GAME_EDIT: 'game_edit',
    FREE_PLAY: 'free_play',
};

const DIFFICULTY_OPTIONS = [
    'Very Easy',
    'Easy',
    'Medium',
    'Hard',
    'Very Hard',
];

const CAN_SUBMIT_FORM_KEY = 'canSubmit';
const VALID_KEY = 'valid';

const GAMEPLAY_STEPS = {
    SETUP: 'setup',
    PLAY: 'play',
};

const GAME_FORM_QUESTIONS = [
    {
        type: 'textarea',
        key: 'setup',
        prompt: 'please describe any setup in the room (from its initial state) required for your game:',
        optional: true,
        minLength: 0,
        placeholder: "To prepare the room for the game, ...",
    },
    {
        type: 'textarea',
        key: 'gameplay',
        prompt: 'Please describe a game you could play in this room:',
        optional: false,
        placeholder: 'To play my game, ...',
    },
    {
        type: 'textarea',
        key: 'scoring',
        prompt: 'Please explain the scoring system for your game:',
        optional: false,
        placeholder: 'To score my game, ...'
    },
    {
        type: 'select',
        key: 'difficulty',
        prompt: 'How hard do you think your game is?',
        optional: false,
        options: DIFFICULTY_OPTIONS,
        defaultValue: '2',
    },
    {
        type: 'text',
        key: 'firstTimeScore',
        prompt: 'What do you imagine you would score on the first time playing your game?',
        optional: false,
        placeholder: 'I would score...'
    },
];

const GAME_SCORE_QUESTIONS = [
    {
        type: 'text',
        key: 'score',
        prompt: 'What did you score?',
        optional: false,
        placeholder: 'I scored...',

    },
    {
        type: 'textarea',
        key: 'thoughts',
        prompt: "Now that you've played it, do you have any thoughts about your game?",
        optional: true,
        placeholder: "Now that I've played my game, ..."
    },
];


function capitalizeFirstLetter([ first, ...rest ]) {
    return [ first.toUpperCase(), ...rest ].join('');
}


class CreateGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameplayStep: GAMEPLAY_STEPS.SETUP,
            [CREATE_GAME_STEPS.GAME_CREATE]: this.questionsToState(GAME_FORM_QUESTIONS),
            [CREATE_GAME_STEPS.GAME_SCORE]: this.questionsToState(GAME_SCORE_QUESTIONS),
            [CREATE_GAME_STEPS.GAME_EDIT]: this.questionsToState(GAME_FORM_QUESTIONS),
        };

        this.stepToQuestions = {
            [CREATE_GAME_STEPS.GAME_CREATE]: GAME_FORM_QUESTIONS,
            [CREATE_GAME_STEPS.GAME_SCORE]: GAME_SCORE_QUESTIONS,
            [CREATE_GAME_STEPS.GAME_EDIT]: GAME_FORM_QUESTIONS,
        }

        for (const [, stepKey] of Object.entries(CREATE_GAME_STEPS)) {
            if (stepKey in this.state) {
                const valid = {};
                
                for (const questionInfo of this.stepToQuestions[stepKey]) {
                    valid[questionInfo.key] = ('defaultValue' in questionInfo && (questionInfo.defaultValue != null)) || ('optional' in questionInfo && questionInfo.optional);
                }

                this.state[stepKey][VALID_KEY] = valid;
            }
        }

        this.scrollToTop = this.scrollToTop.bind(this);
        this.questionsToState = this.questionsToState.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.gameCreatedSubmit = this.gameCreatedSubmit.bind(this);
        this.gameplayStartOver = this.gameplayStartOver.bind(this);
        this.gameplaySetupComplete = this.gameplaySetupComplete.bind(this);
        this.gameScoreSubmit = this.gameScoreSubmit.bind(this);
        this.gameEditedSubmit = this.gameEditedSubmit.bind(this);
    }

    scrollToTop() {
        window.scrollTo({
            behavior: 'smooth',
            top: 0,
        });
    }

    questionsToState(questions) {
        const questionState = Object.fromEntries(questions.map((questionInfo) => [questionInfo.key, 'defaultValue' in questionInfo ? questionInfo.defaultValue : '']));
        questionState[CAN_SUBMIT_FORM_KEY] = false;
        return questionState;
    }

    handleChange(stepKey, valueKey, newValue, minLength) {
        if (minLength == null) minLength = 0;
        const stepState = { ...this.state[stepKey] };
        stepState[valueKey] = newValue;

        const valid = { ...stepState[VALID_KEY] };
        valid[valueKey] = newValue.length >= minLength;
        stepState[VALID_KEY] = valid;

        stepState[CAN_SUBMIT_FORM_KEY] = Object.values(valid).every((item) => item === true);

        this.setState({
            [stepKey]: stepState
        });
    }

    gameCreatedSubmit(event) {
        this.props.gameSubmitted(this.state[CREATE_GAME_STEPS.GAME_CREATE]);
        this.scrollToTop();
    }

    gameplayStartOver() {
        this.setState({
            gameplayStep: GAMEPLAY_STEPS.SETUP,
        });
        this.props.gameplayStartOver();
    }

    gameplaySetupComplete() {
        this.setState({
            gameplayStep: GAMEPLAY_STEPS.PLAY,
        });
        this.props.gameplaySetupComplete();
    }

    gameScoreSubmit() {
        this.setState({
            [CREATE_GAME_STEPS.GAME_EDIT]: { ...this.state[CREATE_GAME_STEPS.GAME_CREATE] },
        });
        this.props.gameScoreSubmitted(this.state[CREATE_GAME_STEPS.GAME_SCORE]);
        this.scrollToTop();
    }

    gameEditedSubmit(event) {
        this.props.gameEditSubmitted(this.state[CREATE_GAME_STEPS.GAME_EDIT]);
        this.scrollToTop();
    }

    render() {
        switch (this.props.step) {
            case CREATE_GAME_STEPS.INSTRUCTIONS:
                return (
                    <div id="create-game" className="grid grid-cols-1 gap-2 text-left text-sm">
                        <div className="row section-title">Create a Game</div>

                        <div className="row">Now, please explore this room.</div>
                        <div className="row">
                        When you are ready, please create a game.
                        The game must be playable entirely in this room, and only using the items in the room.
                        The game must have a scoring system and be designed for a single player.
                        </div>
                        <div className="row">When you are done, click the button below:</div>
                        
                        <div className="row text-center">
                            <button onClick={this.props.gameReady} className="btn btn-gray">Game Ready</button>
                        </div>

                        <div className="row text-center">
                            <button onClick={this.props.resetScene} className="btn btn-gray">Reset Room</button>
                        </div>
                    </div>
                );
            
            case CREATE_GAME_STEPS.GAME_CREATE:
                return (
                    <GameForm
                        formPrefix="create-game"
                        onSubmit={this.gameCreatedSubmit}
                        title="Create a Game"
                        instructions="When answering the questions below, please make sure to use the names of the objects in the game."
                        handleChange={this.handleChange}
                        values={this.state[CREATE_GAME_STEPS.GAME_CREATE]}
                        stepKey={CREATE_GAME_STEPS.GAME_CREATE}
                        questions={GAME_FORM_QUESTIONS}
                    />
                );
                
            case CREATE_GAME_STEPS.GAME_PLAY: {
                const descriptionRows = ['setup', 'gameplay', 'scoring'].map((key) => {
                    return <GameDescription key={key} section={capitalizeFirstLetter(key)}
                        value={this.state[CREATE_GAME_STEPS.GAME_CREATE][key]} />
                });
                return (
                    <div id="create-game" className="grid grid-cols-1 gap-2 text-left text-sm">
                        <div className="row section-title">Play Your Game</div>
                        <div className="row">Now, please play your game, keeping track of your score.</div>
                        <div className="row font-bold">Use the buttons below to indicate when you finish your setup and when you are done playing.</div>
                        <div className="row">You can also reset the room to start over.</div>
                        <div className="row">For your convenience, here is the game you described:</div>
                        {descriptionRows}
                        <GameDescription section="Current stage" value={this.state.gameplayStep}  />
                        <div className="row text-center">
                            <button onClick={this.gameplayStartOver} className="btn btn-gray">Start Over</button>
                        </div>

                        <div className="row text-center">
                            <button onClick={this.gameplaySetupComplete} className="btn btn-green" disabled={!(this.state.gameplayStep === GAMEPLAY_STEPS.SETUP)}>Setup Complete</button>
                        </div>

                        <div className="row text-center">
                            <button onClick={this.props.gameplayComplete} className="btn btn-green" disabled={!(this.state.gameplayStep === GAMEPLAY_STEPS.PLAY)}>Gameplay Complete</button>
                        </div>
                    </div>
                );
            }
            case CREATE_GAME_STEPS.GAME_SCORE:
                return (
                    <GameForm
                        formPrefix="score-game"
                        onSubmit={this.gameScoreSubmit}
                        title="Score Yourself"
                        handleChange={this.handleChange}
                        values={this.state[CREATE_GAME_STEPS.GAME_SCORE]}
                        stepKey={CREATE_GAME_STEPS.GAME_SCORE}
                        questions={GAME_SCORE_QUESTIONS}
                        submitButtonText={'Submit Score'}
                    />
                );
            
            case CREATE_GAME_STEPS.GAME_EDIT:
                return (
                    <GameForm
                        formPrefix="edit-game"
                        onSubmit={this.gameEditedSubmit}
                        title="Edit Your Game"
                        instructions="Now that you have played your game, if you would like to, you may edit it."
                        handleChange={this.handleChange}
                        values={this.state[CREATE_GAME_STEPS.GAME_EDIT]}
                        stepKey={CREATE_GAME_STEPS.GAME_EDIT}
                        questions={GAME_FORM_QUESTIONS}
                    />
                );
            
            case CREATE_GAME_STEPS.FREE_PLAY:
                return (
                    <div id="free-play" className="grid grid-cols-1 gap-2 text-left text-sm">
                        <div className="row section-title">Free Play</div>

                        <div className="row">You may now continue to play for as long as you would like.</div>
                        <div className="row">When you are done, and wish to end the experiment, click the button below.</div>
                        
                        <div className="row text-center">
                            <button onClick={this.props.endFreePlay} className="btn btn-gray">End Experiment</button>
                        </div>
                    </div>
                );
            
                
            default:
                console.warn('reached default, this should never happen');

        }
    }
}

CreateGame.propTypes = {
    resetScene: PropTypes.func.isRequired,
    gameReady: PropTypes.func.isRequired,
    gameSubmitted: PropTypes.func.isRequired,
    gameplayStartOver: PropTypes.func.isRequired,
    gameplaySetupComplete: PropTypes.func.isRequired,
    gameplayComplete: PropTypes.func.isRequired,
    gameScoreSubmitted: PropTypes.func.isRequired,
    gameEditSubmitted: PropTypes.func.isRequired,
    endFreePlay: PropTypes.func.isRequired,
    step: PropTypes.string,
};


class GameForm extends React.Component {
    constructor(props) {
        super(props);
        this.renderQuestion = this.renderQuestion.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    renderQuestion(questionInfo) {
        switch (questionInfo.type) {
            case 'textarea':
                return (
                    <GameTextArea
                        id={`${this.props.formPrefix}-${questionInfo.key}`}
                        prompt={questionInfo.prompt}
                        optional={'optional' in questionInfo && questionInfo.optional}
                        minLength={'minLength' in questionInfo ? questionInfo.minLength : null}
                        handleChange={this.props.handleChange}
                        value={this.props.values[questionInfo.key]}
                        stepKey={this.props.stepKey}
                        valueKey={questionInfo.key}
                        placeholder={'placeholder' in questionInfo ? questionInfo.placeholder : ''}
                    />
                );
                
            case 'select':
                return (
                    <GameSelect
                        id={`${this.props.formPrefix}-${questionInfo.key}`}
                        prompt={questionInfo.prompt}
                        options={questionInfo.options}
                        handleChange={this.props.handleChange}
                        value={this.props.values[questionInfo.key]}
                        stepKey={this.props.stepKey}
                        valueKey={questionInfo.key}
                    />
                );
                
            default:
                return (
                    <GameInput
                        id={`${this.props.formPrefix}-${questionInfo.key}`}
                        type={questionInfo.type}
                        prompt={questionInfo.prompt}
                        optional={'optional' && questionInfo && questionInfo.optional}
                        handleChange={this.props.handleChange}
                        value={this.props.values[questionInfo.key]}
                        stepKey={this.props.stepKey}
                        valueKey={questionInfo.key}
                        placeholder={'placeholder' in questionInfo ? questionInfo.placeholder : ''}
                    />
                );
        }
            
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(event);
    }

    render() {
        const formQuestions = this.props.questions.map((questionInfo, index) => <React.Fragment key={`${this.props.formPrefix}-${index}`}>{this.renderQuestion(questionInfo)}</React.Fragment>);

        return (
            <form id={`${this.props.formPrefix}-form`} className="grid grid-cols-1 gap-2 text-sm text-left" onSubmit={this.onSubmit}>
                <div className="row section-title">{this.props.title}</div>
                {this.props.instructions && <div className="row">{this.props.instructions}</div>}
                {formQuestions}
                <input type="submit" className="btn btn-gray" value={this.props.submitButtonText}
                    disabled={!this.props.values[CAN_SUBMIT_FORM_KEY]} />
            </form>
        );
    }
}

GameForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    stepKey: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    questions: PropTypes.array.isRequired,
    formPrefix: PropTypes.string,
    title: PropTypes.string.isRequired,
    instructions: PropTypes.string,
    submitButtonText: PropTypes.string,
}

GameForm.defaultProps = {
    submitButtonText: 'Submit Game',
}


class GameFormElement extends React.Component {
    constructor(props) {
        super(props);

        this.addBorderAndPadding = 'borderAndPadding' in this.props ? this.props.borderAndPadding : true;

        this.renderElement = this.renderElement.bind(this);
        this.onChange = this.onChange.bind(this);

        this.minLength = props.optional ? 0 : props.minLength;
        this.commonProps = {
            id: this.props.id,
            onChange: this.onChange,
            className: `${this.props.baseClasses} ${this.props.extraClasses} w-${this.props.width}`,
        };
    }

    onChange(event) {
        this.props.handleChange(this.props.stepKey, this.props.valueKey, event.target.value, this.props.minLength);
    }

    render() {
        return (
            <div className={`row ${this.addBorderAndPadding ? 'pb-2 border-b-2' : ''}`}>
                <label htmlFor={this.props.id}>{this.props.optional && <span className="italic">Optional:&nbsp;</span>}<span>{this.props.prompt}</span></label>
                {this.renderElement()}
            </div>
        );
    }

    renderElement() {
        return;
    }
}

GameFormElement.propTypes = {
    handleChange: PropTypes.func.isRequired,
    optional: PropTypes.bool,
    minLength: PropTypes.number,
    id: PropTypes.string.isRequired,
    stepKey: PropTypes.string.isRequired,
    valueKey: PropTypes.string.isRequired,
    prompt: PropTypes.string.isRequired,
    baseClasses: PropTypes.string,
    extraClasses: PropTypes.string,
    width: PropTypes.string,
    borderAndPadding: PropTypes.bool,
}

class GameTextArea extends GameFormElement {
    renderElement() {
        return (
            <textarea
                {...this.commonProps}
                value={this.props.value}
                rows={this.props.rows}
                placeholder={this.props.placeholder}
            ></textarea>
        );
    }
}


GameTextArea.defaultProps = {
    baseClasses: 'mt-1 block text-sm',
    extraClasses: '',
    rows: 3,
    minLength: 20,
    optional: false,
    width: 'full'
}


class GameSelect extends GameFormElement {
    renderElement() {
        const options = this.props.options.map((option, index) => { return <option key={option} value={index}>{option}</option> })
        return (
            <select { ... this.commonProps } value={this.props.value}> {options} </select>
        );
    }
}

GameSelect.defaultProps = {
    baseClasses: 'mt-1 block text-sm w-1/2',
    extraClasses: '',
    minLength: 1,
    optional: false,
    width: '1/2',
}


class GameInput extends GameFormElement {
    renderElement() {
        return (
            <input
                {...this.commonProps}
                value={this.props.value}
                type={this.props.inputType}
                placeholder={this.props.placeholder}
            ></input>
        );
    }
}

GameInput.defaultProps = {
    baseClasses: 'mt-1 block text-sm',
    extraClasses: '',
    inputType: 'text',
    minLength: 1,
    optional: false,
    width: 'full',
}


function GameDescription(props) {
    return (
        <div className="row break-words">
            <span className="font-bold">{props.section}:</span>&nbsp;
            {props.value}
        </div>
    );
}

GameDescription.propTypes = {
    section: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export { CreateGame, CREATE_GAME_STEPS, GameTextArea, GameSelect, GameInput };