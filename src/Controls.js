import React from 'react';
import { PropTypes } from 'prop-types';

const CONTROL_DEFS = [
    { images: ['esc.png'], text: 'Enable or disable game controls', alt: 'Use the escape key to enable or disable game controls' },
    { images: ['mouselook.png'], text: 'Use the mouse to look around', alt: 'Use the mouse to look around' },
    { images: ['WASD.png', 'arrowkeys.png'], imageClass: 'w-10', text: 'Move around', alt: 'Use the WASD or arrow keys to move around' },
    { images: ['leftclick.png'], text: 'Interact with the indicated object', alt: 'Use the mouse left click button to interact with the indicated object' },
    { images: ['scrollwheel.png'], text: 'Move an object forward or backward', alt: 'Use the mouse scrollwheel to move an object forward or backward' },
    { images: ['rightclick.png', 'zkey.png'], imageClass: 'w-10', textSize: 'xs', text: 'Hold and move the mouse to rotate a held object', alt: 'Hold the right mouse button or the Z key and move the mouse to rotate a held object' },
    { images: ['rkey.png'], imageClass: 'w-10', textSize: 'xs', text: 'Rotate the held object to one of 6 orientations', alt: 'Use the R key to rotate a held object to one of 6 fixed orientations'},
    { images: ['Space.png'], text: 'Freeze or unfreeze indicated object', alt: 'Use the space bar to freeze or unfreeze the indicated object'},
    { images: ['alt.png'], text: 'Crouch or stand up', alt: 'Use the alt key to crouch or stand up' },
    // TODO: do I need something for the different image classes I used? 
];


function Controls(props) {
    const controlRows = CONTROL_DEFS.map((def, i) => { return <ControlsRow key={i} {...def} vertical={props.vertical} /> });
    return (
        <div id="controls" className={`grid ${props.vertical ? 'grid-cols-1' : 'grid-rows-1 grid-cols-9 grid-flow-col'} gap-2`}>
            {props.vertical && <div className="row section-title">Controls</div>}
            {controlRows}
            <div className="row text-center gap-1">
                <button onClick={props.resetScene} className="btn btn-gray">Reset Room</button>
                {/* <button onClick={props.triggerReplay} className="btn btn-gray">Replay</button> */}
            </div>
        </div>
    );
}

Controls.propTypes = {
    vertical: PropTypes.bool.isRequired,
    resetScene: PropTypes.func.isRequired,
};

Controls.defaultProps = {
    vertical: true,
};

function ControlsRow(props) {
    const images = props.images.map((img, i) => { return <img key={`img-${i}`} className={`object-scale-down h-full ${'imageClass' in props ? props.imageClass : ''} `} alt={'alt' in props ? props.alt : props.text} src={`images/${img}`} /> });
    if (images.length > 1) {
        const indices = Array.from({ length: images.length - 1 }, (v, k) => k + 1).reverse();
        indices.forEach((index) => {images.splice(index, 0, <span key={`slash-${index}`} className="text-3xl">/</span>)});
    }
    return (
        <div className="row">
            {props.vertical ?
                <div className="h-12 row flex controls-row items-center space-x-1">
                    {images}
                    <span className={`text-${Object.hasOwnProperty.call(props, "textSize") ? props.textSize : "xs"}`}>{props.text}</span>
                </div>
            :
            <div className="col-span-1">
                <div className="h-8 flex justify-center">{images}</div>
                <div className={`text-${Object.hasOwnProperty.call(props, "textSize") ? props.textSize : "xs"}`}>{props.text}</div>
            </div>
            }
        </div>
        
    );
}

ControlsRow.propTypes = {
    vertical: PropTypes.bool.isRequired,
    textSize: PropTypes.string,
    text: PropTypes.string.isRequired,
    images: PropTypes.array.isRequired,
    imageClass: PropTypes.string,
    alt: PropTypes.string.isRequired,
};

export default Controls;
