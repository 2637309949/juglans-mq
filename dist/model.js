"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
function Memo() {
  if (!(this instanceof Memo)) {
    return new Memo();
  }

  this.db = [];
}

Memo.prototype.save =
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

Memo.prototype.find =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    let {
      type,
      status
    } = _ref3;
    return this.db.filter(x => x.type === type && x.status === status)[0];
  });

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();

Memo.prototype.count =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (_ref5) {
    let {
      type,
      status
    } = _ref5;
    return this.db.filter(x => x.type === type && x.status === status).length;
  });

  return function (_x3) {
    return _ref6.apply(this, arguments);
  };
}();

Memo.prototype.update =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(function* (task, _ref7) {
    let {
      status
    } = _ref7;
    const one = this.db.find(x => x.id === task.id);

    if (one) {
      one.status = status;
    }
  });

  return function (_x4, _x5) {
    return _ref8.apply(this, arguments);
  };
}();

module.exports.Memo = Memo;