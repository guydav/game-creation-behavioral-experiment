import React from 'react';
import { PropTypes } from 'prop-types';

class Instruction {
    constructor(text, evaluator, id) {
      this.text = text;
      this.evaluator = evaluator;
      this.id = id;
    }

    evaluate(metadata) {
      if (this.evaluator) {
        return this.evaluator(metadata);
      }

      return false;
    }

    l2(a, b) {
       return a
           .map((x, i) => Math.abs( x - b[i] ) ** 2) // square the difference
           .reduce((sum, now) => sum + now) // sum
           ** (1/2);
    }

    findObjectsByPattern(re, objectArray) {
      return objectArray.filter((obj) => re.test(obj.name));
    }
  }

  class ObjectActionInstruction extends Instruction {
    constructor(text, objectPattern, actionPattern, id, checker) {
      super(text, null, id);
      this.objectRE = new RegExp(objectPattern);
      this.actionRE = new RegExp(actionPattern);
      if (checker) {
          this.checker = checker;
      } else {
          this.checker = (metadata) => {return metadata.lastActionSuccess;};
      }
    }

    evaluate(metadata) {
      return this.actionRE.test(metadata.lastAction) && this.objectRE.test(metadata.lastActionObjectName) && this.checker(metadata);
    }
  }

  class RepeatedObjectActionInstruction extends ObjectActionInstruction {
    constructor(text, objectPattern, actionPattern, times, differentObjects, id) {
      super(text, objectPattern, actionPattern, id);
      if (!times) {
        times = 2;
      }
      this.times = times;
      this.differentObjects = differentObjects != null ? differentObjects : true;
      this.counter = 0;
      this.blackList = new Set();
    }

    evaluate(metadata) {
      if ( ( !this.differentObjects || !this.blackList.has(metadata.lastActionObjectName) ) && super.evaluate(metadata)) {
        this.blackList.add(metadata.lastActionObjectName);
        this.counter += 1;
      }

      return (this.counter >= this.times);
    }
  }

  // eslint-disable-next-line no-unused-vars
  class ObjectActionPositionInstruction extends ObjectActionInstruction {
    constructor(text, objectPattern, actionPattern, position, id, tolerance = 0.01) {
      super(text, objectPattern, actionPattern, id);
      this.position = position;
      this.tolerance = tolerance;
    }

    evaluate(metadata) {
      let pos = metadata.lastActionObject.position;
      let posArr = [pos.x, pos.y, pos.z];
      return super.evaluate(metadata) && super.l2(posArr, this.position) < this.tolerance;
    }
  }

  // eslint-disable-next-line no-unused-vars
  class ObjectStatusInstruction extends Instruction {
    constructor(text, objectPattern, statusName, id, statusValue = true) {
      super(text, null, id);
      this.objectRE = new RegExp(objectPattern);
      this.statusName = statusName;
      this.statusValue = statusValue;
    }

    evaluate(metadata) {
      const filtered = this.findObjectsByPattern(this.objectRE, metadata.allObjects);
      for (const targetObject of filtered) {
        if (targetObject[this.statusName] === this.statusValue) {
          return true;
        }
      }
      return false;
    }
  }

  // eslint-disable-next-line no-unused-vars
  class ObjectPositionInstruction extends Instruction {
    constructor(text, objectPattern, position, id, tolerance = 0.25) {
      super(text, null, id);
      this.objectRE = new RegExp(objectPattern);
      this.position = position;
      this.tolerance = tolerance;
    }

    evaluate(metadata) {
      const filtered = this.findObjectsByPattern(this.objectRE, metadata.allObjects);
      for (const targetObject of filtered) {
        let pos = targetObject.position;
        let posArr = [pos.x, pos.y, pos.z];
        if (super.l2(posArr, this.position) < this.tolerance) {
          return true;
        }
      }
      return false;
    }
  }


