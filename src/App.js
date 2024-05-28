import React from "react";
// import { useState, useEffect } from "react";
// import ReactDOM from 'react-dom';
import Unity, { UnityContext } from "react-unity-webgl";  // UnityContent,
import ProgressBar from "@ramonak/react-progress-bar";

// import logo from './logo.svg';
import './App.css';
import Controls from './Controls';
import Tutorial from "./Tutorial";
import { CreateGame, CREATE_GAME_STEPS } from "./CreateGame";
import { ConsentForm, NoConsent } from "./ConsentForm";
import { InstructionsQuiz } from "./InstructionsQuiz";``
import Debrief from "./Debrief";
import IDVerification from "./IDVerification";

import { initializeApp, } from "firebase/app"
import { getAuth, signInAnonymously, updateProfile, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, serverTimestamp, setLogLevel, connectFirestoreEmulator } from "firebase/firestore";
import sizeof from 'firestore-size';

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";

const EMULATE = false;
const DEBUG_DEPLOY = false;
const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' || DEBUG_DEPLOY || 'DEBUG' in parseQueryString();
// const FORCE_UNITY_PROD = true;
// const USE_UNITY_PROD = !DEBUG || FORCE_UNITY_PROD;
const DEBUG_FIRESTORE = false;
const PROLIFIC_REDIRECT_URL = 'https://app.prolific.co/submissions/complete?cc=<OUR_PROLIFIC_CODE>';  
const FIRESTORE_MAX_BATCH_SIZE = 500;
const MAX_REPLAY_BATCH_SIZE = 512 * 1024; // 256kb, quarter the Firestore maximum size of 1 MB
const FIRESTORE_COLLECTION_NAME = '<OUR_FIRESTORE_COLLECTION_NAME>';


Sentry.init({
  dsn: "<OUR_SENTRY_DSN_URL",
  environment: DEBUG ? 'debug' : 'production',
  integrations: [
    new CaptureConsole(
      {
        levels: ['warn', 'error', 'assert'], // 'debug',
      }
    ),
    new Integrations.BrowserTracing(),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  beforeBreadcrumb(bc) {
    if (bc.message.includes('Shader Unsupported') || bc.message.includes('Shader is not supported') || bc.message.includes('GL ERROR :GL_INVALID_OPERATION')
      || bc.message.includes('canvas##canvas')
    ) {
      return null;
    }
    return bc;
  },
  maxBreadcrumbs: 200,
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.epicplay.com',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'http://loading.retry.widdit.com/',
    'atomicFindClose',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    'conduitPage',
    // Generic error code from errors outside the security sandbox
    // You can delete this if using raven.js > 1.0, which ignores these automatically.
    'Script error.',
    // Avast extension error
    "_avast_submit"
  ],
  // denyUrls: [
  //   // Google Adsense
  //   /pagead\/js/i,
  //   // Facebook flakiness
  //   /graph\.facebook\.com/i,
  //   // Facebook blocked
  //   /connect\.facebook\.net\/en_US\/all\.js/i,
  //   // Woopra flakiness
  //   /eatdifferent\.com\.woopra-ns\.com/i,
  //   /static\.woopra\.com\/js\/woopra\.js/i,
  //   // Chrome extensions
  //   /extensions\//i,
  //   /^chrome:\/\//i,
  //   // Other plugins
  //   /127\.0\.0\.1:4001\/isrunning/i,  // Cacaoweb
  //   /webappstoolbarba\.texthelp\.com\//i,
  //   /metrics\.itunes\.apple\.com\.edgesuite\.net\//i
  // ],
  allowUrls: [
    /127\.0\.0\.1:3000/i, 
    /127\.0\.0\.1:3001/i,
    /localhost:3000/i,
    /localhost:3001/i,
    /https:\/\/game-generation-6db9c\.web\.app/i,
    /https:\/\/game-replay-viewer\.web\.app/i,
  ],
});

