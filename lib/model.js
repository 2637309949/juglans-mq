// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

function MemoModel () {
  if (!(this instanceof MemoModel)) {
    return new MemoModel()
  }
  this.db = []
}

MemoModel.prototype.saveTask = async function ({ type, body, _created, _creator, status }) {
  const id = Math.random().toString(36).substring(7)
  this.db.push({ id, type, body, _created, _creator, status })
}

MemoModel.prototype.findTask = async function ({ type, status }) {
  return this.db.filter(x => x.type === type && x.status === status)
}

MemoModel.prototype.updateTask = async function (task, { status }) {
  const one = this.db.find(x => x.id === task.id)
  if (one) {
    one.status = status
  }
}

module.exports.MemoModel = MemoModel
