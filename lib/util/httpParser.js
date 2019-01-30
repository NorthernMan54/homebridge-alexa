// Borrowed and heaviliy modifed from https://github.com/miguelmota/http-message-parser

var Buffer = require('buffer/').Buffer;
var debug = require('debug')('httpParser');

function httpMessageParser(message) {
  const result = {
    protocol: null,
    httpVersion: null,
    statusCode: null,
    statusMessage: null,
    method: null,
    url: null,
    headers: null,
    body: null,
    boundary: null,
    multipart: null
  };

  var messageString = '';
  var headerNewlineIndex = 0;
  var fullBoundary = null;

  if (httpMessageParser._isBuffer(message)) {
    messageString = message.toString();
  } else if (typeof message === 'string') {
    messageString = message;
    message = httpMessageParser._createBuffer(messageString);
  } else {
    return result;
  }

  /*
   * Strip extra return characters
   */
  messageString = messageString.replace(/\r\n/gim, '\n');

  /*
   * Trim leading whitespace
   */
  (function() {
    const firstNonWhitespaceRegex = /[\w-]+/gim;
    const firstNonWhitespaceIndex = messageString.search(firstNonWhitespaceRegex);
    if (firstNonWhitespaceIndex > 0) {
      message = message.slice(firstNonWhitespaceIndex, message.length);
      messageString = message.toString();
    }
  })();

  /* Parse request line
   */
  (function() {
    const possibleRequestLine = messageString.split(/\n|\r\n/)[0];
    const requestLineMatch = possibleRequestLine.match(httpMessageParser._requestLineRegex);

    if (Array.isArray(requestLineMatch) && requestLineMatch.length > 1) {
      result.protocol = requestLineMatch[1];
      result.httpVersion = parseFloat(requestLineMatch[2]);
      result.statusCode = parseInt(requestLineMatch[3]);
      result.statusMessage = requestLineMatch[4];
    } else {
      const responseLineMath = possibleRequestLine.match(httpMessageParser._responseLineRegex);
      if (Array.isArray(responseLineMath) && responseLineMath.length > 1) {
        result.method = responseLineMath[1];
        result.url = responseLineMath[2];
        result.httpVersion = parseFloat(responseLineMath[3]);
      }
    }
  })();

  /* Parse headers
   */
  (function() {
    headerNewlineIndex = messageString.search(httpMessageParser._headerNewlineRegex);
    if (headerNewlineIndex > -1) {
      headerNewlineIndex = headerNewlineIndex + 1; // 1 for newline length
    } else {
      /* There's no line breaks so check if request line exists
       * because the message might be all headers and no body
       */
      if (result.httpVersion) {
        headerNewlineIndex = messageString.length;
      }
    }

    const headersString = messageString.substr(0, headerNewlineIndex);
    const headers = httpMessageParser._parseHeaders(headersString);

    if (Object.keys(headers).length > 0) {
      result.headers = headers;

      // TOOD: extract boundary.
    }
  })();

  /* Try to get boundary if no boundary header
   */
  (function() {
    if (!result.boundary) {
      const boundaryMatch = messageString.match(httpMessageParser._boundaryRegex);

      if (Array.isArray(boundaryMatch) && boundaryMatch.length) {
        fullBoundary = boundaryMatch[0].replace(/[\r\n]+/gi, '');
        const boundary = fullBoundary.replace(/^--/, '');
        result.boundary = boundary;
      }
    }
  })();

  /* Parse body
   */
  (function() {
    var start = headerNewlineIndex;
    var end = (result.headers['Content-Length'] ? result.headers['Content-Length'] + start : messageString.length);
    const firstBoundaryIndex = messageString.indexOf(fullBoundary);

    if (firstBoundaryIndex > -1 && result.boundary) {
      start = headerNewlineIndex;
      end = firstBoundaryIndex;
    }

    if (headerNewlineIndex > -1) {
      const body = messageString.slice(start, end);
      // console.log("Lengths: total %s -> start %s -> end %s -> final %s", messageString.length, start, end, body.length);

      if (body && body.length) {
        if (result.headers['Content-Type'] === 'application/hap+json' || result.headers['Content-Type'] === 'application/json') {
          // JSON.parse JSON message's
          try {
            if (result.headers['Content-Length']) {
              result.body = JSON.parse(body);
            } else {
              result.body = JSON.parse(body.split('\n')[1]);
            }
          } catch (err) {

          }
        } else {
          result.body = body;
        }
      }
    }
  })();

  /* Parse multipart sections
   */
  (function() {
    if (result.boundary) {
      const multipartStart = messageString.indexOf(fullBoundary) + fullBoundary.length;
      const multipartEnd = messageString.lastIndexOf(fullBoundary);
      const multipartBody = messageString.substr(multipartStart, multipartEnd);
      const splitRegex = new RegExp('^' + fullBoundary + '.*[\n\r]?$', 'gm');
      const parts = multipartBody.split(splitRegex);

      result.multipart = parts.filter(httpMessageParser._isTruthy).map(function(part, i) {
        const result = {
          headers: null,
          body: null,
          meta: {
            body: {
              byteOffset: {
                start: null,
                end: null
              }
            }
          }
        };

        const newlineRegex = /\n\n|\r\n\r\n/gim;
        var newlineIndex = 0;
        var newlineMatch = newlineRegex.exec(part);
        var body = null;

        if (newlineMatch) {
          newlineIndex = newlineMatch.index;
          if (newlineMatch.index <= 0) {
            newlineMatch = newlineRegex.exec(part);
            if (newlineMatch) {
              newlineIndex = newlineMatch.index;
            }
          }
        }

        const possibleHeadersString = part.substr(0, newlineIndex);

        var startOffset = null;
        var endOffset = null;

        if (newlineIndex > -1) {
          const headers = httpMessageParser._parseHeaders(possibleHeadersString);
          if (Object.keys(headers).length > 0) {
            result.headers = headers;

            var boundaryIndexes = [];
            for (var j = 0; j >= 0;) {
              j = message.indexOf(fullBoundary, j);

              if (j >= 0) {
                boundaryIndexes.push(j);
                j += fullBoundary.length;
              }
            }

            var boundaryNewlineIndexes = [];
            boundaryIndexes.slice(0, boundaryIndexes.length - 1).forEach(function(m, k) {
              const partBody = message.slice(boundaryIndexes[k], boundaryIndexes[k + 1]).toString();
              var headerNewlineIndex = partBody.search(/\n\n|\r\n\r\n/gim) + 2;
              headerNewlineIndex = boundaryIndexes[k] + headerNewlineIndex;
              boundaryNewlineIndexes.push(headerNewlineIndex);
            });

            startOffset = boundaryNewlineIndexes[i];
            endOffset = boundaryIndexes[i + 1];
            body = message.slice(startOffset, endOffset);
          } else {
            body = part;
          }
        } else {
          body = part;
        }

        result.body = body;
        result.meta.body.byteOffset.start = startOffset;
        result.meta.body.byteOffset.end = endOffset;

        return result;
      });
    }
  })();

  return result;
}

