!function(n){"use strict";function t(n){if(!(this instanceof t))return new t(n);if(null==n)n=t.engines.nativeMath;else if("function"!=typeof n)throw new TypeError("Expected engine to be a function, got "+typeof n);this.engine=n}function r(n){return function(){return n}}function e(n,t){return 0===t?n:function(r){return n(r)+t}}function i(n){var t=+n;return 0>t?Math.ceil(t):Math.floor(t)}function u(n,t){return 0>n?Math.max(n+t,0):Math.min(n,t)}function o(){return void 0}var f="Random",c="function"!=typeof Math.imul||-5!==Math.imul(4294967295,5)?function(n,t){var r=n>>>16&65535,e=65535&n,i=t>>>16&65535,u=65535&t;return e*u+(r*u+e*i<<16>>>0)|0}:Math.imul,a="function"==typeof String.prototype.repeat&&"xxx"==="x".repeat(3)?function(n,t){return n.repeat(t)}:function(n,t){for(var r="";t>0;)1&t&&(r+=n),t>>=1,n+=n;return r},l=t.prototype;t.engines={nativeMath:function(){return 4294967296*Math.random()>>>0},mt19937:function(n){function r(n){for(var t=0,r=0;227>(0|t);t=t+1|0)r=2147483648&n[t]|2147483647&n[t+1|0],n[t]=n[t+397|0]^r>>>1^(1&r?2567483615:0);for(;623>(0|t);t=t+1|0)r=2147483648&n[t]|2147483647&n[t+1|0],n[t]=n[t-227|0]^r>>>1^(1&r?2567483615:0);r=2147483648&n[623]|2147483647&n[0],n[623]=n[396]^r>>>1^(1&r?2567483615:0)}function e(n){return n^=n>>>11,n^=n<<7&2636928640,n^=n<<15&4022730752,n^n>>>18}function i(n,t){for(var r=1,e=0,i=t.length,u=0|Math.max(i,624),o=0|n[0];(0|u)>0;--u)n[r]=o=(n[r]^c(o^o>>>30,1664525))+(0|t[e])+(0|e)|0,r=r+1|0,++e,(0|r)>623&&(n[0]=n[623],r=1),e>=i&&(e=0);for(u=623;(0|u)>0;--u)n[r]=o=(n[r]^c(o^o>>>30,1566083941))-r|0,r=r+1|0,(0|r)>623&&(n[0]=n[623],r=1);n[0]=2147483648}function u(){function u(){(0|f)>=624&&(r(o),f=0);var n=o[f];return f=f+1|0,e(n)>>>0}var o=new n(624),f=0;return u.discard=function(n){for(;n-f>624;)n-=624-f,r(o),f=0;return f=f+n|0,u},u.seed=function(n){var t=0;o[0]=t=0|n;for(var r=1;624>r;r=r+1|0)o[r]=t=c(t^t>>>30,1812433253)+r|0;return f=624,u},u.seedWithArray=function(n){return u.seed(19650218),i(o,n),u},u.autoSeed=function(){return u.seedWithArray(t.generateEntropyArray())},u}return u}("function"==typeof Int32Array?Int32Array:Array),browserCrypto:"undefined"!=typeof crypto&&"function"==typeof crypto.getRandomValues&&"function"==typeof Uint32Array?function(){var n=null,t=128;return function(){return t>=128&&(null===n&&(n=new Uint32Array(128)),crypto.getRandomValues(n),t=0),n[t++]>>>0}}():null},t.generateEntropyArray=function(){var n=[];n.push(0|(new Date).getTime());for(var r=t.engines.nativeMath,e=0;16>e;++e)n[e]=0|r();return n},t.uint32=function(n){return n()>>>0},l.uint32=function(){return t.uint32(this.engine)},t.uint53=function(n){var t=2097151&n(),r=n()>>>0;return 4294967296*t+r},l.uint53=function(){return t.uint53(this.engine)},t.uint53Full=function(n){for(;;){var t=0|n();if(!(2097152&t)){var r=n()>>>0;return 4294967296*(2097151&t)+r}if(2097152===(4194303&t)&&0===(0|n()))return 9007199254740992}},l.uint53Full=function(){return t.uint53Full(this.engine)},t.int53=function(n){var t=0|n(),r=n()>>>0;return 4294967296*(2097151&t)+r+(2097152&t?-9007199254740992:0)},l.int53=function(){return t.int53(this.engine)},t.int53Full=function(n){for(;;){var t=0|n();if(!(4194304&t)){var r=n()>>>0;return 4294967296*(2097151&t)+r+(2097152&t?-9007199254740992:0)}if(4194304===(8388607&t)&&0===(0|n()))return 9007199254740992}},l.int53Full=function(){return t.int53Full(this.engine)},t.integer=function(){function n(n){return 0===(n+1&n)}function i(n){return function(t){return t()&n}}function u(n){var t=n+1,r=t*Math.floor(4294967296/t);return function(n){var e=0;do e=n()>>>0;while(e>=r);return e%t}}function o(t){return n(t)?i(t):u(t)}function f(n){return 0===(0|n)}function c(n){return function(t){var r=t()&n,e=t()>>>0;return 4294967296*r+e}}function a(n){var t=n*Math.floor(9007199254740992/n);return function(r){var e=0;do{var i=2097151&r(),u=r()>>>0;e=4294967296*i+u}while(e>=t);return e%n}}function l(t){var r=t+1;if(f(r)){var e=(r/4294967296|0)-1;if(n(e))return c(e)}return a(r)}function h(n,t){return function(r){var e=0;do{var i=0|r(),u=r()>>>0;e=4294967296*(2097151&i)+u+(2097152&i?-9007199254740992:0)}while(n>e||e>t);return e}}return function(n,i){if(n=Math.floor(n),i=Math.floor(i),-9007199254740992>n||!isFinite(n))throw new RangeError("Expected min to be at least -9007199254740992");if(i>9007199254740992||!isFinite(i))throw new RangeError("Expected max to be at most 9007199254740992");var u=i-n;return 0>=u||!isFinite(u)?r(n):4294967295===u?e(t.uint32,n):4294967295>u?e(o(u),n):9007199254740991===u?e(t.uint53,n):9007199254740991>u?e(l(u),n):i-1-n===9007199254740991?e(t.uint53Full,n):-9007199254740992===n&&9007199254740992===i?t.int53Full:-9007199254740992===n&&9007199254740991===i?t.int53:-9007199254740991===n&&9007199254740992===i?e(t.int53,1):9007199254740992===i?e(h(n-1,i-1),1):h(n,i)}}(),l.integer=function(n,r){return t.integer(n,r)(this.engine)},t.realZeroToOneInclusive=function(n){return t.uint53Full(n)/9007199254740992},l.realZeroToOneInclusive=function(){return t.realZeroToOneInclusive(this.engine)},t.realZeroToOneExclusive=function(n){return t.uint53(n)/9007199254740992},l.realZeroToOneExclusive=function(){return t.realZeroToOneExclusive(this.engine)},t.real=function(){function n(n,t){return 1===t?n:0===t?function(){return 0}:function(r){return n(r)*t}}return function(r,i,u){if(!isFinite(r))throw new RangeError("Expected left to be a finite number");if(!isFinite(i))throw new RangeError("Expected right to be a finite number");return e(n(u?t.realZeroToOneInclusive:t.realZeroToOneExclusive,i-r),r)}}(),l.real=function(n,r,e){return t.real(n,r,e)(this.engine)},t.bool=function(){function n(n){return 1===(1&n())}function e(n,t){return function(r){return n(r)<t}}function i(n){if(0>=n)return r(!1);if(n>=1)return r(!0);var i=4294967296*n;return i%1===0?e(t.uint32,i):e(t.uint53,Math.round(9007199254740992*n))}return function(u,o){return null==o?null==u?n:i(u):0>=u?r(!1):u>=o?r(!0):e(t.integer(0,o-1),u)}}(),l.bool=function(n,r){return t.bool(n,r)(this.engine)},t.pick=function(n,r,e,o){var f=r.length>>>0,c=null==e?0:u(i(e),f),a=void 0===o?f:u(i(o),f);if(c>=a)return void 0;var l=t.integer(c,a-1);return r[l(n)]},l.pick=function(n,r,e){return t.pick(this.engine,n,r,e)};var h=Array.prototype.slice;t.picker=function(n,r,e){var i=h.call(n,r,e);if(0===i.length)return o;var u=t.integer(0,i.length-1);return function(n){return i[u(n)]}},t.shuffle=function(n,r,e){var i=r.length;if(0!==i){null==e&&(e=0);for(var u=i-1>>>0;u>e;--u){var o=t.integer(0,u),f=o(n);if(u!==f){var c=r[u];r[u]=r[f],r[f]=c}}}return r},l.shuffle=function(n){return t.shuffle(this.engine,n)},t.sample=function(n,r,e){if(0>e||e>r.length||!isFinite(e))throw new RangeError("Expected sampleSize to be within 0 and the length of the population");if(0===e)return[];var i=h.call(r),u=i.length;if(u===e)return t.shuffle(n,i,0);var o=u-e;return t.shuffle(n,i,o).slice(o)},l.sample=function(n,r){return t.sample(this.engine,n,r)},t.die=function(n){return t.integer(1,n)},l.die=function(n){return t.die(n)(this.engine)},t.dice=function(n,r){var e=t.die(n);return function(n){var t=[];t.length=r;for(var i=0;r>i;++i)t[i]=e(n);return t}},l.dice=function(n,r){return t.dice(n,r)(this.engine)},t.uuid4=function(){function n(n,t){return a("0",t-n.length)+n}return function(t){var r=t()>>>0,e=t()>>>0,i=t()>>>0,u=t()>>>0;return n(r.toString(16),8)+"-"+n((65535&e).toString(16),4)+"-"+n((e>>>4&4095|16384).toString(16),4)+"-"+n((16383&i|32768).toString(16),4)+"-"+n((i>>>4&65535).toString(16),4)+n(u.toString(16),8)}}(),l.uuid4=function(){return t.uuid4(this.engine)},t.string=function(){var n="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";return function(r){null==r&&(r=n);var e=r.length>>>0;if(0===e)throw new Error("Expected pool not to be an empty string");var i=t.integer(0,e-1);return function(n,t){for(var e="",u=0;t>u;++u){var o=i(n);e+=r.charAt(o)}return e}}}(),l.string=function(n,r){return t.string(r)(this.engine,n)},t.hex=function(){var n="0123456789abcdef",r=t.string(n),e=t.string(n.toUpperCase());return function(n){return n?e:r}}(),l.hex=function(n,r){return t.hex(r)(this.engine,n)},"function"==typeof define&&define.amd?define(function(){return t}):"undefined"!=typeof module&&"function"==typeof require?module.exports=t:(!function(){var r=n[f];t.noConflict=function(){return n[f]=r,this}}(),n[f]=t)}(this);