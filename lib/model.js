// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

function Memo () {
  if (!(this instanceof Memo)) {
    return new Memo()
  }
  this.db = []
}

Memo.prototype.save = async function ({ type, body, _created, _creator, status }) {
  const id = Math.random().toString(36).substring(7)
  this.db.push({ id, type, body, _created, _creator, status })
}

Memo.prototype.find = async function ({ type, status }) {
  return this.db.filter(x => x.type === type && x.status === status)[0]
}

Memo.prototype.count = async function ({ type, status }) {
  return this.db.filter(x => x.type === type && x.status === status).length
}

Memo.prototype.update = async function (task, { status }) {
  const one = this.db.find(x => x.id === task.id)
  if (one) {
    one.status = status
  }
}

module.exports.Memo = Memo
