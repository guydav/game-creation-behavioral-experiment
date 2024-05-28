import React from 'react';
import { BrowserView, MobileView } from 'react-device-detect'
import { PropTypes } from 'prop-types';
                    
function ConsentForm(props) {
    return (
        <div>
            <BrowserView>
                <div id="consent-form" className="grid grid-cols-1 gap-2 text-left text-base">
                    <div className="row section-title">Consent Form</div>

                    <div className={props.rowClasses}>
                        {/* You are invited to take part in a research study named Concept Learning and Generalization (IRB number IRB-FY2018-1728).
                        The research is being conducted by Professor Brenden M. Lake, who is the principal investigator, at the Department of Psychology and Center for Data Science at New York University.
                        You must be 18 years or older to participate. */}
                        You have been invited to take part in a research study named Active Learning.
                        The study is designed to investigate how people learn in dynamic tasks.
                        It will be conducted by Professor Todd M. Gureckis who is the principal investigator, at the Department of Psychology, Faculty of Arts &amp; Science, New York University.
                    </div>
                    <div className={props.rowClasses}>
                        {/* If you agree to be in this study, you may be asked to: look at a series of figures (e.g., abstract symbols or photographs of everyday objects), look at a series words (e.g., nonsense strings such as “dax zif wug”), or watch short videos (e.g., moving symbols or cartoons) and make judgments about them.
                        Participation in this study will take about 45 minutes to complete, and you will receive $8 for your participation.
                        When you complete the study, a thorough verbal and written explanation of it will be provided.
                        In addition, by agreeing to participate, you understand that you must be 18 years or older. */}
                        If you agree to be in this study, you will be asked to look at pictures of objects (e.g., geometric figures or photographs of everyday objects) presented on a computer display, listen to sounds, or observe lights controlled by the computer and to make judgments about them using a keyboard, mouse, or switch attached to a computer.
                        Participation in this study will take about 40 minutes to complete, and you will receive $10.00 for your participation.
                        As an additional incentive to try your best at the task, you may earn a cash bonus of up to $2.00 based on your performance.
                    </div>
                    <div className={props.rowClasses}>
                        When you complete the study, a thorough verbal and written explanation of it will be provided. In addition, by agreeing to participate, you understand you must be 18 years or older to participate.    
                    </div>
                    
                    <div className={props.rowClasses}>
                        {/* There are no known risks associated with your participation in this research beyond those of everyday life.
                        Although you will receive no direct benefits, this research may help the investigator understand how people learn and generalize concepts.
                        As an additional incentive to try your best at the task, you may earn a small cash bonus of up to $2 based on your performance. */}
                        There are no known risks associated with your participation in this research beyond those of everyday life.
                        Although you will receive no direct benefits, this research may help the investigator understand how people learn new categories.
                    </div>
                    <div className={props.rowClasses}>
                        {/* Confidentiality of your research records will be strictly maintained.
                        We assign code numbers to each participant so that data is never directly linked to individual identity, and we are interested in group results rather than the responses of particular individuals.
                        Data are kept in our laboratory and are only viewed by the investigators. These data files are kept on our computer indefinitely.
                        De-identified data may be used in future research and shared with other researchers without your additional consent.
                        De-identified data may also be posted online when research results are published. */}
                        Confidentiality of your research records will be strictly maintained. 
                        We assign code numbers to each participant so that data is never directly linked to individual identity, and we are interested in group results rather than the responses of particular individuals. 
                        Data are kept in our laboratory and are only viewed by the investigators.
                        These data files are kept on our computer indefinitely.
                    </div>
                    <div className={props.rowClasses}>
                        Taking part in this study is voluntary.
                        Not taking part or withdrawing after the study has begun will result in no loss of services from NYU to which you are otherwise entitled.
                        You have the right to skip or not answer any questions you prefer not to answer.
                    </div>
                    <div className={props.rowClasses}>
                        {/* If there is anything about the study or your participation that is unclear or that you do not understand, if you have questions or wish to report a research-related problem, you may contact the principal investigator, Brenden M. Lake at the Center for Data Science, 60 5th Ave., New York, NY, 10011, (212) 998-3059, <a href="mailto: brenden@nyu.edu">brenden@nyu.edu</a>.
                        For questions about your rights as a research participant, you may contact the University Committee on Activities Involving Human Subjects, New York University, 665 Broadway, Suite 804, New York, NY 10012, at <a href="mailto: ask.humansubjects@nyu.edu">ask.humansubjects@nyu.edu</a> or (212) 998-4808. */}
                        If there is anything about the study or your participation that is unclear or that you do not understand, if you have questions or wish to report a research-related problem, you may contact the principal investigator, Todd M. Gureckis at 6 Washington Place (409), New York, NY, 10003, (212) 998-3794, <a href="mailto: todd.gureckis@nyu.edu">todd.gureckis@nyu.edu</a>.
                        For questions about your rights as a research participant, you may contact the University Committee on Activities Involving Human Subjects, New York University, 665 Broadway, Suite 804, New York, NY 10012, at <a href="mailto: ask.humansubjects@nyu.edu">ask.humansubjects@nyu.edu</a> or (212) 998-4808.
                    </div>
                    <div className="row text-center">
                        Please print a copy of this consent document to keep.
                    </div>
                    <div className="row text-center">
                        <button onClick={() => { props.consentResponse(true) }} className="btn btn-gray">I consent, begin the study</button>
                    </div>
                    <div className="row text-center">
                        <button onClick={() => { props.consentResponse(false) }} className="btn btn-gray">I do not consent, I do not wish to participate</button>
                    </div>
                </div>
            </BrowserView>
            <MobileView>
                <div id="consent-form-mobile-reject" className="grid grid-cols-1 gap-2 text-left text-base">
                    <div className="row section-title">Mobile Device Detected</div>

                    <div className={props.rowClasses}>
                            Our experiment detected you are using a mobile device.
                            Unfortunately, our experiment only supports desktop or laptop computers.
                    </div>
                    <div className={props.rowClasses}>
                        Please &apos;return&apos; the submission on Prolific or access the experiment from a computer. 
                    </div>

                    <div className="row text-center">
                        <button onClick={() => { window.close(); }} className="btn btn-gray">Exit Experiment</button>
                    </div>
                </div>
            </MobileView>
        </div>
    );
}

ConsentForm.propTypes = {
    consentResponse: PropTypes.func.isRequired,
    rowClasses: PropTypes.string,
};

ConsentForm.defaultProps = {
    rowClasses: "row text-justify"
};


function NoConsent(props) {
    return (
        <div id="no-consent" className="grid grid-cols-1 gap-2 text-left text-base">
            <div className="row section-title">Terminate Experiment</div>

            <div className={props.rowClasses}>
                As you do not wish to participate in this study, please <span className="font-bold">return</span> your submission on Prolific by selecting the &apos;Stop without completing&apos; button.
            </div>
        </div>
    );
}

NoConsent.propTypes = {
    rowClasses: PropTypes.string,
};


export { ConsentForm, NoConsent };