const firebaseApp = initializeApp({
  apiKey: "<OUR_API_KEY>",
  authDomain: "<OUR_AUTH_DOMAIN>",
  projectId: "<OUR_PROJECT_ID>",
  storageBucket: "<OUR_STORAGE_BUCKET>",
  messagingSenderId: "<OUR_MESSAGING_SENDER_ID>",
  appId: "<OUR_APP_ID>",
  measurementId: "<OUR_MEASUREMENT_ID>"
});

const db = getFirestore(firebaseApp);
if (DEBUG && EMULATE) {
  connectFirestoreEmulator(db, 'localhost', 5200);
}

// const unityContent = new UnityContent({
//   loaderUrl: `unity/UnityLoader.js`,
//   dataUrl: `/unity/goal-experiment-web.data.unityweb`,
//   frameworkUrl: `/unity/goal-experiment-web.wasm.framework.unityweb`,
//   codeUrl: `unity/goal-experiment-web.wasm.code.unityweb`,
// });

// const unityContent = new UnityContent(
//   'unity/goal-experiment-web.json',
//   'unity/UnityLoader.js',
// );

// const unityConfig = {
//   loaderUrl: `unity/goal-experiment-web${USE_UNITY_PROD ? '-prod' : ''}.loader.js`,
//   dataUrl: `unity/goal-experiment-web${USE_UNITY_PROD ? '-prod' : ''}.data${USE_UNITY_PROD ? '.br' : ''}`,
//   frameworkUrl: `unity/goal-experiment-web${USE_UNITY_PROD ? '-prod' : ''}.framework.js${USE_UNITY_PROD ? '.br' : ''}`,
//   codeUrl: `unity/goal-experiment-web${USE_UNITY_PROD ? '-prod' : ''}.wasm${USE_UNITY_PROD ? '.br' : ''}`,
// };
const unityConfig = {
  loaderUrl: 'unity/goal-experiment-web.loader.js',
  dataUrl: 'unity/goal-experiment-web.data',
  frameworkUrl: 'unity/goal-experiment-web.framework.js',
  codeUrl: 'unity/goal-experiment-web.wasm',
  productName: 'NYU Game Creation Experiment',
  companyName: 'NYU Humand and Machine Learning Lab',
  productVersion: '0.0.1',
};
const unityContext = new UnityContext(unityConfig);


const TUTORIAL_SCENE = 'FloorPlan302_physics';  
const SCENES = [
  'FloorPlan326_physics_semi_sparse_few_new_objects',
  'FloorPlan326_physics_semi_sparse_new_objects',
  'FloorPlan326_physics_semi_sparse_many_new_objects',
];
// const OBJECT_KEYS_TO_RETAIN = ['name', 'objectId', 'position', 'rotation', 'velocity', 'angularVelocity'];



