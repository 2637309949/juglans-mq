"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const _ = require('lodash');

const moment = require('moment');

const deepmerge = require('deepmerge');

const assert = require('assert').strict;

const is = require('is');

const logger = require('./logger');

const MemoModel = require('./model').MemoModel();

const defaultOpts = {
  tactics: [{
    tactic: {
      interval: 3,
      ctCount: 2
    }
  }],
  model: null,
  exector: []
};

function Queue() {
  let {
    tactics,
    model,
    exector
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    tactics: [],
    model: null,
    exector: []
  };

  if (!(this instanceof Queue)) {
    return new Queue({
      tactics,
      model,
      exector
    });
  }

  this.tactics = tactics || [];
  const opts = deepmerge.all([defaultOpts, {
    tactics,
    model,
    exector
  }]);
  tactics = opts.tactics;
  model = opts.model;
  exector = opts.exector;

  if (this.tactics.filter(x => x.type === undefined || x.type === null || x.type === '')) {
    this.tactics.push({
      tactic: {
        interval: 3,
        ctCount: 1
      }
    });
  }

  this.exector = exector || [];
  this.model = model || MemoModel;
  this.interval = [];
  this.loop();
}

Queue.prototype.setModel = function (model) {
  this.model = model;
  return this;
};

Queue.prototype.addTactics = function (type, tactic) {
  assert.ok(is.string(type), 'type can not be empty!');
  assert.ok(is.object(tactic), 'tactic can not be empty!');
  const one = this.tactics.find(x => x.type === type);

  if (!one) {
    this.tactics.push({
      type,
      tactic
    });
  } else {
    one.tactic = tactic;
  }

  this.loop();
  return this;
};

Queue.prototype.loop = function () {
  const _this = this;

  for (const inv of this.interval) {
    clearInterval(inv);
  }

  for (const tactic of this.tactics) {
    const {
      type,
      tactic: {
        interval,
        ctCount
      }
    } = tactic;
    setInterval(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      let exector;

      if (!type) {
        exector = _this.exector.filter(x => _this.tactics.find(t => t.type === x.type) === undefined);
      } else {
        exector = _this.exector.filter(x => x.type === type);
      }

      for (const exec of exector) {
        const {
          type,
          handler
        } = exec;
        const tasksProcessing = yield _this.model.findTask({
          type,
          status: Queue.status.PROCESSING
        });
        let tasksInit = yield _this.model.findTask({
          type,
          status: Queue.status.INIT
        });
        tasksInit = _.orderBy(tasksInit, ['_created', 'desc']);

        const task = _.first(tasksInit);

        if (tasksProcessing.length < ctCount && task) {
          try {
            yield _this.model.updateTask(task, {
              status: Queue.status.PROCESSING
            });
            yield handler(task);
            yield _this.model.updateTask(task, {
              status: Queue.status.SUCCEED
            });
          } catch (error) {
            yield _this.model.updateTask(task, {
              status: Queue.status.FAILED
            });
            logger.error(error);
          }
        }
      }
    }), interval * 1000);
  }

  return this;
};

Queue.prototype.Push = function (_ref2) {
  let {
    type,
    body,
    _creator
  } = _ref2;

  const _created = moment().unix();

  const status = Queue.status.INIT;
  this.model.saveTask({
    type,
    body,
    _created,
    _creator,
    status
  });
  return this;
};

Queue.prototype.Register = function (type, handler) {
  assert.ok(is.string(type), 'type can not be empty!');
  assert.ok(is.function(handler), 'handler can not be empty!');
  this.exector.push({
    type,
    handler
  });
  return this;
};

Queue.status = {
  INIT: 'INIT',
  FAILED: 'FAILED',
  SUCCEED: 'SUCCEED',
  PROCESSING: 'PROCESSING'
};

module.exports = function () {
  let {
    tactics,
    model,
    exector
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    tactics: [],
    model: null,
    exector: []
  };
  return () => {
    return {
      queue: Queue({
        tactics,
        model,
        exector
      })
    };
  };
};