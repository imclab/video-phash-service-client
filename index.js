
var Promise = require('native-or-bluebird');
var request = require('requisition');
var error = require('http-errors');
var crypto = require('crypto');

var config = require('./config');

module.exports = function get_phashes(url) {
  return request(encrypt(url)).then(function (response) {
    return response.json().catch(noop).then(function (body) {
      if (response.status === 200) return body;

      if (response.status === 202) {
        return new Promise(function (resolve) {
          setTimeout(resolve, config.timeout);
        }).then(get_phashes.bind(null, url));
      }

      throw error(response.status, body ? body.message : '');
    })
  })
}

function encrypt(url) {
  var cipher = crypto.createCipher('aes256', config.password);
  var buffers = [];
  buffers.push(cipher.update(url));
  buffers.push(cipher.final());
  return config.host + '/' + Buffer.concat(buffers).toString('hex');
}

function noop() {}
