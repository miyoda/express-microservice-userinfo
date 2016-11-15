'use strict';

module.exports = {
  "api_keys": ["1234"]
  ,"jwt": {
    "secretOrKey": "MY_SECRET"
  }
  ,"fields": {
    email: {type: String, index: { unique: true }},
    fullname: {type: String },
    birthday: {type: Date },
    gender: {type: String },
    phone: {type: Number, index: true},
    verifiedPhone: {type: Boolean },
    language: {type: String},
    photos: {type: [String]}
  }
}