function parseQueryString() {
  let paramStr = window.location.search.substr(1);
  return paramStr !== null && paramStr !== ''
    ? Object.fromEntries(paramStr.split('&').map(entry => entry.split('=')))
    : {};
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.getParams = parseQueryString();
    this.collection = 'collection' in this.getParams ? this.getParams.collection : FIRESTORE_COLLECTION_NAME;
    this.firestorePromises = []

    this.state = {
      displayConsent: true,
      displayNoConsent: false,
      displayIDVerification: false,
      displayInstructionzQuiz: false,
      displayUnity: false,
      displayTutorial: true,
      displayDebrief: false,
      unityHtmlSetup: false,
      unityReady: false,
      unityInPointerLock: false,

      consent: null,
      loadingProgress: 0,
      scene: TUTORIAL_SCENE,
      spawnRandomSeed: 10, // TODO: switch to an actual random number?
      events: [],
      
      replayKey: '',
      replayAdditionalFields: null,
      replayEvents: [],
      replayEventBuffer: [],
      replayLengths: {},

      replayEventIndex: 0, // the index within kept events
      replayEventOriginalIndex: 0, // the one it should be played at
      replayBatchIndex: 0,  // the index of the replay batch itself
      replayBatchSize: 0,
      
      createGameStep: null,
      gameplayAttempt: 0,
      gameplaySetupCompleteIndex: null,
      participantId: 'PROLIFIC_PID' in this.getParams ? this.getParams['PROLIFIC_PID'] : null,
      title: null,
    };

    this.participant = null;
    this.canUpdateParticipant = false;
    this.pendingParticipantUpdate = {};

    // this.unityRef = React.createRef();
    this.unityCanvas = null;
    this.tutorialRef = React.createRef();
    this.createGameRef = React.createRef();

    this.updateParticipant = this.updateParticipant.bind(this);
    this.batchSaveEventsAndUpdateParticipant = this.batchSaveEventsAndUpdateParticipant.bind(this);
    this.endPhseSaveEventsAndUpdateState = this.endPhaseSaveEventsAndUpdateState.bind(this);

    this.resetScene = this.resetScene.bind(this);
    this.unityHtmlSetup = this.unityHtmlSetup.bind(this);
    this.handleClick = this.handleClick.bind(this)
    this.pointerLockListener = this.pointerLockListener.bind(this);

    this.consentResponse = this.consentResponse.bind(this);
    this.idVerified = this.idVerified.bind(this);
    this.quizPassed = this.quizPassed.bind(this);
    this.tutorialFinished = this.tutorialFinished.bind(this);

    this.gameReady = this.gameReady.bind(this);
    this.gameSubmitted = this.gameSubmitted.bind(this);
    this.gameplayStartOver = this.gameplayStartOver.bind(this);
    this.gameplaySetupComplete = this.gameplaySetupComplete.bind(this);
    this.gameplayComplete = this.gameplayComplete.bind(this);
    this.gameScoreSubmitted = this.gameScoreSubmitted.bind(this);
    this.gameEditSubmitted = this.gameEditSubmitted.bind(this);

    this.endFreePlay = this.endFreePlay.bind(this);
    this.endExperiment = this.endExperiment.bind(this);
    this.debriefSubmitted = this.debriefSubmitted.bind(this);

    this.randomChoice = this.randomChoice.bind(this);
    this.setCustomTitle = this.setCustomTitle.bind(this);
  }

  setCustomTitle(title) {
    this.setState({
      title: title,
    });
  }

  resetScene(resetEvents = true) {
    const stateUpdate = {};

    if (resetEvents) {
      stateUpdate.events = [];
      stateUpdate.replayEvents = [];
      stateUpdate.replayEventBuffer = [];
      stateUpdate.replayEventIndex = 0;
      stateUpdate.replayEventOriginalIndex = 0;
      stateUpdate.replayBatchIndex = 0;
      stateUpdate.replayBatchSize = 0;
    }

    if (this.state.createGameStep === CREATE_GAME_STEPS.GAME_PLAY) {
      stateUpdate.gameplaySetupCompleteIndex = null;
      stateUpdate.gameplayAttempt = this.state.gameplayAttempt + 1;
    }

    this.setState(stateUpdate);

    unityContext.send('PhysicsSceneManager', 'SwitchScene', this.state.scene);
    unityContext.send('FPSController', 'Step', JSON.stringify({
      action: "RandomlyMoveAgent",
      randomSeed: this.state.spawnRandomSeed,
    }));
  }

  unityHtmlSetup() {
    console.log(`unityHTMLsetup called, htmlSetup = ${this.state.unityHtmlSetup} && displayUnity = ${this.state.displayUnity}`);
    if (!this.state.unityHtmlSetup && this.state.displayUnity) {
      unityContext.send('PhysicsSceneManager', 'SwitchScene', this.state.scene);

      // const node = ReactDOM.findDOMNode(this.unityRef.current);
      if (this.unityCanvas !== null) {
        this.unityCanvas.style.background = 'white';
        // const canvas = node.children[0];
        this.unityCanvas.setAttribute('tabindex', 1);
        if ("onpointerlockchange" in document) {
          document.addEventListener('pointerlockchange', this.pointerLockListener, false);
        } else if ("onmozpointerlockchange" in document) {
          document.addEventListener('mozpointerlockchange', this.pointerLockListener, false);
        }
        this.setState({
          unityHtmlSetup: true,
        });
      }
    }
  }

  pointerLockListener() {
    // console.warn(`Pointer lock listener called: ${document.pointerLockElement} || ${document.mozPointerLockElement} = ${document.pointerLockElement || document.mozPointerLockElement}`);
    this.setState({
      unityInPointerLock: document.pointerLockElement || document.mozPointerLockElement,
    });
  }

  componentDidMount() {
    if (DEBUG_FIRESTORE) setLogLevel('debug');
    
    const auth = getAuth();

    if (DEBUG && EMULATE) {
      connectAuthEmulator(auth, "http://localhost:9099");
    }

    signInAnonymously(auth)
      .then(() => {
        // console.info(auth.currentUser)
      }
    ).catch((error) => {
        Sentry.captureException(error, { tags: { step: 'signInAnonymously' } });
        console.error(error)
      }
    );

    unityContext.on('progress', (progress) => {
      this.setState({
        loadingProgress: progress
      });
    });

    unityContext.on('loaded', () => {
      this.unityHtmlSetup();
    });

    unityContext.on('canvas', (canvas) => {
      this.unityCanvas = canvas;
    });

    unityContext.on('gameLoaded', () => {
      console.log("unityContext.on('gameLoaded', ...) [Init() in JavaScriptInterface.cs] called");
      if (!this.state.unityReady) {
        this.setState({
          unityReady: true,
        }, () => {
          this.unityHtmlSetup();
          unityContext.send('FPSController', this.state.displayUnity ? 'Show' : 'Hide');
        });
      }
    });

    unityContext.on('unityLog', (message) => {
      if (DEBUG) console.log(`Unity log: ${message}`);
    });

    unityContext.on('unityWarning', (message) => {
      console.warn(`Unity warning: ${message}`);
    });

    unityContext.on('unityError', (message) => {
      console.error(`Unity error: ${message}`);
    });

    unityContext.on('unityMetadata', (strMetadata) => {
      const metadata = JSON.parse(strMetadata);

      // console.log('unityMetadata');
      // console.log(metadata);

      const agentMetadata = metadata.agents[0];
      const agent = agentMetadata.agent;

      const potentialObjects = agentMetadata.objects.filter((obj) => { return obj.objectId === agentMetadata.lastActionObjectId });
      let matchingObject = null;
      if (potentialObjects.length === 1) {
        matchingObject = potentialObjects[0];
      }

      const eventMetadata = {
        lastAction: agentMetadata.lastAction,
        lastActionSuccess: agentMetadata.lastActionSuccess,
        lastActionObjectId: agentMetadata.lastActionObjectId,
        lastActionObjectName: agentMetadata.lastActionObjectName,
        lastActionX: agentMetadata.lastActionX,
        lastActionY: agentMetadata.lastActionY,
        lastActionZ: agentMetadata.lastActionZ,
        lastActionValue: agentMetadata.lastActionValue,
        lastActionObject: matchingObject,
        agent: {
          x: agent.position.x,
          y: agent.position.y,
          z: agent.position.z,
          rotation: agent.rotation.y,
          horizon: agent.cameraHorizon,
          standing: agent.isStanding
        },
        allObjects: agentMetadata.objects
      };

      if (this.tutorialRef.current != null) {
        this.tutorialRef.current.handleEventMetadata(eventMetadata);
      }
      
    });

    unityContext.on('unityMovement', (strMovement) => {
      // const movement = JSON.parse(strMovement);
      // console.log(movement);
    });

    unityContext.on('unityEvent', (strEvent) => {
      // const event = JSON.parse(strEvent);
      // console.log('unityEvent');
      // console.log(event);
    });

    unityContext.on('unityObjects', (strObjects) => {
      const replayEvent = JSON.parse(strObjects);

      // replayEvent.objects.forEach(object => {
      //   if (object.objectType === 'Beachball') {
      //     console.log(object.touchingObjects);
      //   }
      // });

      const stateUpdateData = {
        replayEventOriginalIndex: this.state.replayEventOriginalIndex + 1, 
      };
      let newReplayBatchSize = this.state.replayBatchSize;

      if (replayEvent.actionChanged || replayEvent.agentStateChanged || replayEvent.nObjectsChanged > 0) {
        if (!replayEvent.actionChanged) {
          replayEvent.action = {};
        }
        if (!replayEvent.agentStateChanged) {
          replayEvent.agentState = {};
        }

        replayEvent.originalIndex = this.state.replayEventOriginalIndex;
        replayEvent.index = this.state.replayEventIndex;

        newReplayBatchSize += sizeof(replayEvent);

        const eventKey = this.state.savingReplayEvents ? 'replayEventBuffer' : 'replayEvents';
        stateUpdateData[eventKey] = this.state[eventKey].concat([replayEvent]);
        stateUpdateData.replayEventIndex = this.state.replayEventIndex + 1;
        stateUpdateData.replayBatchSize = newReplayBatchSize;

      }

      this.setState(stateUpdateData, () => {
        if ((newReplayBatchSize >= MAX_REPLAY_BATCH_SIZE || this.state.replayEvents.length >= FIRESTORE_MAX_BATCH_SIZE)
          && !this.state.savingReplayEvents) {
          this.batchSaveEventsAndUpdateParticipant();
        }
      });
    });
  }

  // componentDidUpdate() {
  //   if (this.state.replayEvents.length >= MAX_NUM_EVENTS_TO_STORE) {
  //     // console.log(`Found ${this.state.replayEvents.length} reaply events, intermediately saving`);
      
  //   }

  //   if (this.state.replayEvents.length % 100 === 0) {
  //     // console.log(`Currently at ${this.state.replayEvents.length} replay events and ${this.state.replayEventBuffer.length} events in the buffer`);
  //   }
  // }

  
  // sparsifiyReplayEvents() {
  //   const sparseStates = [];
  //   const sparseStateIndices = [];
  //   this.state.replayEvents.forEach((state, index) => {

  //     if (state.actionChanged || state.agentStateChanged || state.nObjectsChanged > 0) {
  //       sparseStates.push(state);
  //       sparseStateIndices.push(index);
  //     }
  //   });
  //   const maxReplayEventIndex = this.state.replayEvents.length;
  //   return { sparseStates, sparseStateIndices, maxReplayEventIndex };
  // }

  handleClick(event) {
    if (!this.state.displayUnity) {
      event.preventDefault();
    } else if (document.pointerLockElement === null && this.state.displayUnity) {
      // eslint-disable-next-line react/no-find-dom-node
      // const node = ReactDOM.findDOMNode(this.unityRef.current);
      // const canvas = node.children[0];
      if (this.unityCanvas !== null) {
        this.unityCanvas.requestPointerLock();
      }
      unityContext.send('FPSController', 'EnableMouseControl');
    }
  }

  consentResponse(response) {
    this.setState({
      consent: response,
      displayConsent: false,
      displayIDVerification: response,
      displayNoConsent: !response,
    });
  }

  async idVerified(participantId) {
    this.setState({
      participantId: participantId,
      displayIDVerification: false,
      displayInstructionzQuiz: true,
    });

    // TODO: do we want to do any sort of validation on the id?
    const auth = getAuth();

    const participantInfo = {
      getParams: this.getParams,
      timestamp: serverTimestamp(),
      participantID: participantId,
      timestamps: {},
      authUid: auth.currentUser != null ? auth.currentUser.uid : null,
    };

    // console.log(participant);
    
    this.participant = doc(collection(db, this.collection));
    Sentry.setContext('participantInfo', { getParams: this.getParams, participantId: participantId, firestoreId: this.participant.id });
    Sentry.setTags({ participantId: participantId, firestoreId: this.participant.id });

    updateProfile(auth.currentUser, { displayName: this.participant.id })
      .then(() => {
        // force refresh to get token with displayName set properly
        return auth.currentUser.getIdToken(true);
        // console.log('Updated anonymous user displayName.');
        // auth.currentUser.getIdTokenResult(true).then((token) => console.log(token));
      })
      .then(() => {
        this.canUpdateParticipant = true;
        return setDoc(this.participant, participantInfo);
      })
      .catch((error) => {
        Sentry.captureException(error, { tags: { step: 'updateAuthProfile' } });
        console.error(error);
      });
  }

  updateParticipant(updateData, timestampKey, batch) {
    if (this.participant === null || this.participant === undefined) {
      console.error('Called updateParticipant before creating the participant');
      return Promise.reject(new Error('Called updateParticipant before creating the participant'));
    }

    if (!updateData && !timestampKey) {
      console.error(`updateParticipant called with no data (${updateData}) or timestamp key (${timestampKey})`);
      return Promise.reject(new Error(`updateParticipant called with no data (${updateData}) or timestamp key (${timestampKey})`));
    }

    if (typeof updateData === 'undefined') {
      updateData = {};
    }

    if (typeof timestampKey !== 'undefined') {
      updateData[`timestamps.${timestampKey}`] = serverTimestamp();
    }

    if (!this.canUpdateParticipant) {
      this.pendingParticipantUpdate = Object.assign(this.pendingParticipantUpdate, updateData);
    } else {
      if (Object.keys(this.pendingParticipantUpdate).length) {
        updateData = Object.assign(updateData, this.pendingParticipantUpdate);
        this.pendingParticipantUpdate = {};
      } 

      if (typeof batch !== 'undefined') {
        return batch.update(this.participant, updateData);
  
      } else {
        // console.log(this.participant);
        // console.log(updateData);
        this.firestorePromises.push(updateDoc(this.participant, updateData));
      }
    }
  }

  batchSaveEventsAndUpdateParticipant(updateData, timestampKey) {
    this.setState({
      savingReplayEvents: true,
    });

    let collectionKey, additionalFields, additionalFieldsType;

    if (!this.state.replayKey) {
      console.error(`Cannot call batchSaveEventsAndUpdateParticipant without this.state.replayKey being set`);
      return;
    }
    
    if (typeof this.state.replayKey === 'function') {
      collectionKey = this.state.replayKey();
    } else {
      collectionKey = this.state.replayKey;
    }
  
    if (typeof this.state.replayAdditionalFields !== 'undefined') {
      additionalFields = this.state.replayAdditionalFields;
      additionalFieldsType = typeof additionalFields;
    }

    const replayEvents = this.state.replayEvents;
    console.log(`Saving events with key ${collectionKey}, found ${replayEvents.length} total events`);

    if (additionalFields) {
      if (additionalFieldsType === 'object') {
        replayEvents.forEach((replayEvent) => Object.assign(replayEvent, additionalFields));
      } else if (additionalFieldsType === 'function') {
        replayEvents.forEach((replayEvent) => Object.assign(replayEvent, additionalFields(replayEvent)));
      } else {
        console.warn(`in batchSaveEventsAndUpdate, found additionalFields of unexpected type ${additionalFieldsType}`);
      }
    }

    let replayLength = replayEvents.length;

    const replayBatchData = {
      batchIndex: this.state.replayBatchIndex,
      replay: collectionKey,
      events: replayEvents,
      numEvents: replayLength,
    };

    if (replayLength > 0) {
      replayBatchData.startEventIndex = replayEvents[0].index;
      replayBatchData.startEventOriginalIndex = replayEvents[0].index;
      replayBatchData.endEventIndex = replayEvents[replayEvents.length - 1].index;
      replayBatchData.endEventOriginalIndex = replayEvents[replayEvents.length - 1].index;
    }
    
    const batchDocument = doc(db, this.collection, this.participant.id, `replay-${collectionKey}`, `batch-${this.state.replayBatchIndex}`);
    this.firestorePromises.push(setDoc(batchDocument, replayBatchData));

    if (replayLength > 0 || typeof updateData !== 'undefined' || typeof timestampKey === 'undefined') {
      if (typeof updateData === 'undefined') updateData = {};
      if (replayLength > 0) {
        if (collectionKey in this.state.replayLengths) {
          replayLength = replayLength + this.state.replayLengths[collectionKey];
        }
        updateData[`replays.${collectionKey}`] = replayLength;
      }
      this.updateParticipant(updateData, timestampKey);
    }

    // console.warn(`After saving, current length: ${sparseStates.length} replay length: ${replayLength}, eventStartIndex: ${this.state.replayEventStartIndex}`);

    this.setState({
      replayBatchIndex: this.state.replayBatchIndex + 1,
      replayBatchSize: 0,
      replayEvents: [...this.state.replayEventBuffer],
      replayEventBuffer: [],
      replayLengths: {
        [collectionKey]: replayLength,
      },
      savingReplayEvents: false,
    });
  }

  quizPassed(passAttempt) {
    this.setState({
      displayUnity: true,
      displayInstructionzQuiz: false,
      replayKey: 'tutorial',
    }, () => {
      if (this.state.unityReady) {
        unityContext.send('FPSController', 'Show');
        this.unityHtmlSetup()
      }
    });

    this.updateParticipant({quizPassedAttempt: passAttempt}, 'quizPassed');
  }

  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  endPhaseSaveEventsAndUpdateState(particpantUpdateData, timestampKey, stateUpdate, stateUpdateCallback = this.resetScene) {
    this.batchSaveEventsAndUpdateParticipant(particpantUpdateData, timestampKey);
    if (!stateUpdateCallback) stateUpdateCallback = undefined;
    this.setState(stateUpdate, stateUpdateCallback);
  }

  tutorialFinished() {
    const scene = 'scene' in this.getParams && SCENES.includes(this.getParams['scene']) ? this.getParams['scene'] : this.randomChoice(SCENES);
    const stateUpdate = {
      displayTutorial: false,
      createGameStep: CREATE_GAME_STEPS.INSTRUCTIONS,
      scene: scene,
      replayKey: 'preCreateGame',
    };
    this.endPhaseSaveEventsAndUpdateState({ scene: scene }, 'tutorialFinished', stateUpdate);
  }

  gameReady() {
    const stateUpdate = {
      createGameStep: CREATE_GAME_STEPS.GAME_CREATE,
      replayKey: 'createGame',
    };
    this.endPhaseSaveEventsAndUpdateState(undefined, 'gameReady', stateUpdate);
  }

  gameSubmitted(game) {
    const stateUpdate = {
      createGameStep: CREATE_GAME_STEPS.GAME_PLAY,
      title: 'Setup the room for your game',
      replayKey: () => { return `gameplay-attempt-${this.state.gameplayAttempt}` },
      replayAdditionalFields: (event) => {
        return {
          gameplayAttempt: this.state.gameplayAttempt,
          gameplayPhase:
            ((typeof this.state.gameplaySetupCompleteIndex === 'undefined') || (event.index < this.state.gameplaySetupCompleteIndex)) ? 'setup' : 'gameplay',
        };
      },
      gameplaySetupCompleteIndex: null,
    };

    this.endPhaseSaveEventsAndUpdateState({ initialGame: { ...game } }, 'gameSubmitted', stateUpdate)
  }

  gameplayStartOver() {
    const stateUpdate = {
      title: 'Setup the room for your game',
    };

    this.endPhaseSaveEventsAndUpdateState(undefined, `gameplayReset${this.state.gameplayAttempt}`, stateUpdate);
  }

  gameplaySetupComplete() {
    this.setState({
      gameplaySetupCompleteIndex: (this.state.replayBatchIndex * FIRESTORE_MAX_BATCH_SIZE) + this.state.replayEvents.length,
      title: 'Play your game',
    })
  }

  async gameplayComplete() {
    const stateUpdate = {
      createGameStep: CREATE_GAME_STEPS.GAME_SCORE,
      title: 'Score your gameplay',
    };

    this.endPhaseSaveEventsAndUpdateState({ lastGameplayAttempt: this.state.gameplayAttempt }, 'gameplayComplete', stateUpdate, null);
  }

  gameScoreSubmitted(score) {
    this.updateParticipant({gameScore: {...score}}, 'scoreSubmitted');

    this.setState({
      createGameStep: CREATE_GAME_STEPS.GAME_EDIT,
      replayKey: 'editGame',
      title: 'Edit your game',
    }, this.resetScene);
  }

  gameEditSubmitted(game) {
    const stateUpdate = {
      createGameStep: CREATE_GAME_STEPS.FREE_PLAY,
      replayKey: 'freePlay',
      title: 'Free play',
    };

    this.endPhaseSaveEventsAndUpdateState({ editedGame: { ...game } }, 'gameEdited', stateUpdate);
  }

  endFreePlay() {
    const stateUpdate = {
      displayUnity: false,
      displayDebrief: true,
      title: null,
    };
    this.endPhaseSaveEventsAndUpdateState(undefined, 'endFreePlay', stateUpdate, () => {unityContext.send('FPSController', 'Hide')})
  }

  debriefSubmitted(debrief) {
    this.updateParticipant({ debrief: { ...debrief } }, 'debriefSubmitted');
  }

  endExperiment() {
    this.updateParticipant({}, 'experimentEnd');
    Promise.allSettled(this.firestorePromises).then((values) => {
      console.log(`All promises resolved:`);
      values.forEach((value) => console.log(value));
      if (DEBUG) {
        alert('Thank you!');
      } else {
        window.location.assign(PROLIFIC_REDIRECT_URL);
      }
    }).catch((error) => {
      Sentry.captureException(error, { tags: { step: 'endExperiment' } });
      console.error(error);
    });
  }

  render() {
    return (
      <div className="App grid grid-cols-6 gap-4 flex-grow max-w-90">

        <div className="col-span-4 flex-grow space-y-2">
          {this.state.displayConsent && <ConsentForm consentResponse={this.consentResponse} />}
          {(!this.state.displayUnity && this.state.displayNoConsent) && <NoConsent />}
          {(!this.state.displayUnity && this.state.displayIDVerification) && <IDVerification idVerified={this.idVerified} id={this.state.participantId} />}
          {(!this.state.displayUnity && this.state.displayInstructionzQuiz) && <InstructionsQuiz quizPassed={this.quizPassed} step={(DEBUG && ('QUIZ_STEP' in this.getParams)) ? this.getParams['QUIZ_STEP'] : null}  />} 
          {(!this.state.displayUnity && this.state.displayDebrief) && <Debrief debriefSubmitted={this.debriefSubmitted} endExperiment={this.endExperiment} />}
          {this.state.displayUnity && <div className="row section-title">{`Game Creation Experiment${this.state.title ? ' \u2014 ' + this.state.title : ''}${DEBUG && this.participant != null ? ' (' + this.participant.id + ')' : ''}`}</div>}
          <div
            className={`aspect-w-16 aspect-h-10 ${!this.state.displayUnity ? 'hidden' : ''} border-4 border-blue-700 rounded ${this.state.unityInPointerLock ? 'border-opacity-100' : 'border-opacity-0'}`}
            onClick={this.state.displayUnity ? this.handleClick : undefined}
          >
            <Unity unityContext={unityContext} />
            {/*  innerRef={this.unityRef} unityContent={unityContent} /> */}
          </div>
          {/* TODO: better loading solution if need be */}
          <div className="mt-2">
            {(this.state.displayUnity && !this.state.unityReady) && <ProgressBar completed={Math.round(this.state.loadingProgress * 100)} baseBgColor="#C4B5FD" bgColor="#6D28D9" />}
            {/* baseBgColor="#bfdbfe" bgColor="#2563eb" */}
          </div>

          {this.state.displayUnity && <Controls resetScene={this.resetScene} triggerReplay={this.triggerReplay} vertical={false} />}
          
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {(this.state.displayUnity && this.state.displayTutorial) &&
              <Tutorial
                ref={this.tutorialRef}
                // currentInstruction={10}
                currentInstruction={(DEBUG && ('TUTORIAL_INSTRUCTION' in this.getParams)) ? parseInt(this.getParams['TUTORIAL_INSTRUCTION']) : 0}
                finishTutorial={this.tutorialFinished}
              />
            }
            {this.state.displayUnity && this.state.createGameStep &&
              <CreateGame
                ref={this.createGameRef}
                step={this.state.createGameStep}
                resetScene={this.resetScene}
                gameReady={this.gameReady}
                gameSubmitted={this.gameSubmitted}
                gameplayStartOver={this.gameplayStartOver}
                gameplaySetupComplete={this.gameplaySetupComplete}
                gameplayComplete={this.gameplayComplete}
                gameScoreSubmitted={this.gameScoreSubmitted}
                gameEditSubmitted={this.gameEditSubmitted}
                endFreePlay={this.endFreePlay}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
