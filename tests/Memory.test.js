/* eslint-disable no-unused-vars */

window.__DEV__ = true;

import TestUtils from 'react-dom/test-utils';
import React from 'react';
import ReactDOM from 'react-dom';
import Ringa, {__hardReset} from '../src/index';
import TestController from './shared/TestController';
import CommandSimple from './shared/CommandSimple';

const TEST_EVENT = 'testEvent';
const TEST_EVENT2 = 'testEvent2';

describe('LifeCycle (event -> controller -> thread -> command', () => {
  let command, domNode, reactNode, threadFactory,
    threadFactory2, controller;

  beforeEach(() => {
    domNode = ReactDOM.findDOMNode(TestUtils.renderIntoDocument(
      <div>Controller Attach Point</div>
    ));

    controller = new TestController('testController', domNode, {
      timeout: 500
    });

    threadFactory = controller.addListener(TEST_EVENT);
    threadFactory2 = controller.addListener(TEST_EVENT2);
  });

  afterEach(() => {
    __hardReset();
  });

  //-----------------------------------
  // Memory -> 1 Command Cleanup Thread
  //-----------------------------------
  it('Memory -> 1 Command Cleanup Thread', (done) => {
    threadFactory.add(CommandSimple);

    let ringaEvent = Ringa.dispatch(TEST_EVENT, {testObject: {}}, domNode).addDoneListener(() => {
      expect(controller.threads._list.length).toEqual(0);
      done();
    });
  }, 50);

  //------------------------------------------------------------
  // Memory -> 100 EventExecutors Depth Cleanup Thread Test
  //------------------------------------------------------------
  it('Memory -> 100 CommandEventWrapper Sequence Test', (done) => {
    let _fin = false;

    for (let i = 0; i < 100; i++) {
      let eventType = 'TestEvent_' + i;
      let nextEventType = 'TestEvent_' + (i + 1);

      controller.addListener(eventType, [
        i < 99 ? nextEventType : () => {
          _fin = true;
          expect(controller.threads._list.length).toEqual(100);
        }
      ]);
    }

    Ringa.dispatch('TestEvent_0', undefined, domNode)
      .addDoneListener(() => {
        expect(controller.threads._list.length).toEqual(0);
        expect(_fin).toEqual(true);
        done();
      });
  }, 1000);
});
