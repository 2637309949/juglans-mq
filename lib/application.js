// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const moment = require('moment')
const deepmerge = require('deepmerge')
const assert = require('assert').strict
const is = require('is')
const logger = require('./logger')
const Memo = require('./model').Memo()

const defaultOpts = {
  tactics: [
    {
      tactic: {
        interval: 3,
        asyncCount: 2
      }
    }
  ],
  model: null,
  exector: []
}

function Queue ({ tactics, model, exector } = { tactics: [], model: null, exector: [] }) {
  if (!(this instanceof Queue)) {
    return new Queue({ tactics, model, exector })
  }
  this.tactics = tactics || []
  const opts = deepmerge.all([defaultOpts, { tactics, model, exector }])
  tactics = opts.tactics
  model = opts.model
  exector = opts.exector
  if (this.tactics.filter(x => x.type === undefined || x.type === null || x.type === '').length === 0) {
    this.tactics.push({
      tactic: {
        interval: 3,
        asyncCount: 1
      }
    })
  }
  this.exector = exector || []
  this.model = model || Memo
  this.interval = []
  this.loop()
}

Queue.prototype.setModel = function (model) {
  this.model = model
  return this
}

Queue.prototype.addTactics = function (type, tactic) {
  assert.ok(is.string(type), 'type can not be empty!')
  assert.ok(is.object(tactic), 'tactic can not be empty!')
  const one = this.tactics.find(x => x.type === type)
  if (!one) {
    this.tactics.push({
      type,
      tactic
    })
  } else {
    one.tactic = tactic
  }
  this.loop()
  return this
}

Queue.prototype.stopTactic = function () {
  for (const inv of this.interval) {
    clearInterval(inv)
  }
  this.interval = []
}

Queue.prototype.loop = function () {
  this.stopTactic()
  this.startTactic()
  return this
}

Queue.prototype.startTactic = function () {
  const _this = this
  for (const item of this.tactics) {
    const inv = setInterval((item => async function ({type, tactic: { asyncCount = 1 }} = item) {
      let exector
      if (!type) {
        exector = _this.exector.filter(x => _this.tactics.find(t => t.type === x.type) === undefined)
      } else {
        exector = _this.exector.filter(x => x.type === type)
      }
      for (const exec of exector) {
        const {type, handler} = exec
        const pTaskCount = await _this.model.count({ type, status: Queue.status.PROCESSING })
        let task = await _this.model.find({ type, status: Queue.status.INIT })
        if (pTaskCount < asyncCount && task) {
          try {
            await _this.model.update(task, { status: Queue.status.PROCESSING })
            await handler(task)
            await _this.model.update(task, { status: Queue.status.SUCCEED })
          } catch (error) {
            await _this.model.update(task, { status: Queue.status.FAILED })
            logger.error(error)
          }
        }
      }
    })(item), item.tactic.interval * 1000)
    this.interval.push(inv)
  }
  return this
}

Queue.prototype.Push = function ({ type, body, _creator }) {
  const _created = moment().unix()
  const status = Queue.status.INIT
  this.model.save({ type, body, _created, _creator, status })
  return this
}

Queue.prototype.Register = function (type, handler) {
  assert.ok(is.string(type), 'type can not be empty!')
  assert.ok(is.function(handler), 'handler can not be empty!')
  this.exector.push({
    type, handler
  })
  return this
}

Queue.status = {
  INIT: 'INIT',
  FAILED: 'FAILED',
  SUCCEED: 'SUCCEED',
  PROCESSING: 'PROCESSING'
}

module.exports = ({ tactics, model, exector } = { tactics: [], model: null, exector: [] }) => () => {
  return {
    queue: Queue({ tactics, model, exector })
  }
}
