import React from 'react';
import { GameTextArea } from './CreateGame';
import { PropTypes } from 'prop-types';


const DEBRIEF_FIELDS = {
    STRATEGY: 'strategy',
    DIFFICULTIES: 'difficulties',
    EXTERNAL_AIDS: 'external_aids',
    QUESTIONS: 'questions',
}


class Debrief extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            formSubmitted: false,
            canSubmit: false,
            valid: {},
            experimentEnded: false,
        };

        for (const [, varKey] of Object.entries(DEBRIEF_FIELDS)) {
            this.state[varKey] = '';
            this.state.valid[varKey] = false;
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onEndExperiment = this.onEndExperiment.bind(this);
    }

    handleChange(stepKey, valueKey, newValue, minLength) {
        if (minLength == null) minLength = 0;
        const valid = { ...this.state.valid };
        valid[valueKey] = newValue.length >= minLength;
        const canSubmit = Object.values(valid).every((item) => item === true);

        this.setState({
            [valueKey]: newValue,
            valid: valid,
            canSubmit: canSubmit,
        });
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.debriefSubmitted(Object.fromEntries(Object.values(DEBRIEF_FIELDS).map((varKey) => [varKey, this.state[varKey]])));
        this.setState({
            formSubmitted: true
        });
    }

    onEndExperiment() {
        this.setState({experimentEnded: true}, () => {
            this.props.endExperiment();
        });
    }

    render() {
        if (!this.state.formSubmitted) {
            return (
                <form id="debrief-form" className="grid grid-cols-1 gap-2 text-sm text-left" onSubmit={this.onSubmit}>
                    <div className="row section-title">A Few Final Questions</div>

                    <div className="row">Please answer the following questions about your experience with this experiment:</div>

                    <GameTextArea
                        id={`debrief-${DEBRIEF_FIELDS.STRATEGY}`}
                        prompt="Please tell us, in a few sentences, about the strategy you used to create games. What did you consider? How did you go about it?"
                        optional={false}
                        // minLength={30}
                        handleChange={this.handleChange}
                        value={this.state[DEBRIEF_FIELDS.STRATEGY]}
                        stepKey=""
                        valueKey={DEBRIEF_FIELDS.STRATEGY}
                        placeholder="..."
                        extraClasses="w-full"
                    />

                    <GameTextArea
                        id={`debrief-${DEBRIEF_FIELDS.DIFFICULTIES}`}
                        prompt="Did you have any technical difficulties while completing the experiment?"
                        optional={false}
                        minLength={0}
                        handleChange={this.handleChange}
                        value={this.state[DEBRIEF_FIELDS.DIFFICULTIES]}
                        stepKey=""
                        valueKey={DEBRIEF_FIELDS.DIFFICULTIES}
                        placeholder="..."
                        extraClasses="w-full"
                    />

                    <GameTextArea
                        id={`debrief-${DEBRIEF_FIELDS.EXTERNAL_AIDS}`}
                        prompt="Did you use any external aids to help with the task (note taking, pen and paper, taking a screen shot, etc.)? It’s okay if you did. Please answer honestly -- you will receive full payment either way."
                        optional={false}
                        minLength={0}
                        handleChange={this.handleChange}
                        value={this.state[DEBRIEF_FIELDS.EXTERNAL_AIDS]}
                        stepKey=""
                        valueKey={DEBRIEF_FIELDS.EXTERNAL_AIDS}
                        placeholder="..."
                        extraClasses="w-full"
                    />

                    <GameTextArea
                        id={`debrief-${DEBRIEF_FIELDS.QUESTIONS}`}
                        prompt="Do you have any questions or comments for us?"
                        optional={false}
                        minLength={0}
                        handleChange={this.handleChange}
                        value={this.state[DEBRIEF_FIELDS.QUESTIONS]}
                        stepKey=""
                        valueKey={DEBRIEF_FIELDS.QUESTIONS}
                        placeholder="..."
                        extraClasses="w-full"
                    />

                    <input type="submit" className="btn btn-gray" value="Submit"
                        disabled={!this.state.canSubmit} />

                </form>
            );
        } else {
            // TODO: verify debrief text matches the experiment
            return (
                <div id="debrief" className="grid grid-cols-1 gap-2 text-left text-base">
                    <div className="row section-title">Thank You!</div>

                    <div className="row text-justify">
                        Thank you for your participation in our study.
                        Your participation makes an essential contribution to our understanding of how people create games in different environments.
                    </div>

                    <div className="row text-justify">
                        {/* Our research aims to better understand how people create games to be played in diverse environments.
                        In the task, you played in various rooms, with somewhat different items or configurations in each one.
                        You described a game to be played in each room and a scoring system for the game.
                        The games you created will help us analyze the types of games people can conceive of.
                        Particularly, we will look for commonalities and differences between the games created by different people and for different rooms. */}
                        Our research aims to better understand how people create games to be played in diverse environments.
                        In the task, you played in a virtual environment simulating a room with various objects and toys.
                        You described a game to be played, and how it is set up and scored.
                        You then played the game and optionally chose to edit it. 
                        The game you created will help us analyze the types of games people can conceive of.
                        Particularly, we will look for commonalities and differences between the games created by different people and for different rooms.
                    </div>

                    <div className="row text-justify">
                        If you have any questions about this research, you may contact the principal investigator Todd M. Gureckis at <a href="mailto: todd.gureckis@nyu.edu">todd.gureckis@nyu.edu</a>.
                    </div>

                    <div className="row text-center">
                        <button onClick={this.onEndExperiment} className="btn btn-gray">{this.state.experimentEnded ? "Saving Experiment Data..." : "End Experiment"}</button>
                        {this.state.experimentEnded && <img className="object-scale-down h-full mx-auto" alt="Animation of circles fading in and out to indicate data is being saved" src="Spin-1s-200px.gif" />}
                        {this.state.experimentEnded && <span>Please wait while your experiment data is being saved. This could take a few minutes.</span>}
                    </div>
                </div>
            );
        }
    } 
}

Debrief.propTypes = {
    debriefSubmitted: PropTypes.func.isRequired,
    endExperiment: PropTypes.func.isRequired,
};

export default Debrief;