class Tutorial extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentInstruction: ('currentInstruction' in props && props.currentInstruction) ? props.currentInstruction : 0,
    };

    this.instructions = [
      new RepeatedObjectActionInstruction(
        ['Many objects can be picked up if you are close enough to them.',
          'When you are close enough, your cursor will change from + to ( + ).',
          'If you cannot pick up an object, try moving closer to it.',
          'Pick up and drop at least three different objects.'], '.*', 'PickupObject', 3),
      new ObjectActionInstruction(['Once you pick up an object, you can move it closer or farther away.', 'First, pick up an object.'], '.*', 'PickupObject'),
      new ObjectActionInstruction('Now, use the scrollwheel to move it.', '.*', 'MoveHandDelta'),
      // new ObjectActionInstruction('Now drop the object.', '.*', 'ThrowObject'),
      // new ObjectActionInstruction('For practice, now pick up another object.', '.*', 'PickupObject'),
      new ObjectActionInstruction('Now move it all the way in, as close to you as possible.', '.*', 'MoveHandDelta', null, (metadata) => {
        return (metadata.lastActionSuccess === false) && (metadata.lastActionZ < 0);
      }),
      new ObjectActionInstruction('Now move it all the way out, as far away from you as possible.', '.*', 'MoveHandDelta', null, (metadata) => {
        return (metadata.lastActionSuccess === false) && (metadata.lastActionZ > 0);
      }),
      new ObjectActionInstruction(['Hold the left mouse button and release it to throw the held object.', 'Throw the held object strongly.'], '.*', 'ThrowObject', null, (metadata) => {
        return (typeof metadata.lastActionValue !== 'undefined') && (metadata.lastActionValue > 100);
      }),
      new ObjectActionInstruction(['Held objects can also be rotated.', 'First, pick up an object.'], '.*', 'PickupObject'),
      new RepeatedObjectActionInstruction(['One way to rotate objects is to hold down the right mouse button or the Z key and move the mouse.', 'Try that now.'], '.*', 'RotateObject', 3, false),
      new RepeatedObjectActionInstruction(['Another way to rotate objects is to press the R key to flip between a few orientations.', 'Try that a few times now.'], '.*', 'FlipObject', 3, false),
      new RepeatedObjectActionInstruction(
        ['Objects can also be frozen in place.',
          'A frozen object does not move when other objects collide with it.',
          'When you point at a frozen object, the cursor becomes blue.',
          'Freeze and then unfreeze an object using the Space Bar.'], '.*', 'FlipObjectKinematicState', 2, false),
      new ObjectActionInstruction('Press the Control key to crouch.', '.*', 'Crouch'),
      new ObjectActionInstruction('Now press the Control key again to stand.', '.*', 'Stand'),
      new RepeatedObjectActionInstruction(['Some objects can be opened and closed.', 'Open at least two different objects.'], '.*', 'OpenObject', 2),
      new ObjectActionInstruction(['Other objects can switched on and off.', 'Find one and toggle it.'], '.*', 'ToggleObject.*'),
    ];
    
    this.scrollToTop = this.scrollToTop.bind(this);
    this.finishTutorial = this.finishTutorial.bind(this);
  }

  scrollToTop() {
    window.scrollTo({
        behavior: 'smooth',
        top: 0,
    });
  }

  finishTutorial() {
    this.props.finishTutorial();
    this.scrollToTop();
  }

  handleEventMetadata(metadata) {
      if (this.state.currentInstruction >= this.instructions.length) {
          return;
        }

        const currentInstruction = this.instructions[this.state.currentInstruction];
        if (currentInstruction.evaluate(metadata)) {
            this.setState({ currentInstruction: this.state.currentInstruction + 1 });
        }
  }

  render() {
      const instructionRows = this.instructions.slice(0, this.state.currentInstruction + 1).map((instruction, i) => { return <TutorialEntry key={i} current={i === this.state.currentInstruction} {...instruction} /> })
      // TODO: handle adding the end tutorial button if the last instruction has been reached
      return (
          <div id="event-log" className="grid grid-cols-1 gap-2">
              <div className="row section-title">Tutorial</div>

              {/* <div class="row"> */}
              {/* <button id="event-log-reset" class="log-button btn btn-secondary">Reset Log</button> */}
              {/* </div> */}

              {instructionRows}
              {this.state.currentInstruction === this.instructions.length &&
                <div className="log-message text-xs text-left font-bold">
                  Press escape to restore the cursor and end click the &apos;Finish Tutorial&apos; button.
                </div>
              }
              <div className={`row ${this.state.currentInstruction === this.instructions.length ? 'block' : 'hidden'}`}>
                  <button onClick={this.finishTutorial} className="btn btn-gray">Finish Tutorial</button>
              </div>
          </div>
      );
  }
}

Tutorial.propTypes = {
  currentInstruction: PropTypes.number,
  finishTutorial: PropTypes.func.isRequired,
};


function TutorialEntry(props) {
    let text = props.text;
    if (Array.isArray(props.text)) {
        text = props.text.slice();
        if (props.text.length > 1) {
            const indices = Array.from({ length: text.length - 1 }, (v, k) => k + 1).reverse();
            indices.forEach((index) => { text.splice(index, 0, <br key={index}/>)});
        }
    }
    return (
        <div className={`log-message text-xs text-left ${props.current ? 'font-bold' : 'line-through text-gray-300'} `}>
            {text}
        </div>
    );
}

TutorialEntry.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  current: PropTypes.bool,
};

export default Tutorial;