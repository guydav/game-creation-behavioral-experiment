import React from 'react';
import { PropTypes } from 'prop-types';

function EventLog(props) {
    const eventRows = props.events.map((event, i) => { return <EventLogEntry key={props.indices[i]} {...event} /> });
    return (
        <div id="event-log" className="grid grid-cols-1 gap-2">
            <div className="row section-title">Event Log</div>

            <div className="row">
                <button onClick={props.resetLog} className="btn btn-gray" disabled={eventRows.length === 0}>Reset Event Log</button>
                <button onClick={props.triggerReplay} className="btn btn-gray">Replay</button>
            </div>
            {eventRows}    
        </div>
    );
}

EventLog.propTypes = {
    events: PropTypes.array.isRequired,
    indices: PropTypes.array.isRequired,
    resetLog: PropTypes.func.isRequired,
    triggerReplay: PropTypes.func.isRequired,
};

const NUMBER_FORMATTER = new Intl.NumberFormat({maximumSignificantDigits: 3});

function EventLogEntry(props) {
    let objectName = props.lastActionObjectId.split("|", 1)[0];
    let objectId = '';
    if (props.lastActionObjectName) {
        const objectSplit = props.lastActionObjectName.split('_');
        objectName = objectSplit[0];
        objectId = objectSplit[1];
    }

    return (
        <div className="row log-message text-xs text-left" style={{color: props.lastActionSuccess ? "green" : "red"}}>
            Action <span>{props.lastAction ? props.lastAction + " " : ""}</span>
            on <span>{objectId ? objectName : `${objectName} `}</span><span>{objectId ? ` (${objectId}) ` : ""}</span>
            at location ({NUMBER_FORMATTER.format(props.agent.x)}, {NUMBER_FORMATTER.format(props.agent.y)}, {NUMBER_FORMATTER.format(props.agent.z)})&nbsp;
            which <span>{props.lastActionSuccess ? "succeeded" : "failed"}</span>
        </div>
    );
}

EventLogEntry.propTypes = {
    lastActionObjectId: PropTypes.string.isRequired,
    lastAction: PropTypes.string,
    lastActionObjectName: PropTypes.string,
    lastActionSuccess: PropTypes.bool,
    agent: PropTypes.object,
};

export default EventLog;