httpMessageParser._isTruthy = function _isTruthy(v) {
  return !!v;
};

httpMessageParser._isNumeric = function _isNumeric(v) {
  if (typeof v === 'number' && !isNaN(v)) {
    return true;
  }

  v = (v || '').toString().trim();

  if (!v) {
    return false;
  }

  return !isNaN(v);
};

httpMessageParser._isBuffer = function(item) {
  return ((httpMessageParser._isNodeBufferSupported() &&
      typeof global === 'object' &&
      global.Buffer.isBuffer(item)) ||
    (item instanceof Object &&
      item._isBuffer));
};

httpMessageParser._isNodeBufferSupported = function() {
  return (typeof global === 'object' &&
    typeof global.Buffer === 'function' &&
    typeof global.Buffer.isBuffer === 'function');
};

httpMessageParser._parseHeaders = function _parseHeaders(body) {
  const headers = {};

  if (typeof body !== 'string') {
    return headers;
  }

  body.split(/[\r\n]/).forEach(function(string) {
    const match = string.match(/([\w-]+):\s*(.*)/i);

    if (Array.isArray(match) && match.length === 3) {
      const key = match[1];
      const value = match[2];

      headers[key] = httpMessageParser._isNumeric(value) ? Number(value) : value;
    }
  });

  return headers;
};

httpMessageParser._requestLineRegex = /(HTTP|EVENT)\/(1\.0|1\.1|2\.0)\s+(\d+)\s+([\w\s-_]+)/i;
httpMessageParser._responseLineRegex = /(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD|TRACE|CONNECT)\s+(.*)\s+HTTP\/(1\.0|1\.1|2\.0)/i;
// httpMessageParser._headerNewlineRegex = /^[\r\n]+/gim;
httpMessageParser._headerNewlineRegex = /^[\r\n]+/gim;
httpMessageParser._boundaryRegex = /(\n|\r\n)+--[\w-]+(\n|\r\n)+/g;

httpMessageParser._createBuffer = function(data) {
  return new Buffer(data);
};

httpMessageParser._isInBrowser = function() {
  return !(typeof process === 'object' && process + '' === '[object process]');
};

if (httpMessageParser._isInBrowser) {
  if (typeof window === 'object') {
    window.httpMessageParser = httpMessageParser;
  }
}

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = httpMessageParser;
  }
  exports.httpMessageParser = httpMessageParser;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return httpMessageParser;
  });
}
