import React from 'react';
import { GameInput } from './CreateGame';
import { PropTypes } from 'prop-types';

const MIN_ID_LENGTH = 8;

class IDVerification extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.id != null ? this.props.id : '',
            canSubmit: this.props.id != null ? this.props.id.length >= MIN_ID_LENGTH : false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
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
        // TODO: send responses to the main app / to firestore
        event.preventDefault();
        this.props.idVerified(this.state.id);
    }

    render() {
        return (
            <form id="id-form" className="grid grid-cols-1 gap-2 text-sm text-left" onSubmit={this.onSubmit}>
                <div className="row section-title">{this.props.idName} ID Verification</div>
                
                <GameInput
                    id="id-verification-input"
                    type="text"
                    prompt={`Please enter or verify your ${this.props.idName} ID:`}
                    optional={false}
                    minLength={MIN_ID_LENGTH}
                    handleChange={this.handleChange}
                    value={this.state.id}
                    stepKey=""
                    valueKey="id"
                    width="1/2"
                    borderAndPadding={false}
                />

                <input type="submit" className="btn btn-gray" value="Submit"
                    disabled={!this.state.canSubmit} />

            </form>
            
        );
    }
}

IDVerification.propTypes = {
    idVerified: PropTypes.func.isRequired,
    idName: PropTypes.string,
    id: PropTypes.string,
};

IDVerification.defaultProps = {
    idName: 'Prolific',
};

export default IDVerification;