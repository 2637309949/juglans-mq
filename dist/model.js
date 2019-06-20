"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
function MemoModel() {
  if (!(this instanceof MemoModel)) {
    return new MemoModel();
  }

  this.db = [];
}

MemoModel.prototype.saveTask =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (_ref) {
    let {
      type,
      body,
      _created,
      _creator,
      status
    } = _ref;
    const id = Math.random().toString(36).substring(7);
    this.db.push({
      id,
      type,
      body,
      _created,
      _creator,
      status
    });
  });

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

MemoModel.prototype.findTask =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    let {
      type,
      status
    } = _ref3;
    return this.db.filter(x => x.type === type && x.status === status);
  });

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();

MemoModel.prototype.updateTask =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (task, _ref5) {
    let {
      status
    } = _ref5;
    const one = this.db.find(x => x.id === task.id);

    if (one) {
      one.status = status;
    }
  });

  return function (_x3, _x4) {
    return _ref6.apply(this, arguments);
  };
}();

module.exports.MemoModel = MemoModel;