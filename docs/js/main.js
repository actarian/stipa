/**
 * @license stipa v1.0.0
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(require('rxcomp'),require('rxcomp-form'),require('rxjs/operators'),require('rxjs')):typeof define==='function'&&define.amd?define(['rxcomp','rxcomp-form','rxjs/operators','rxjs'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.rxcomp,g.rxcomp.form,g.rxjs.operators,g.rxjs));}(this,(function(rxcomp, rxcompForm, operators, rxjs){'use strict';function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}var EDGE = /(edge)/i.test(navigator.userAgent);
var TRIDENT = /(msie|trident)/i.test(navigator.userAgent);
var BLINK = !!window.chrome && typeof CSS !== 'undefined' && !EDGE && !TRIDENT;
var WEBKIT = /AppleWebKit/i.test(navigator.userAgent) && !BLINK && !EDGE && !TRIDENT;
var IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
var FIREFOX = /(firefox|minefield)/i.test(navigator.userAgent);
var ANDROID = /android/i.test(navigator.userAgent) && !TRIDENT;
var SAFARI = /safari/i.test(navigator.userAgent) && WEBKIT;
var mediaQueriesForWebkitCompatibility = new Set();
var mediaQueryStyleNode;
var MediaMatcher = /*#__PURE__*/function () {
  function MediaMatcher() {}

  MediaMatcher.matchMedia = function matchMedia(query) {
    if (WEBKIT) {
      this.createEmptyStyleRule(query);
    }

    return this._matchMedia(query);
  };

  MediaMatcher.createEmptyStyleRule = function createEmptyStyleRule(query) {
    if (mediaQueriesForWebkitCompatibility.has(query)) {
      return;
    }

    try {
      if (!mediaQueryStyleNode) {
        mediaQueryStyleNode = document.createElement('style');
        mediaQueryStyleNode.setAttribute('type', 'text/css');

        if (document.head) {
          document.head.appendChild(mediaQueryStyleNode);
        }
      }

      if (mediaQueryStyleNode.sheet) {
        mediaQueryStyleNode.sheet.insertRule("@media " + query + " {.fx-query-test{ }}", 0);
        mediaQueriesForWebkitCompatibility.add(query);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return MediaMatcher;
}();

function noopMatchMedia(query) {
  return {
    matches: query === 'all' || query === '',
    media: query,
    addListener: function addListener() {},
    removeListener: function removeListener() {}
  };
}

MediaMatcher._matchMedia = window.matchMedia ? window.matchMedia.bind(window) : noopMatchMedia;var BreakpointService = /*#__PURE__*/function () {
  function BreakpointService() {}

  BreakpointService.observe$ = function observe$(value) {
    var _this = this;

    var queries = Object.assign({}, value); // this.splitQueries(coerceArray(value));

    var queries$_ = [];
    Object.keys(queries).forEach(function (key) {
      var query = queries[key];
      var group = query.split('and').map(function (query) {
        return query.trim();
      });
      group.forEach(function (query) {
        return queries$_.push(_this.registerQuery$_(query).query$);
      });
      queries[key] = {
        query: query,
        group: group
      };
    }); // let queries$_ = Object.keys(queries).map(key => this.registerQuery$_(queries[key]).query$);

    queries$_ = rxjs.combineLatest.apply(void 0, queries$_);
    var queries$ = rxjs.concat(queries$_.pipe(operators.take(1)), queries$_.pipe(operators.skip(1), operators.debounceTime(0)));
    return queries$.pipe(operators.map(function (breakpoints) {
      var response = {};
      breakpoints.forEach(function (b) {
        Object.keys(queries).forEach(function (key) {
          var query = queries[key];
          var match = query.group.reduce(function (p, c) {
            return p && (b.query !== c || b.matches);
          }, true);
          response[key] = match;
        });
      });
      /*
      const response = {
      	matches: false,
      	breakpoints: {},
      };
      breakpoints.forEach((state) => {
      	response.matches = response.matches || state.matches;
      	response.breakpoints[state.query] = state.matches;
      });
      console.log(breakpoints, response, queries);
      */

      return response;
    }));
  }
  /*
  static isMatched$(value) {
  	const queries = this.splitQueries(coerceArray(value));
  	return queries.some(mediaQuery => this.registerQuery$_(mediaQuery).mediaQueryList.matches);
  }
  */
  ;

  BreakpointService.has = function has(query) {
    return this.queries_[query] !== undefined;
  };

  BreakpointService.get = function get(query) {
    return this.queries_[query];
  };

  BreakpointService.set = function set(query, value) {
    return this.queries_[query] = value;
  };

  BreakpointService.registerQuery$_ = function registerQuery$_(key) {
    if (this.has(key)) {
      return this.get(key);
    }

    var mediaQueryList = MediaMatcher.matchMedia(key);
    var query$ = new rxjs.Observable(function (observer) {
      var handler = function handler(e) {
        return observer.next(e);
      };

      mediaQueryList.addListener(handler);
      return function () {
        mediaQueryList.removeListener(handler);
      };
    }).pipe(operators.startWith(mediaQueryList), operators.map(function (nextMediaQueryList) {
      return {
        query: key,
        matches: nextMediaQueryList.matches
      };
    }));
    var output = {
      query$: query$,
      mediaQueryList: mediaQueryList
    };
    this.set(key, output);
    return output;
  };

  BreakpointService.splitQueries = function splitQueries(queries) {
    return queries.map(function (query) {
      return query.split(',');
    }).reduce(function (a1, a2) {
      return a1.concat(a2);
    }).map(function (query) {
      return query.trim();
    });
  };

  return BreakpointService;
}();

_defineProperty(BreakpointService, "queries_", {});var AppComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(AppComponent, _Component);

  function AppComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = AppComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    node.classList.remove('hidden');
    BreakpointService.observe$({
      isMobile: '(max-width: 767px)'
    }).pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (results) {
      console.log('AppComponent.BreakpointService.results', results);
      _this.isMobile = results.isMobile;

      _this.pushChanges();
    });
  };

  _proto.onMenuToggle = function onMenuToggle(opened) {
    console.log('AppComponent.onMenuToggle', opened);
  };

  return AppComponent;
}(rxcomp.Component);
AppComponent.meta = {
  selector: '[app-component]'
};var IntersectionService = /*#__PURE__*/function () {
  function IntersectionService() {}

  IntersectionService.observer = function observer() {
    var _this = this;

    if (!this.observer_) {
      this.readySubject_ = new rxjs.BehaviorSubject(false);
      this.observerSubject_ = new rxjs.Subject();
      this.observer_ = new IntersectionObserver(function (entries) {
        _this.observerSubject_.next(entries);
      });
    }

    return this.observer_;
  };

  IntersectionService.intersection$ = function intersection$(node) {
    if ('IntersectionObserver' in window) {
      var observer = this.observer();
      observer.observe(node);
      return this.observerSubject_.pipe( // tap(entries => console.log(entries.length)),
      operators.map(function (entries) {
        return entries.find(function (entry) {
          return entry.target === node;
        });
      }), operators.filter(function (entry) {
        return entry !== undefined;
      }), // tap(entry => console.log('IntersectionService.intersection$', entry)),
      operators.finalize(function () {
        return observer.unobserve(node);
      }));
    } else {
      return rxjs.of({
        target: node,
        isIntersecting: true
      });
    }
  };

  IntersectionService.firstIntersection$ = function firstIntersection$(node) {
    return this.intersection$(node).pipe(operators.filter(function (entry) {
      return entry.isIntersecting;
    }), // entry.intersectionRatio > 0
    operators.first());
  };

  return IntersectionService;
}();var AppearStaggerDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(AppearStaggerDirective, _Directive);

  function AppearStaggerDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = AppearStaggerDirective.prototype;

  _proto.onInit = function onInit() {
    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    node.classList.add('appear-stagger');
  };

  _proto.onChanges = function onChanges() {
    if (!this.appeared) {
      this.appeared = true;

      var _getContext2 = rxcomp.getContext(this),
          node = _getContext2.node;

      IntersectionService.firstIntersection$(node).pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (src) {
        node.classList.add('appeared');
      });
    }
  };

  return AppearStaggerDirective;
}(rxcomp.Directive);
AppearStaggerDirective.meta = {
  selector: '[appear-stagger]'
};var AppearDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(AppearDirective, _Directive);

  function AppearDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = AppearDirective.prototype;

  _proto.onInit = function onInit() {
    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    node.classList.add('appear');
  };

  _proto.onChanges = function onChanges() {
    if (!this.appeared) {
      this.appeared = true;

      var _getContext2 = rxcomp.getContext(this),
          node = _getContext2.node;

      IntersectionService.firstIntersection$(node).pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (src) {
        node.classList.add('appeared');
      });
    }
  };

  return AppearDirective;
}(rxcomp.Directive);
AppearDirective.meta = {
  // selector: '[appear],.row,.listing--series,.listing--products,.listing--cards,.listing--news,.listing--downloads',
  selector: '.picture'
};var NODE = typeof module !== 'undefined' && module.exports;
var PARAMS = NODE ? {
  get: function get() {}
} : new URLSearchParams(window.location.search);
var DEBUG =  PARAMS.get('debug') != null;
var BASE_HREF = NODE ? null : document.querySelector('base').getAttribute('href');
var STATIC = NODE ? false : window && (window.location.port === '41234' || window.location.host === 'actarian.github.io' || window.location.host === 'stipa.herokuapp.com');
var DEVELOPMENT = NODE ? false : window && ['localhost', '127.0.0.1', '0.0.0.0'].indexOf(window.location.host.split(':')[0]) !== -1;
var PRODUCTION = !DEVELOPMENT;
var ENV = {
  NAME: 'stipa',
  STATIC: STATIC,
  DEVELOPMENT: DEVELOPMENT,
  PRODUCTION: PRODUCTION,
  RESOURCE: '/docs/',
  STATIC_RESOURCE: './',
  API: '/api',
  STATIC_API: DEVELOPMENT && !STATIC ? '/Client/docs/api' : './api'
};
function getApiUrl(url, useStatic) {
  var base = useStatic || STATIC ? ENV.STATIC_API : ENV.API;
  var json = useStatic || STATIC ? '.json' : '';
  return "" + base + url + json;
}
function getSlug(url) {
  if (!url) {
    return url;
  }

  if (url.indexOf("/" + ENV.NAME) !== 0) {
    return url;
  }

  if (STATIC) {
    console.log(url);
    return url;
  }

  url = url.replace("/" + ENV.NAME, '');
  url = url.replace('.html', '');
  return "/it/it" + url;
}
var Environment = /*#__PURE__*/function () {
  _createClass(Environment, [{
    key: "href",
    get: function get() {
      if (window.location.host.indexOf('herokuapp') !== -1) {
        return 'https://raw.githubusercontent.com/actarian/stipa/master/docs/';
      } else {
        return BASE_HREF;
      }
    }
  }, {
    key: "host",
    get: function get() {
      var host = window.location.host.replace('127.0.0.1', '192.168.1.2');

      if (host.substr(host.length - 1, 1) === '/') {
        host = host.substr(0, host.length - 1);
      }

      return window.location.protocol + "//" + host + BASE_HREF;
    }
  }]);

  function Environment(options) {
    if (options) {
      Object.assign(this, options);
    }
  }

  return Environment;
}();
var environment = new Environment({
  port: 5000
});var HttpResponse = /*#__PURE__*/function () {
  _createClass(HttpResponse, [{
    key: "static",
    get: function get() {
      return this.url.indexOf('.json') === this.url.length - 5;
    }
  }]);

  function HttpResponse(response) {
    this.data = null;

    if (response) {
      this.url = response.url;
      this.status = response.status;
      this.statusText = response.statusText;
      this.ok = response.ok;
      this.redirected = response.redirected;
    }
  }

  return HttpResponse;
}();

var HttpService = /*#__PURE__*/function () {
  function HttpService() {}

  HttpService.http$ = function http$(method, url, data, format) {
    var _this = this;

    if (format === void 0) {
      format = 'json';
    }

    method = url.indexOf('.json') !== -1 ? 'GET' : method;
    var methods = ['POST', 'PUT', 'PATCH'];
    var response_ = null;
    var qstring = methods.indexOf(method) !== -1 ? Object.keys(data).map(function (key) {
      return key + '=' + encodeURI(data[key]);
    }).join('&') : undefined;
    return rxjs.from(fetch(url, url.indexOf('.json') !== -1 ? {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: methods.indexOf(method) !== -1 ? JSON.stringify(data) : undefined
    } : {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qstring
    }).then(function (response) {
      response_ = new HttpResponse(response);
      return response[format]().then(function (json) {
        response_.data = json;

        if (response.ok) {
          return Promise.resolve(response_);
        } else {
          return Promise.reject(response_);
        }
      });
      /*
      if (response.ok) {
      	return response[format]();
      } else {
      	return response.json().then(json => {
      		return Promise.reject(json);
      	});
      }
      */
    })).pipe(operators.catchError(function (error) {
      return rxjs.throwError(_this.getError(error, response_));
    }));
  };

  HttpService.get$ = function get$(url, data, format) {
    var query = this.query(data);
    return this.http$('GET', "" + url + query, undefined, format);
  };

  HttpService.delete$ = function delete$(url) {
    return this.http$('DELETE', url);
  };

  HttpService.post$ = function post$(url, data) {
    return this.http$('POST', url, data);
  };

  HttpService.put$ = function put$(url, data) {
    return this.http$('PUT', url, data);
  };

  HttpService.patch$ = function patch$(url, data) {
    return this.http$('PATCH', url, data);
  };

  HttpService.query = function query(data) {
    return ''; // todo
  };

  HttpService.getError = function getError(object, response) {
    var error = typeof object === 'object' ? object : {};

    if (!error.statusCode) {
      error.statusCode = response ? response.status : 0;
    }

    if (!error.statusMessage) {
      error.statusMessage = response ? response.statusText : object;
    }

    console.log('HttpService.getError', error, object);
    return error;
  };

  return HttpService;
}();var ApiService = /*#__PURE__*/function (_HttpService) {
  _inheritsLoose(ApiService, _HttpService);

  function ApiService() {
    return _HttpService.apply(this, arguments) || this;
  }

  ApiService.get$ = function get$(url, data, format) {
    return _HttpService.get$.call(this, getApiUrl(url), data, format);
  };

  ApiService.delete$ = function delete$(url) {
    return _HttpService.delete$.call(this, getApiUrl(url));
  };

  ApiService.post$ = function post$(url, data) {
    return _HttpService.post$.call(this, getApiUrl(url), data);
  };

  ApiService.put$ = function put$(url, data) {
    return _HttpService.put$.call(this, getApiUrl(url), data);
  };

  ApiService.patch$ = function patch$(url, data) {
    return _HttpService.patch$.call(this, getApiUrl(url), data);
  };

  ApiService.staticGet$ = function staticGet$(url, data, format) {
    return _HttpService.get$.call(this, getApiUrl(url, true), data, format);
  };

  ApiService.staticDelete$ = function staticDelete$(url) {
    return _HttpService.delete$.call(this, getApiUrl(url, true));
  };

  ApiService.staticPost$ = function staticPost$(url, data) {
    return _HttpService.post$.call(this, getApiUrl(url, true), data);
  };

  ApiService.staticPut$ = function staticPut$(url, data) {
    return _HttpService.put$.call(this, getApiUrl(url, true), data);
  };

  ApiService.staticPatch$ = function staticPatch$(url, data) {
    return _HttpService.patch$.call(this, getApiUrl(url, true), data);
  };

  return ApiService;
}(HttpService);

_defineProperty(ApiService, "currentLanguage", window.currentLanguage || 'it');var StorageService = /*#__PURE__*/function () {
  function StorageService() {}

  StorageService.encode = function encode(decoded) {
    var encoded = rxcomp.Serializer.encode(decoded, [rxcomp.encodeJson, encodeURIComponent, rxcomp.encodeBase64]) || null;
    return encoded;
  };

  StorageService.decode = function decode(encoded) {
    var decoded = rxcomp.Serializer.decode(encoded, [rxcomp.decodeBase64, decodeURIComponent, rxcomp.decodeJson]);
    return decoded;
  };

  StorageService.isSupported = function isSupported(type) {
    var flag = false;
    var storage;

    try {
      storage = rxcomp.WINDOW[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      flag = true;
    } catch (error) {
      flag = error instanceof DOMException && ( // everything except Firefox
      error.code === 22 || // Firefox
      error.code === 1014 || // test name field too, because code might not be present
      // everything except Firefox
      error.name === 'QuotaExceededError' || // Firefox
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED') && // acknowledge QuotaExceededError only if there's something already stored
      Boolean(storage && storage.length !== 0);
    }

    return flag;
  };

  return StorageService;
}();

_defineProperty(StorageService, "supported", false);var LocalStorageService = /*#__PURE__*/function (_StorageService) {
  _inheritsLoose(LocalStorageService, _StorageService);

  function LocalStorageService() {
    return _StorageService.apply(this, arguments) || this;
  }

  LocalStorageService.clear = function clear() {
    if (this.isSupported()) {
      localStorage.clear();
      this.items$.next(this.toArray());
    }
  };

  LocalStorageService.delete = function _delete(name) {
    if (this.isSupported()) {
      localStorage.removeItem(name);
      this.items$.next(this.toArray());
    }
  };

  LocalStorageService.exist = function exist(name) {
    if (this.isSupported()) {
      return localStorage.getItem(name) !== undefined;
    } else {
      return false;
    }
  };

  LocalStorageService.get = function get(name) {
    return this.decode(this.getRaw(name));
  };

  LocalStorageService.set = function set(name, value) {
    this.setRaw(name, this.encode(value));
  };

  LocalStorageService.getRaw = function getRaw(name) {
    var value = null;

    if (this.isSupported()) {
      value = localStorage.getItem(name);
    }

    return value;
  };

  LocalStorageService.setRaw = function setRaw(name, value) {
    if (value && this.isSupported()) {
      localStorage.setItem(name, value);
      this.items$.next(this.toArray());
    }
  };

  LocalStorageService.toArray = function toArray() {
    var _this = this;

    return this.toRawArray().map(function (x) {
      x.value = _this.decode(x.value);
      return x;
    });
  };

  LocalStorageService.toRawArray = function toRawArray() {
    var _this2 = this;

    if (this.isSupported()) {
      return Object.keys(localStorage).map(function (key) {
        return {
          name: key,
          value: _this2.getRaw(key)
        };
      });
    } else {
      return [];
    }
  };

  LocalStorageService.isSupported = function isSupported() {
    if (this.supported) {
      return true;
    }

    return StorageService.isSupported('localStorage');
  };

  return LocalStorageService;
}(StorageService);

_defineProperty(LocalStorageService, "items$", new rxjs.ReplaySubject(1));var User = /*#__PURE__*/function () {
  _createClass(User, [{
    key: "avatar",
    get: function get() {
      return (this.firstName || '?').substr(0, 1).toUpperCase() + (this.lastName || '?').substr(0, 1).toUpperCase();
    }
  }, {
    key: "fullName",
    get: function get() {
      return this.firstName + ' ' + this.lastName;
    }
  }]);

  function User(data) {
    if (data) {
      Object.assign(this, data);
    }
  }

  return User;
}();

var UserService = /*#__PURE__*/function () {
  function UserService() {}

  UserService.getCurrentUser = function getCurrentUser() {
    return this.user$_.getValue();
  };

  UserService.setUser = function setUser(user) {
    this.user$_.next(user);
  };

  UserService.me$ = function me$() {
    var _this = this;

    //return ApiService.staticGet$(`/user/me`).pipe(
    return ApiService.get$("/user/me").pipe( // map((user) => this.mapStatic__(user, 'me')),
    operators.map(function (response) {
      return _this.mapUser(response.data, response.static);
    }), operators.catchError(function (error) {
      return rxjs.of(null);
    }), operators.switchMap(function (user) {
      _this.setUser(user);

      return _this.user$_;
    }));
  };

  UserService.register$ = function register$(payload) {
    var _this2 = this;

    return ApiService.staticPost$("/user/register", payload).pipe(operators.map(function (response) {
      return _this2.mapStatic__(response.data, response.static, 'register');
    }));
  };

  UserService.login$ = function login$(payload) {
    var _this3 = this;

    return ApiService.staticPost$("/user/login", payload).pipe(operators.map(function (response) {
      return _this3.mapStatic__(response.data, response.static, 'login');
    }));
  };

  UserService.logout$ = function logout$() {
    var _this4 = this;

    return ApiService.staticPost$("/user/logout").pipe(operators.map(function (response) {
      return _this4.mapStatic__(response.data, response.static, 'logout');
    }));
  };

  UserService.retrieve$ = function retrieve$(payload) {
    var _this5 = this;

    return ApiService.staticPost$("/user/forget", payload).pipe(operators.map(function (response) {
      return _this5.mapStatic__(response.data, response.static, 'retrieve');
    }));
  }
  /*
  static update$(payload) {
  	return ApiService.staticPost$(`/user/updateprofile`, payload).pipe(
  		map((response) => this.mapStatic__(response.data, response.static, 'register')),
  	);
  }
  */
  ;

  UserService.mapStatic__ = function mapStatic__(user, isStatic, action) {
    if (action === void 0) {
      action = 'me';
    }

    if (!isStatic) {
      return user;
    }

    switch (action) {
      case 'me':
        if (!LocalStorageService.exist('user')) {
          user = null;
        }
        break;

      case 'register':
        LocalStorageService.set('user', user);
        break;

      case 'login':
        LocalStorageService.set('user', user);
        break;

      case 'logout':
        LocalStorageService.delete('user');
        break;
    }

    return user;
  };

  UserService.fake = function fake(user) {
    user.firstName = user.firstName || 'Jhon';
    user.lastName = user.lastName || 'Appleseed';
    return user;
  };

  UserService.mapUser = function mapUser(user, isStatic) {
    return isStatic ? UserService.fake(new User(user)) : new User(user);
  };

  UserService.mapUsers = function mapUsers(users, isStatic) {
    return users ? users.map(function (x) {
      return UserService.mapUser(x, isStatic);
    }) : [];
  };

  return UserService;
}();
UserService.user$_ = new rxjs.BehaviorSubject(null);var AuthForgotComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(AuthForgotComponent, _Component);

  function AuthForgotComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = AuthForgotComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var form = new rxcompForm.FormGroup({
      email: new rxcompForm.FormControl(null, [rxcompForm.Validators.RequiredValidator(), rxcompForm.Validators.EmailValidator()]),
      checkRequest: window.antiforgery,
      checkField: ''
    });
    var controls = form.controls;
    this.controls = controls;
    form.changes$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (changes) {
      // console.log('AuthForgotComponent.form.changes$', changes, form.valid);
      _this.pushChanges();
    });
    this.form = form;
    this.error = null;
    this.success = false;
  };

  _proto.test = function test() {
    this.form.patch({
      email: 'jhonappleseed@gmail.com',
      checkRequest: window.antiforgery,
      checkField: ''
    });
  };

  _proto.reset = function reset() {
    this.form.reset();
  };

  _proto.onSubmit = function onSubmit() {
    var _this2 = this;

    // console.log('AuthForgotComponent.onSubmit', 'form.valid', valid);
    if (this.form.valid) {
      // console.log('AuthForgotComponent.onSubmit', this.form.value);
      this.form.submitted = true;
      UserService.retrieve$(this.form.value).subscribe(function (response) {
        console.log('AuthForgotComponent.onSubmit', response);

        _this2.sent.next(true);

        _this2.success = true; // this.form.reset();

        _this2.pushChanges();
      }, function (error) {
        console.log('AuthForgotComponent.error', error);
        _this2.error = error;

        _this2.pushChanges();
      });
    } else {
      this.form.touched = true;
    }
  };

  _proto.onLogin = function onLogin() {
    this.login.next();
  };

  _proto.onRegister = function onRegister() {
    this.register.next();
  };

  return AuthForgotComponent;
}(rxcomp.Component);
AuthForgotComponent.meta = {
  selector: '[auth-forgot]',
  outputs: ['sent', 'login', 'register']
};var ModalEvent = function ModalEvent(data) {
  this.data = data;
};
var ModalResolveEvent = /*#__PURE__*/function (_ModalEvent) {
  _inheritsLoose(ModalResolveEvent, _ModalEvent);

  function ModalResolveEvent() {
    return _ModalEvent.apply(this, arguments) || this;
  }

  return ModalResolveEvent;
}(ModalEvent);
var ModalRejectEvent = /*#__PURE__*/function (_ModalEvent2) {
  _inheritsLoose(ModalRejectEvent, _ModalEvent2);

  function ModalRejectEvent() {
    return _ModalEvent2.apply(this, arguments) || this;
  }

  return ModalRejectEvent;
}(ModalEvent);

var ModalService = /*#__PURE__*/function () {
  function ModalService() {}

  ModalService.open$ = function open$(modal) {
    var _this = this;

    return this.getTemplate$(modal.src).pipe(operators.map(function (template) {
      return {
        node: _this.getNode(template),
        data: modal.data,
        modal: modal
      };
    }), operators.tap(function (node) {
      return _this.modal$.next(node);
    }), operators.switchMap(function (node) {
      return _this.events$;
    }));
  };

  ModalService.load$ = function load$(modal) {};

  ModalService.getTemplate$ = function getTemplate$(url) {
    return rxjs.from(fetch(url).then(function (response) {
      return response.text();
    }));
  };

  ModalService.getNode = function getNode(template) {
    var div = document.createElement("div");
    div.innerHTML = template;
    var node = div.firstElementChild;
    return node;
  };

  ModalService.reject = function reject(data) {
    this.modal$.next(null);
    this.events$.next(new ModalRejectEvent(data));
  };

  ModalService.resolve = function resolve(data) {
    this.modal$.next(null);
    this.events$.next(new ModalResolveEvent(data));
  };

  return ModalService;
}();
ModalService.modal$ = new rxjs.Subject();
ModalService.events$ = new rxjs.Subject();var ModalOutletComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ModalOutletComponent, _Component);

  function ModalOutletComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ModalOutletComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    this.modalNode = node.querySelector('.modal-outlet__modal');
    ModalService.modal$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (modal) {
      _this.modal = modal;
    });
  };

  _proto.onRegister = function onRegister(event) {
    // console.log('ModalComponent.onRegister');
    this.pushChanges();
  };

  _proto.onLogin = function onLogin(event) {
    // console.log('ModalComponent.onLogin');
    this.pushChanges();
  };

  _proto.reject = function reject(event) {
    ModalService.reject();
  };

  _createClass(ModalOutletComponent, [{
    key: "modal",
    get: function get() {
      return this.modal_;
    },
    set: function set(modal) {
      // console.log('ModalOutletComponent set modal', modal, this);
      var _getContext2 = rxcomp.getContext(this),
          module = _getContext2.module;

      if (this.modal_ && this.modal_.node) {
        module.remove(this.modal_.node, this);
        this.modalNode.removeChild(this.modal_.node);
      }

      if (modal && modal.node) {
        this.modal_ = modal;
        this.modalNode.appendChild(modal.node);
        var instances = module.compile(modal.node);
      }

      this.modal_ = modal;
      this.pushChanges();
    }
  }]);

  return ModalOutletComponent;
}(rxcomp.Component);
ModalOutletComponent.meta = {
  selector: '[modal-outlet]',
  template:
  /* html */
  "\n\t<div class=\"modal-outlet__container\" [class]=\"{ active: modal }\">\n\t\t<div class=\"modal-outlet__background\" (click)=\"reject($event)\"></div>\n\t\t<div class=\"modal-outlet__modal\"></div>\n\t</div>\n\t"
};var AuthComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(AuthComponent, _Component);

  function AuthComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = AuthComponent.prototype;

  _proto.onInit = function onInit() {
    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    this.views = {
      SIGN_IN: 1,
      SIGN_UP: 2,
      FORGOTTEN: 3
    };
    this.view = node.hasAttribute('view') ? parseInt(node.getAttribute('view')) : this.views.SIGN_IN;
  };

  _proto.onForgot = function onForgot(event) {
    // console.log('AuthComponent.onForgot');
    this.view = this.views.FORGOTTEN;
    this.pushChanges();
  };

  _proto.onLogin = function onLogin(event) {
    // console.log('AuthComponent.onLogin');
    this.view = this.views.SIGN_IN;
    this.pushChanges();
  };

  _proto.onRegister = function onRegister(event) {
    // console.log('AuthComponent.onRegister');
    this.view = this.views.SIGN_UP;
    this.pushChanges();
  };

  _proto.onSignIn = function onSignIn(user) {
    console.log('AuthComponent.onSignIn', user);
    UserService.setUser(user);
    window.location.href = this.auth; // nav to profile
  };

  _proto.onSignUp = function onSignUp(user) {
    console.log('AuthComponent.onSignUp', user);
    UserService.setUser(user);
    window.location.href = this.auth; // nav to profile
  };

  _proto.onForgottenSent = function onForgottenSent(email) {
    /*
    console.log('AuthComponent.onForgottenSent', email);
    this.view = this.views.SIGN_IN;
    this.pushChanges();
    */
  };

  return AuthComponent;
}(rxcomp.Component);
AuthComponent.meta = {
  selector: '[auth]',
  inputs: ['auth']
};var AuthModalComponent = /*#__PURE__*/function (_AuthComponent) {
  _inheritsLoose(AuthModalComponent, _AuthComponent);

  function AuthModalComponent() {
    return _AuthComponent.apply(this, arguments) || this;
  }

  var _proto = AuthModalComponent.prototype;

  _proto.onInit = function onInit() {
    _AuthComponent.prototype.onInit.call(this);

    var _getContext = rxcomp.getContext(this),
        parentInstance = _getContext.parentInstance;

    if (parentInstance instanceof ModalOutletComponent) {
      var data = parentInstance.modal.data;
      this.view = data.view; // console.log('AuthModalComponent.onInit', data);
    }
  };

  _proto.onSignIn = function onSignIn(user) {
    // console.log('AuthModalComponent.onSignIn', user);
    ModalService.resolve(user);
  };

  _proto.onSignUp = function onSignUp(user) {
    // console.log('AuthModalComponent.onSignUp', user);
    ModalService.resolve(user);
  }
  /*
  onDestroy() {
  	// console.log('AuthModalComponent.onDestroy');
  }
  */
  ;

  _proto.close = function close() {
    ModalService.reject();
  };

  return AuthModalComponent;
}(AuthComponent);
AuthModalComponent.meta = {
  selector: '[auth-modal]'
};var AuthSigninComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(AuthSigninComponent, _Component);

  function AuthSigninComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = AuthSigninComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;
    var form = new rxcompForm.FormGroup({
      email: new rxcompForm.FormControl(null, [rxcompForm.Validators.RequiredValidator(), rxcompForm.Validators.EmailValidator()]),
      password: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      checkRequest: window.antiforgery,
      checkField: ''
    });
    var controls = form.controls;
    this.controls = controls;
    form.changes$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (changes) {
      // console.log('AuthSigninComponent.form.changes$', changes, form.valid);
      _this.pushChanges();
    });
    this.form = form;
    this.error = null;
    this.success = false;
  };

  _proto.test = function test() {
    this.form.patch({
      email: 'jhonappleseed@gmail.com',
      password: 'password',
      checkRequest: window.antiforgery,
      checkField: ''
    });
  };

  _proto.reset = function reset() {
    this.form.reset();
  };

  _proto.onSubmit = function onSubmit() {
    var _this2 = this;

    // console.log('AuthSigninComponent.onSubmit', 'form.valid', valid);
    if (this.form.valid) {
      // console.log('AuthSigninComponent.onSubmit', this.form.value);
      this.form.submitted = true; // HttpService.post$('/api/users/Login', this.form.value)

      UserService.login$(this.form.value).subscribe(function (response) {
        console.log('AuthSigninComponent.onSubmit', response);
        _this2.success = true; // this.form.reset();

        _this2.pushChanges();

        _this2.signIn.next(typeof response === 'string' ? {
          status: response
        } : response);
      }, function (error) {
        console.log('AuthSigninComponent.error', error);
        _this2.error = error;

        _this2.pushChanges();
      });
    } else {
      this.form.touched = true;
    }
  };

  _proto.onForgot = function onForgot() {
    this.forgot.next();
  };

  _proto.onRegister = function onRegister() {
    this.register.next();
  };

  return AuthSigninComponent;
}(rxcomp.Component);
AuthSigninComponent.meta = {
  selector: '[auth-signin]',
  outputs: ['signIn', 'forgot', 'register']
};var AuthSignupComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(AuthSignupComponent, _Component);

  function AuthSignupComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = AuthSignupComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var data = window.data || {
      roles: [],
      countries: []
    };
    var form = new rxcompForm.FormGroup({
      firstName: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      lastName: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      email: new rxcompForm.FormControl(null, [rxcompForm.Validators.RequiredValidator(), rxcompForm.Validators.EmailValidator()]),
      company: new rxcompForm.FormControl(null),
      role: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      country: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      newsletter: new rxcompForm.FormControl(null),
      privacy: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      checkRequest: window.antiforgery,
      checkField: '',
      action: window.formaction
    });
    var controls = form.controls;
    controls.role.options = data.roles;
    controls.country.options = data.countries;
    this.controls = controls;
    form.changes$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (changes) {
      // console.log('WorkWithUsComponent.form.changes$', changes, form.valid);
      _this.pushChanges();
    });
    this.data = data;
    this.form = form;
    this.error = null;
    this.success = false;
  };

  _proto.test = function test() {
    var role = this.controls.role.options.length ? this.controls.role.options[0].id : null;
    this.form.patch({
      firstName: 'Jhon',
      lastName: 'Appleseed',
      email: 'jhonappleseed@gmail.com',
      company: 'Websolute',
      country: 'Italy',
      role: role,
      privacy: true,
      checkRequest: window.antiforgery,
      checkField: ''
    });
  };

  _proto.reset = function reset() {
    this.form.reset();
  };

  _proto.onSubmit = function onSubmit() {
    var _this2 = this;

    // console.log('AuthSignupComponent.onSubmit', 'form.valid', valid);
    if (this.form.valid) {
      // console.log('AuthSignupComponent.onSubmit', this.form.value);
      this.form.submitted = true; // HttpService.post$('/api/users/Register', this.form.value)

      UserService.register$(this.form.value).subscribe(function (response) {
        console.log('AuthSignupComponent.onSubmit', response);
        _this2.success = true;
        dataLayer.push({
          'event': 'formSubmission',
          'form type': 'Registrazione'
        });

        _this2.form.reset(); // this.pushChanges();
        // this.signUp.next(response);

      }, function (error) {
        console.log('AuthSignupComponent.error', error);
        _this2.error = error;
        _this2.form.submitted = false;

        _this2.pushChanges();
      });
    } else {
      this.form.touched = true;
    }
  };

  _proto.onLogin = function onLogin() {
    this.login.next();
  };

  return AuthSignupComponent;
}(rxcomp.Component);
AuthSignupComponent.meta = {
  selector: '[auth-signup]' //outputs: ['signUp', 'login'],

};var ClickOutsideDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(ClickOutsideDirective, _Directive);

  function ClickOutsideDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = ClickOutsideDirective.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    this.initialFocus = false;

    var _getContext = rxcomp.getContext(this),
        module = _getContext.module,
        node = _getContext.node,
        parentInstance = _getContext.parentInstance,
        selector = _getContext.selector;

    var event$ = this.event$ = rxjs.fromEvent(document, 'click').pipe(operators.filter(function (event) {
      var target = event.target; // console.log('ClickOutsideDirective.onClick', this.element.nativeElement, target, this.element.nativeElement.contains(target));
      // const documentContained: boolean = Boolean(document.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINED_BY);
      // console.log(target, documentContained);

      var clickedInside = node.contains(target) || !document.contains(target);

      if (!clickedInside) {
        if (_this.initialFocus) {
          _this.initialFocus = false;
          return true;
        }
      } else {
        _this.initialFocus = true;
      }
    }), operators.shareReplay(1));
    var expression = node.getAttribute("(clickOutside)");

    if (expression) {
      var outputFunction = module.makeFunction(expression, ['$event']);
      event$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
        module.resolve(outputFunction, parentInstance, event);
      });
    } else {
      parentInstance.clickOutside$ = event$;
    }
  };

  return ClickOutsideDirective;
}(rxcomp.Directive);
ClickOutsideDirective.meta = {
  selector: "[(clickOutside)]"
};var ContactsSimpleComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ContactsSimpleComponent, _Component);

  function ContactsSimpleComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ContactsSimpleComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var form = new rxcompForm.FormGroup({
      fullName: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      email: new rxcompForm.FormControl(null, [rxcompForm.Validators.RequiredValidator(), rxcompForm.Validators.EmailValidator()]),
      // privacy: new FormControl(null, Validators.RequiredValidator()),
      checkRequest: window.antiforgery,
      checkField: ''
    });
    var controls = this.controls = form.controls;
    form.changes$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (changes) {
      _this.pushChanges();
    });
    this.form = form;
    this.error = null;
    this.success = false;
  };

  _proto.test = function test() {
    var role = this.controls.role.options.length ? this.controls.role.options[0].id : null;
    this.form.patch({
      fullName: 'Jhon Appleseed',
      email: 'jhonappleseed@gmail.com',
      // privacy: true,
      checkRequest: window.antiforgery,
      checkField: ''
    });
  };

  _proto.reset = function reset() {
    this.form.reset();
  };

  _proto.onSubmit = function onSubmit() {
    var _this2 = this;

    if (this.form.valid) {
      this.form.submitted = true;
      HttpService.post$('/api/contacts', this.form.value).subscribe(function (response) {
        _this2.success = true;

        _this2.form.reset(); // this.pushChanges();

        /*
        dataLayer.push({
        	'event': 'formSubmission',
        	'formType': 'Contacts'
        });
        */

      }, function (error) {
        console.log('ContactsSimpleComponent.error', error);
        _this2.error = error;

        _this2.pushChanges();
      });
    } else {
      this.form.touched = true;
    }
  };

  return ContactsSimpleComponent;
}(rxcomp.Component);
ContactsSimpleComponent.meta = {
  selector: '[contacts-simple]',
  inputs: ['flag']
};var ContactsComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ContactsComponent, _Component);

  function ContactsComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ContactsComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var data = window.data || {
      reason: [],
      firstCategory: [],
      secondCategory: []
    };
    var form = new rxcompForm.FormGroup({
      fullName: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      email: new rxcompForm.FormControl(null, [rxcompForm.Validators.RequiredValidator(), rxcompForm.Validators.EmailValidator()]),
      company: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      reason: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      firstCategory: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      secondCategory: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      message: new rxcompForm.FormControl(null),
      privacy: new rxcompForm.FormControl(null, rxcompForm.Validators.RequiredValidator()),
      checkRequest: window.antiforgery,
      checkField: ''
    });
    var controls = this.controls = form.controls;
    controls.reason.options = data.reason;
    controls.firstCategory.options = data.firstCategory;
    controls.secondCategory.options = data.secondCategory;
    form.changes$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (changes) {
      _this.pushChanges();
    });
    this.form = form;
    this.error = null;
    this.success = false;
  };

  _proto.test = function test() {
    var reason = this.controls.reason.options.length ? this.controls.reason.options[0].id : null;
    var firstCategory = this.controls.firstCategory.options.length ? this.controls.firstCategory.options[0].id : null;
    var secondCategory = this.controls.secondCategory.options.length ? this.controls.secondCategory.options[0].id : null;
    this.form.patch({
      fullName: 'Jhon Appleseed',
      email: 'jhonappleseed@gmail.com',
      company: 'Websolute',
      reason: reason,
      firstCategory: firstCategory,
      secondCategory: secondCategory,
      message: 'Hi!',
      privacy: true,
      checkRequest: window.antiforgery,
      checkField: ''
    });
  };

  _proto.reset = function reset() {
    this.form.reset();
  };

  _proto.onSubmit = function onSubmit() {
    var _this2 = this;

    if (this.form.valid) {
      this.form.submitted = true;
      HttpService.post$('/api/contacts', this.form.value).subscribe(function (response) {
        _this2.success = true;

        _this2.form.reset(); // this.pushChanges();

        /*
        dataLayer.push({
        	'event': 'formSubmission',
        	'formType': 'Contacts'
        });
        */

      }, function (error) {
        console.log('ContactsComponent.error', error);
        _this2.error = error;

        _this2.pushChanges();
      });
    } else {
      this.form.touched = true;
    }
  };

  return ContactsComponent;
}(rxcomp.Component);
ContactsComponent.meta = {
  selector: '[contacts]',
  inputs: ['flag']
};var DROPDOWN_ID = 1000000;

var DropdownDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(DropdownDirective, _Directive);

  function DropdownDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = DropdownDirective.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    var trigger = node.getAttribute('dropdown-trigger');
    this.trigger = trigger ? node.querySelector(trigger) : node;
    this.opened = null;
    this.onClick = this.onClick.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.openDropdown = this.openDropdown.bind(this);
    this.closeDropdown = this.closeDropdown.bind(this);
    this.addListeners();
    DropdownDirective.dropdown$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (id) {
      // console.log('DropdownDirective', id, this['dropdown-item']);
      if (_this.id === id) {
        node.classList.add('dropped');
      } else {
        node.classList.remove('dropped');
      }
    });
  };

  _proto.onClick = function onClick(event) {
    var _getContext2 = rxcomp.getContext(this),
        node = _getContext2.node;

    if (this.opened === null) {
      this.openDropdown();
    } else {
      var dropdownItemNode = node.querySelector('[dropdown-item]'); // console.log('dropdownItemNode', dropdownItemNode);

      if (!dropdownItemNode) {
        // if (this.trigger !== node) {
        this.closeDropdown();
      }
    }
  };

  _proto.onDocumentClick = function onDocumentClick(event) {
    var _getContext3 = rxcomp.getContext(this),
        node = _getContext3.node;

    var clickedInside = node === event.target || node.contains(event.target);

    if (!clickedInside) {
      this.closeDropdown();
    }
  };

  _proto.openDropdown = function openDropdown() {
    if (this.opened === null) {
      this.opened = true;
      this.addDocumentListeners();
      DropdownDirective.dropdown$.next(this.id);
      this.dropped.next(this.id);
    }
  };

  _proto.closeDropdown = function closeDropdown() {
    if (this.opened !== null) {
      this.removeDocumentListeners();
      this.opened = null;

      if (DropdownDirective.dropdown$.getValue() === this.id) {
        DropdownDirective.dropdown$.next(null);
        this.dropped.next(null);
      }
    }
  };

  _proto.addListeners = function addListeners() {
    this.trigger.addEventListener('click', this.onClick);
  };

  _proto.addDocumentListeners = function addDocumentListeners() {
    document.addEventListener('click', this.onDocumentClick);
  };

  _proto.removeListeners = function removeListeners() {
    this.trigger.removeEventListener('click', this.onClick);
  };

  _proto.removeDocumentListeners = function removeDocumentListeners() {
    document.removeEventListener('click', this.onDocumentClick);
  };

  _proto.onDestroy = function onDestroy() {
    this.removeListeners();
    this.removeDocumentListeners();
  };

  DropdownDirective.nextId = function nextId() {
    return DROPDOWN_ID++;
  };

  _createClass(DropdownDirective, [{
    key: "id",
    get: function get() {
      return this.dropdown || this.id_ || (this.id_ = DropdownDirective.nextId());
    }
  }]);

  return DropdownDirective;
}(rxcomp.Directive);
DropdownDirective.meta = {
  selector: '[dropdown]',
  inputs: ['dropdown', 'dropdown-trigger'],
  outputs: ['dropped']
};
DropdownDirective.dropdown$ = new rxjs.BehaviorSubject(null);var DropdownItemDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(DropdownItemDirective, _Directive);

  function DropdownItemDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = DropdownItemDirective.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    node.classList.add('dropdown-item');
    DropdownDirective.dropdown$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (id) {
      // console.log('DropdownItemDirective', id, this['dropdown-item']);
      if (_this.id === id) {
        node.classList.add('dropped');
      } else {
        node.classList.remove('dropped');
      }
    });
  };

  _createClass(DropdownItemDirective, [{
    key: "id",
    get: function get() {
      return this['dropdown-item'];
    }
  }]);

  return DropdownItemDirective;
}(rxcomp.Directive);
DropdownItemDirective.meta = {
  selector: '[dropdown-item], [[dropdown-item]]',
  inputs: ['dropdown-item']
};var FilterDropdownComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(FilterDropdownComponent, _Component);

  function FilterDropdownComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = FilterDropdownComponent.prototype;

  _proto.onInit = function onInit() {
    this.dropdownId = DropdownDirective.nextId();
  };

  return FilterDropdownComponent;
}(rxcomp.Component);
FilterDropdownComponent.meta = {
  selector: '[filter-dropdown]',
  inputs: ['label', 'filter'],
  template:
  /* html */
  "\n\t\t<span class=\"text\" [innerHTML]=\"label\"></span>\n\t\t<span class=\"btn--dropdown\" [dropdown]=\"dropdownId\">\n\t\t\t<span [innerHTML]=\"filter.label\"></span> <svg class=\"filter\"><use xlink:href=\"#filter\"></use></svg>\n\t\t\t<!-- dropdown -->\n\t\t\t<div class=\"dropdown\" [dropdown-item]=\"dropdownId\">\n\t\t\t\t<div class=\"category\" [innerHTML]=\"filter.label\"></div>\n\t\t\t\t<ul class=\"nav--dropdown\">\n\t\t\t\t\t<li *for=\"let item of filter.options\">\n\t\t\t\t\t\t<span [class]=\"{ active: filter.has(item), disabled: item.disabled }\" (click)=\"filter.set(item)\" [innerHTML]=\"item.label\"></span>\n\t\t\t\t\t</li>\n\t\t\t\t</ul>\n\t\t\t</div>\n\t\t</span>\n\t"
};var ControlComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ControlComponent, _Component);

  function ControlComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ControlComponent.prototype;

  _proto.onChanges = function onChanges() {
    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    var control = this.control;
    var flags = control.flags;
    Object.keys(flags).forEach(function (key) {
      flags[key] ? node.classList.add(key) : node.classList.remove(key);
    });
  };

  return ControlComponent;
}(rxcomp.Component);
ControlComponent.meta = {
  selector: '[control]',
  inputs: ['control']
};var ControlCheckboxComponent = /*#__PURE__*/function (_ControlComponent) {
  _inheritsLoose(ControlCheckboxComponent, _ControlComponent);

  function ControlCheckboxComponent() {
    return _ControlComponent.apply(this, arguments) || this;
  }

  var _proto = ControlCheckboxComponent.prototype;

  _proto.onInit = function onInit() {
    this.label = this.label || 'label';
  };

  return ControlCheckboxComponent;
}(ControlComponent);
ControlCheckboxComponent.meta = {
  selector: '[control-checkbox]',
  inputs: ['control', 'label', 'name'],
  template:
  /* html */
  "\n\t\t<div class=\"group--form--checkbox\" [class]=\"{ required: control.validators.length }\">\n\t\t\t<label>\n\t\t\t\t<input type=\"checkbox\" class=\"control--checkbox\" [formControl]=\"control\" [value]=\"true\" [formControlName]=\"name\" />\n\t\t\t\t<span [innerHTML]=\"label | html\"></span>\n\t\t\t</label>\n\t\t</div>\n\t\t<errors-component *if=\"control.validators.length\" [control]=\"control\"></errors-component>\n\t"
};var KeyboardService = /*#__PURE__*/function () {
  function KeyboardService() {}

  KeyboardService.keydown$ = function keydown$() {
    return rxjs.fromEvent(window, 'keydown').pipe(operators.shareReplay(1));
  };

  KeyboardService.keyup$ = function keyup$() {
    return rxjs.fromEvent(window, 'keyup').pipe(operators.shareReplay(1));
  };

  KeyboardService.typing$ = function typing$() {
    var typing = '',
        to;
    return this.key$().pipe(operators.map(function (key) {
      if (to) {
        clearTimeout(to);
      }

      typing += key;
      to = setTimeout(function () {
        typing = '';
      }, 1500);
      return typing;
    }), operators.shareReplay(1));
  };

  KeyboardService.key$ = function key$() {
    var regexp = /\w/;
    return this.keydown$().pipe(operators.filter(function (event) {
      return event.key && event.key.match(regexp);
    }), operators.map(function (event) {
      return event.key;
    }), operators.shareReplay(1));
  };

  return KeyboardService;
}();var ControlCustomSelectComponent = /*#__PURE__*/function (_ControlComponent) {
  _inheritsLoose(ControlCustomSelectComponent, _ControlComponent);

  function ControlCustomSelectComponent() {
    return _ControlComponent.apply(this, arguments) || this;
  }

  var _proto = ControlCustomSelectComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    this.label = 'label';
    this.labels = window.labels || {};
    this.dropped = false;
    this.dropdownId = DropdownDirective.nextId();
    KeyboardService.typing$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (word) {
      _this.scrollToWord(word);
    });
    /*
    KeyboardService.key$().pipe(
    	takeUntil(this.unsubscribe$)
    ).subscribe(key => {
    	this.scrollToKey(key);
    });
    */
  };

  _proto.scrollToWord = function scrollToWord(word) {
    // console.log('ControlCustomSelectComponent.scrollToWord', word);
    var items = this.control.options || [];
    var index = -1;

    for (var i = 0; i < items.length; i++) {
      var x = items[i];

      if (x.name.toLowerCase().indexOf(word.toLowerCase()) === 0) {
        // console.log(word, x.name);
        index = i;
        break;
      }
    }

    if (index !== -1) {
      var _getContext = rxcomp.getContext(this),
          node = _getContext.node;

      var dropdown = node.querySelector('.dropdown');
      var navDropdown = node.querySelector('.nav--dropdown');
      var item = navDropdown.children[index];
      dropdown.scrollTo(0, item.offsetTop);
    }
  }
  /*
  setOption(item) {
  	this.control.value = item.id;
  	// DropdownDirective.dropdown$.next(null);
  }
  */
  ;

  _proto.setOption = function setOption(item) {
    console.log('setOption', item, this.isMultiple);

    if (this.isMultiple) {
      var value = this.control.value || [];
      var index = value.indexOf(item.id);

      if (index !== -1) {
        // if (value.length > 1) {
        value.splice(index, 1); // }
      } else {
        value.push(item.id);
      }

      this.control.value = value.length ? value.slice() : null;
    } else {
      this.control.value = item.id; // DropdownDirective.dropdown$.next(null);
    }
  };

  _proto.hasOption = function hasOption(item) {
    if (this.isMultiple) {
      var values = this.control.value || [];
      return values.indexOf(item.id) !== -1;
    } else {
      return this.control.value === item.id;
    }
  };

  _proto.onDropped = function onDropped(id) {// console.log('ControlCustomSelectComponent.onDropped', id);
  };

  _proto.getLabel = function getLabel() {
    var value = this.control.value;
    var items = this.control.options || [];

    if (this.isMultiple) {
      value = value || [];

      if (value.length) {
        return value.map(function (v) {
          var item = items.find(function (x) {
            return x.id === v || x.name === v;
          });
          return item ? item.name : '';
        }).join(', ');
      } else {
        return this.labels.select;
      }
    } else {
      var item = items.find(function (x) {
        return x.id === value || x.name === value;
      });

      if (item) {
        return item.name;
      } else {
        return this.labels.select;
      }
    }
  };

  _proto.onDropped = function onDropped($event) {
    // console.log($event);
    this.dropped = $event === this.dropdownId;
  }
  /*
  onClick(event) {
  	const { node } = getContext(this);
  	node.querySelector('.dropdown').classList.add('dropped');
  }
  */

  /*
  onClickOutside(event) {
  	const { node } = getContext(this);
  	node.querySelector('.dropdown').classList.remove('dropped');
  }
  */
  ;

  _createClass(ControlCustomSelectComponent, [{
    key: "isMultiple",
    get: function get() {
      return this.multiple && this.multiple !== false && this.multiple !== 'false';
    }
  }]);

  return ControlCustomSelectComponent;
}(ControlComponent);
ControlCustomSelectComponent.meta = {
  selector: '[control-custom-select]',
  inputs: ['control', 'label', 'multiple', 'name'],
  template:
  /* html */
  "\n\t\t<div class=\"group--form--select\" [class]=\"{ required: control.validators.length, multiple: isMultiple }\" [dropdown]=\"dropdownId\" (dropped)=\"onDropped($event)\">\n\t\t\t<label [innerHTML]=\"label\"></label>\n\t\t\t<span class=\"control--select\" [innerHTML]=\"getLabel()\"></span>\n            <input type=\"text\" style=\"display:none\" class=\"control--select\" [formControl]=\"control\" [formControlName]=\"name\" />\n\t\t\t<svg class=\"icon caret-down\"><use xlink:href=\"#caret-down\"></use></svg>\n\t\t\t<span class=\"required__badge\">required</span>\n\t\t</div>\n\t\t<errors-component [control]=\"control\"></errors-component>\n\t\t<div class=\"dropdown\" [dropdown-item]=\"dropdownId\">\n\t\t\t<div class=\"category\" [innerHTML]=\"label\"></div>\n\t\t\t<ul class=\"nav--dropdown\" [class]=\"{ multiple: isMultiple }\">\n\t\t\t<li *for=\"let item of control.options\" (click)=\"setOption(item)\"><span [class]=\"{ active: hasOption(item) }\" [innerHTML]=\"item.name\"></span></li>\n\t\t\t</ul>\n\t\t</div>\n\t"
  /*  (click)="onClick($event)" (clickOutside)="onClickOutside($event)" */

  /*  <!-- <div class="dropdown" [class]="{ dropped: dropped }"> --> */

};var ControlPasswordComponent = /*#__PURE__*/function (_ControlComponent) {
  _inheritsLoose(ControlPasswordComponent, _ControlComponent);

  function ControlPasswordComponent() {
    return _ControlComponent.apply(this, arguments) || this;
  }

  var _proto = ControlPasswordComponent.prototype;

  _proto.onInit = function onInit() {
    this.label = 'label';
    this.required = false;
  };

  return ControlPasswordComponent;
}(ControlComponent);
ControlPasswordComponent.meta = {
  selector: '[control-password]',
  inputs: ['control', 'label', 'name'],
  template:
  /* html */
  "\n\t\t<div class=\"group--form\" [class]=\"{ required: control.validators.length }\">\n\t\t\t<label [innerHTML]=\"label\"></label>\n\t\t\t<input type=\"password\" class=\"control--text\" [formControl]=\"control\" [placeholder]=\"label\" [formControlName]=\"name\" />\n\t\t\t<span class=\"required__badge\">required</span>\n\t\t</div>\n\t\t<errors-component [control]=\"control\"></errors-component>\n\t"
};var ControlTextComponent = /*#__PURE__*/function (_ControlComponent) {
  _inheritsLoose(ControlTextComponent, _ControlComponent);

  function ControlTextComponent() {
    return _ControlComponent.apply(this, arguments) || this;
  }

  var _proto = ControlTextComponent.prototype;

  _proto.onInit = function onInit() {
    this.label = 'label';
    this.required = false;
  };

  return ControlTextComponent;
}(ControlComponent);
ControlTextComponent.meta = {
  selector: '[control-text]',
  inputs: ['control', 'label', 'name'],
  template:
  /* html */
  "\n\t\t<div class=\"group--form\" [class]=\"{ required: control.validators.length }\">\n\t\t\t<label [innerHTML]=\"label\"></label>\n\t\t\t<input type=\"text\" class=\"control--text\" [formControl]=\"control\" [placeholder]=\"label\" [formControlName]=\"name\" />\n\t\t\t<span class=\"required__badge\">required</span>\n\t\t</div>\n\t\t<errors-component [control]=\"control\"></errors-component>\n\t"
};var ControlTextareaComponent = /*#__PURE__*/function (_ControlComponent) {
  _inheritsLoose(ControlTextareaComponent, _ControlComponent);

  function ControlTextareaComponent() {
    return _ControlComponent.apply(this, arguments) || this;
  }

  var _proto = ControlTextareaComponent.prototype;

  _proto.onInit = function onInit() {
    this.label = 'label';
    this.required = false;
  };

  return ControlTextareaComponent;
}(ControlComponent);
ControlTextareaComponent.meta = {
  selector: '[control-textarea]',
  inputs: ['control', 'label', 'name'],
  template:
  /* html */
  "\n\t\t<div class=\"group--form--textarea\" [class]=\"{ required: control.validators.length }\">\n\t\t\t<label [innerHTML]=\"label\"></label>\n\t\t\t<textarea class=\"control--text\" [formControl]=\"control\" [innerHTML]=\"label\" rows=\"6\" [formControlName]=\"name\"></textarea>\n\t\t\t<span class=\"required__badge\">required</span>\n\t\t</div>\n\t\t<errors-component [control]=\"control\"></errors-component>\n\t"
};var ErrorsComponent = /*#__PURE__*/function (_ControlComponent) {
  _inheritsLoose(ErrorsComponent, _ControlComponent);

  function ErrorsComponent() {
    return _ControlComponent.apply(this, arguments) || this;
  }

  var _proto = ErrorsComponent.prototype;

  _proto.onInit = function onInit() {
    this.labels = window.labels || {};
  };

  _proto.getLabel = function getLabel(key, value) {
    var label = this.labels["error_" + key];
    return label;
  };

  return ErrorsComponent;
}(ControlComponent);
ErrorsComponent.meta = {
  selector: 'errors-component',
  inputs: ['control'],
  template:
  /* html */
  "\n\t<div class=\"inner\" [style]=\"{ display: control.invalid && control.touched ? 'block' : 'none' }\">\n\t\t<div class=\"error\" *for=\"let [key, value] of control.errors\">\n\t\t\t<span [innerHTML]=\"getLabel(key, value)\"></span>\n\t\t\t<!-- <span class=\"key\" [innerHTML]=\"key\"></span> <span class=\"value\" [innerHTML]=\"value | json\"></span> -->\n\t\t</div>\n\t</div>\n\t"
};var GalleryModalComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(GalleryModalComponent, _Component);

  function GalleryModalComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = GalleryModalComponent.prototype;

  _proto.onInit = function onInit() {
    _Component.prototype.onInit.call(this);

    this.mode = 'slider';

    var _getContext = rxcomp.getContext(this),
        parentInstance = _getContext.parentInstance,
        node = _getContext.node;

    if (parentInstance instanceof ModalOutletComponent) {
      var data = this.data = parentInstance.modal.data;
      this.sliderItems = data.items;
      this.sliderIndex = data.index;
    }
  };

  _proto.close = function close() {
    ModalService.reject();
  };

  _proto.toggleMode = function toggleMode() {
    this.mode = this.mode === 'slider' ? 'grid' : 'slider';
    this.pushChanges();
  };

  _proto.onChange = function onChange(event) {// console.log('onChange', event);
  };

  _proto.onTween = function onTween(event) {// console.log('onTween', event);
  };

  _proto.onSelect = function onSelect(index) {
    this.sliderIndex = index;
    this.mode = 'slider';
    this.pushChanges();
  };

  return GalleryModalComponent;
}(rxcomp.Component);
GalleryModalComponent.meta = {
  selector: '[gallery-modal]'
};var GALLERY_MODAL = BASE_HREF + 'gallery-modal.html';

var GalleryComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(GalleryComponent, _Component);

  function GalleryComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = GalleryComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    this.galleryItems.forEach(function (item) {
      if (GalleryComponent.items.indexOf(item) === -1) {
        GalleryComponent.items.push(item);
      }
    });
    this.click$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
      return _this.onOpenGallery(event);
    });
  };

  _proto.click$ = function click$() {
    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    return rxjs.fromEvent(node, 'click');
  };

  _proto.onOpenGallery = function onOpenGallery(event) {
    var items = GalleryComponent.items;
    var index = items.indexOf(this.firstGalleryItem); // console.log('GalleryComponent.onOpenGallery', this.gallery, items, index);

    ModalService.open$({
      src: GALLERY_MODAL,
      data: {
        items: items,
        index: index
      }
    }).pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {// this.pushChanges();
    });
  };

  _createClass(GalleryComponent, [{
    key: "galleryItems",
    get: function get() {
      if (typeof this.gallery === 'string') {
        return [this.gallery];
      } else if (Array.isArray(this.gallery)) {
        return this.gallery;
      } else {
        return [];
      }
    }
  }, {
    key: "firstGalleryItem",
    get: function get() {
      var items = this.galleryItems;

      if (items.length) {
        return items[0];
      }
    }
  }]);

  return GalleryComponent;
}(rxcomp.Component);
GalleryComponent.items = [];
GalleryComponent.meta = {
  selector: '[gallery]',
  inputs: ['gallery']
};var CssService = /*#__PURE__*/function () {
  function CssService() {}

  CssService.height$ = function height$() {
    var style = document.documentElement.style;
    return rxjs.fromEvent(window, 'resize').pipe(operators.map(function (event) {
      return window.innerHeight;
    }), operators.startWith(window.innerHeight), operators.tap(function (height) {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      var vh = height * 0.01; // Then we set the value in the --vh custom property to the root of the document

      style.setProperty('--vh', vh + "px");
    }));
  };

  return CssService;
}();var HeaderComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(HeaderComponent, _Component);

  function HeaderComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = HeaderComponent.prototype;

  _proto.onInit = function onInit() {
    this.mainActive = false;
    CssService.height$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (height) {
      console.log('HeaderComponent.height$', height);
    });
  };

  _proto.onMainToggle = function onMainToggle() {
    this.mainActive = !this.mainActive;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    var items = Array.prototype.slice.call(node.querySelectorAll('.nav--primary-menu > li'));
    gsap.to(items, {
      opacity: this.mainActive ? 1 : 0,
      duration: 0.35,
      stagger: {
        each: 0.05,
        ease: Power3.easeOut
      }
    });
    this.pushChanges();
    this.toggle.next(this.mainActive);
  };

  _proto.onOpenSub = function onOpenSub(subId) {
    this.subId = subId;
    this.pushChanges();
  };

  _proto.onCloseSub = function onCloseSub(subId) {
    if (this.subId === subId) {
      this.subId = null;
      this.pushChanges();
    }
  };

  _proto.isSubOpen = function isSubOpen(subId) {
    return this.subId === subId;
  };

  _proto.isPrimaryHidden = function isPrimaryHidden() {
    return this.subId != null;
  };

  _proto.showPicture = function showPicture(src) {
    var _getContext2 = rxcomp.getContext(this),
        node = _getContext2.node;

    var picture = node.querySelector('.main-menu__picture');
    var img;

    if (src) {
      img = document.createElement('img');

      img.onload = function () {
        picture.appendChild(img);
        gsap.set(img, {
          opacity: 0
        });
        gsap.to(img, {
          opacity: 1,
          duration: 0.35,
          onComplete: function onComplete() {
            while (picture.childElementCount > 1) {
              picture.removeChild(picture.children[0]);
            }
          }
        });
      };

      img.src = src;
    } else {
      img = picture.querySelector('img');

      if (img) {
        gsap.to(img, {
          opacity: 0,
          duration: 0.35,
          onComplete: function onComplete() {
            while (picture.childElementCount > 0) {
              picture.removeChild(picture.children[0]);
            }
          }
        });
      }
    }
  };

  return HeaderComponent;
}(rxcomp.Component);
HeaderComponent.meta = {
  selector: 'header',
  outputs: ['toggle']
};/*
['quot', 'amp', 'apos', 'lt', 'gt', 'nbsp', 'iexcl', 'cent', 'pound', 'curren', 'yen', 'brvbar', 'sect', 'uml', 'copy', 'ordf', 'laquo', 'not', 'shy', 'reg', 'macr', 'deg', 'plusmn', 'sup2', 'sup3', 'acute', 'micro', 'para', 'middot', 'cedil', 'sup1', 'ordm', 'raquo', 'frac14', 'frac12', 'frac34', 'iquest', 'Agrave', 'Aacute', 'Acirc', 'Atilde', 'Auml', 'Aring', 'AElig', 'Ccedil', 'Egrave', 'Eacute', 'Ecirc', 'Euml', 'Igrave', 'Iacute', 'Icirc', 'Iuml', 'ETH', 'Ntilde', 'Ograve', 'Oacute', 'Ocirc', 'Otilde', 'Ouml', 'times', 'Oslash', 'Ugrave', 'Uacute', 'Ucirc', 'Uuml', 'Yacute', 'THORN', 'szlig', 'agrave', 'aacute', 'atilde', 'auml', 'aring', 'aelig', 'ccedil', 'egrave', 'eacute', 'ecirc', 'euml', 'igrave', 'iacute', 'icirc', 'iuml', 'eth', 'ntilde', 'ograve', 'oacute', 'ocirc', 'otilde', 'ouml', 'divide', 'oslash', 'ugrave', 'uacute', 'ucirc', 'uuml', 'yacute', 'thorn', 'yuml', 'amp', 'bull', 'deg', 'infin', 'permil', 'sdot', 'plusmn', 'dagger', 'mdash', 'not', 'micro', 'perp', 'par', 'euro', 'pound', 'yen', 'cent', 'copy', 'reg', 'trade', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
['"', '&', ''', '<', '>', ' ', '¡', '¢', '£', '¤', '¥', '¦', '§', '¨', '©', 'ª', '«', '¬', '­', '®', '¯', '°', '±', '²', '³', '´', 'µ', '¶', '·', '¸', '¹', 'º', '»', '¼', '½', '¾', '¿', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß', 'à', 'á', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ', '&', '•', '°', '∞', '‰', '⋅', '±', '†', '—', '¬', 'µ', '⊥', '∥', '€', '£', '¥', '¢', '©', '®', '™', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];
*/

var HtmlPipe = /*#__PURE__*/function (_Pipe) {
  _inheritsLoose(HtmlPipe, _Pipe);

  function HtmlPipe() {
    return _Pipe.apply(this, arguments) || this;
  }

  HtmlPipe.transform = function transform(value) {
    if (value) {
      value = value.replace(/&#(\d+);/g, function (m, n) {
        return String.fromCharCode(parseInt(n));
      });
      var escapes = ['quot', 'amp', 'apos', 'lt', 'gt', 'nbsp', 'iexcl', 'cent', 'pound', 'curren', 'yen', 'brvbar', 'sect', 'uml', 'copy', 'ordf', 'laquo', 'not', 'shy', 'reg', 'macr', 'deg', 'plusmn', 'sup2', 'sup3', 'acute', 'micro', 'para', 'middot', 'cedil', 'sup1', 'ordm', 'raquo', 'frac14', 'frac12', 'frac34', 'iquest', 'Agrave', 'Aacute', 'Acirc', 'Atilde', 'Auml', 'Aring', 'AElig', 'Ccedil', 'Egrave', 'Eacute', 'Ecirc', 'Euml', 'Igrave', 'Iacute', 'Icirc', 'Iuml', 'ETH', 'Ntilde', 'Ograve', 'Oacute', 'Ocirc', 'Otilde', 'Ouml', 'times', 'Oslash', 'Ugrave', 'Uacute', 'Ucirc', 'Uuml', 'Yacute', 'THORN', 'szlig', 'agrave', 'aacute', 'atilde', 'auml', 'aring', 'aelig', 'ccedil', 'egrave', 'eacute', 'ecirc', 'euml', 'igrave', 'iacute', 'icirc', 'iuml', 'eth', 'ntilde', 'ograve', 'oacute', 'ocirc', 'otilde', 'ouml', 'divide', 'oslash', 'ugrave', 'uacute', 'ucirc', 'uuml', 'yacute', 'thorn', 'yuml', 'amp', 'bull', 'deg', 'infin', 'permil', 'sdot', 'plusmn', 'dagger', 'mdash', 'not', 'micro', 'perp', 'par', 'euro', 'pound', 'yen', 'cent', 'copy', 'reg', 'trade', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
      var unescapes = ['"', '&', '\'', '<', '>', ' ', '¡', '¢', '£', '¤', '¥', '¦', '§', '¨', '©', 'ª', '«', '¬', '­', '®', '¯', '°', '±', '²', '³', '´', 'µ', '¶', '·', '¸', '¹', 'º', '»', '¼', '½', '¾', '¿', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß', 'à', 'á', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ', '&', '•', '°', '∞', '‰', '⋅', '±', '†', '—', '¬', 'µ', '⊥', '∥', '€', '£', '¥', '¢', '©', '®', '™', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];
      var rx = new RegExp("(&" + escapes.join(';)|(&') + ";)", 'g');
      value = value.replace(rx, function () {
        for (var i = 1; i < arguments.length; i++) {
          if (arguments[i]) {
            // console.log(arguments[i], unescapes[i - 1]);
            return unescapes[i - 1];
          }
        }
      }); // console.log(value);

      return value;
    }
  };

  return HtmlPipe;
}(rxcomp.Pipe);
HtmlPipe.meta = {
  name: 'html'
};var FilterMode = {
  SELECT: 'select',
  AND: 'and',
  OR: 'or'
};

var FilterItem = /*#__PURE__*/function () {
  _createClass(FilterItem, [{
    key: "empty",
    get: function get() {
      return this.values.length === 0;
    }
  }]);

  function FilterItem(filter) {
    this.change$ = new rxjs.BehaviorSubject();
    this.mode = FilterMode.SELECT;
    this.placeholder = 'Select';
    this.values = [];
    this.options = [];

    if (filter) {
      if (filter.mode === FilterMode.SELECT) {
        filter.options.unshift({
          label: filter.placeholder,
          values: []
        });
      }

      Object.assign(this, filter);
    }
  }

  var _proto = FilterItem.prototype;

  _proto.filter = function filter(item, value) {
    return true; // item.options.indexOf(value) !== -1;
  };

  _proto.match = function match(item) {
    var _this = this;

    var match;

    if (this.mode === FilterMode.OR) {
      match = this.values.length ? false : true;
      this.values.forEach(function (value) {
        match = match || _this.filter(item, value);
      });
    } else {
      match = true;
      this.values.forEach(function (value) {
        match = match && _this.filter(item, value);
      });
    }

    return match;
  };

  _proto.getSelectedOption = function getSelectedOption() {
    var _this2 = this;

    return this.options.find(function (x) {
      return _this2.has(x);
    });
  };

  _proto.getLabel = function getLabel() {
    if (this.mode === FilterMode.SELECT) {
      var selectedOption = this.getSelectedOption();
      return selectedOption ? selectedOption.label : this.placeholder;
    } else {
      return this.label;
    }
  };

  _proto.hasAny = function hasAny() {
    return this.values.length > 0;
  };

  _proto.has = function has(item) {
    return this.values.indexOf(item.value) !== -1;
  };

  _proto.set = function set(item) {
    if (this.mode === FilterMode.SELECT) {
      this.values = [];
    }

    var index = this.values.indexOf(item.value);

    if (index === -1) {
      if (item.value !== undefined) {
        this.values.push(item.value);
      }
    }

    if (this.mode === FilterMode.SELECT) {
      this.placeholder = item.label;
    } // console.log('FilterItem.set', item);


    this.change$.next();
  };

  _proto.remove = function remove(item) {
    var index = this.values.indexOf(item.value);

    if (index !== -1) {
      this.values.splice(index, 1);
    }

    if (this.mode === FilterMode.SELECT) {
      var first = this.options[0];
      this.placeholder = first.label;
    } // console.log('FilterItem.remove', item);


    this.change$.next();
  };

  _proto.toggle = function toggle(item) {
    if (this.has(item)) {
      this.remove(item);
    } else {
      this.set(item);
    }
  };

  _proto.toggleActive = function toggleActive() {
    this.active = !this.active;
  };

  _proto.clear = function clear() {
    this.values = [];

    if (this.mode === FilterMode.SELECT) {
      var first = this.options[0];
      this.placeholder = first.label;
    } // console.log('FilterItem.clear', item);


    this.change$.next();
  };

  return FilterItem;
}();var LocationService = /*#__PURE__*/function () {
  function LocationService() {}

  LocationService.get = function get(key) {
    var params = new URLSearchParams(window.location.search); // console.log('LocationService.get', params);

    return params.get(key);
  };

  LocationService.set = function set(keyOrValue, value) {
    var params = new URLSearchParams(window.location.search);

    if (typeof keyOrValue === 'string') {
      params.set(keyOrValue, value);
    } else {
      params.set(keyOrValue, '');
    }

    this.replace(params); // console.log('LocationService.set', params, keyOrValue, value);
  };

  LocationService.replace = function replace(params) {
    if (window.history && window.history.pushState) {
      var title = document.title;
      var url = window.location.href.split('?')[0] + "?" + params.toString();
      window.history.pushState(params.toString(), title, url);
    }
  };

  LocationService.deserialize = function deserialize(key) {
    var encoded = this.get('params');
    return this.decode(key, encoded);
  };

  LocationService.serialize = function serialize(keyOrValue, value) {
    var params = this.deserialize();
    var encoded = this.encode(keyOrValue, value, params);
    this.set('params', encoded);
  };

  LocationService.decode = function decode(key, encoded) {
    var decoded = null;

    if (encoded) {
      var json = window.atob(encoded);
      decoded = JSON.parse(json);
    }

    if (key && decoded) {
      decoded = decoded[key];
    }

    return decoded || null;
  };

  LocationService.encode = function encode(keyOrValue, value, params) {
    params = params || {};
    var encoded = null;

    if (typeof keyOrValue === 'string') {
      params[keyOrValue] = value;
    } else {
      params = keyOrValue;
    }

    var json = JSON.stringify(params);
    encoded = window.btoa(json);
    return encoded;
  };

  return LocationService;
}();var FilterService = /*#__PURE__*/function () {
  function FilterService(options, initialParams, callback) {
    var filters = {};
    this.filters = filters;

    if (options) {
      Object.keys(options).forEach(function (key) {
        var filter = new FilterItem(options[key]);

        if (typeof callback === 'function') {
          callback(key, filter);
        }

        filters[key] = filter;
      });
      this.deserialize(this.filters, initialParams);
    }
  }

  var _proto = FilterService.prototype;

  _proto.getParamsCount = function getParamsCount(params) {
    if (params) {
      var paramsCount = Object.keys(params).reduce(function (p, c, i) {
        var values = params[c];
        return p + (values ? values.length : 0);
      }, 0);
      return paramsCount;
    } else {
      return 0;
    }
  };

  _proto.deserialize = function deserialize(filters, initialParams) {
    var params;

    if (initialParams && this.getParamsCount(initialParams)) {
      params = initialParams;
    }

    var locationParams = LocationService.deserialize('filters');

    if (locationParams && this.getParamsCount(locationParams)) {
      params = locationParams;
    }

    if (params) {
      Object.keys(filters).forEach(function (key) {
        filters[key].values = params[key] || [];
      });
    }

    return filters;
  };

  _proto.serialize = function serialize(filters) {
    var params = {};
    var any = false;
    Object.keys(filters).forEach(function (x) {
      var filter = filters[x];

      if (filter.values && filter.values.length > 0) {
        params[x] = filter.values;
        any = true;
      }
    });

    if (!any) {
      params = null;
    } // console.log('FilterService.serialize', params);


    LocationService.serialize('filters', params);
    return params;
  };

  _proto.items$ = function items$(items) {
    var _this = this;

    var filters = this.filters;
    var changes = Object.keys(filters).map(function (key) {
      return filters[key].change$;
    });
    this.updateFilterStates(filters, items, true);
    return rxjs.merge.apply(void 0, changes).pipe(operators.auditTime(1), // tap(() => console.log(filters)),
    operators.tap(function () {
      return _this.serialize(filters);
    }), operators.map(function () {
      return _this.filterItems(items);
    }), operators.tap(function () {
      return _this.updateFilterStates(filters, items);
    }));
  };

  _proto.filterItems = function filterItems(items, skipFilter) {
    var _this2 = this;

    var filters = Object.keys(this.filters).map(function (x) {
      return _this2.filters[x];
    }).filter(function (x) {
      return x.values && x.values.length > 0;
    });
    items = items.filter(function (item) {
      var has = true;
      filters.forEach(function (filter) {
        if (filter !== skipFilter) {
          has = has && filter.match(item);
        }
      });
      return has;
    });
    return items;
  };

  _proto.updateFilterStates = function updateFilterStates(filters, items, initialCount) {
    var _this3 = this;

    Object.keys(filters).forEach(function (x) {
      var filter = filters[x];
      var filteredItems = initialCount ? items : _this3.filterItems(items, filter);
      filter.options.forEach(function (option) {
        var count = 0;

        if (option.value) {
          var i = 0;

          while (i < filteredItems.length) {
            var item = filteredItems[i];

            if (filter.filter(item, option.value)) {
              count++;
            }

            i++;
          }
        } else {
          count = filteredItems.length;
        }

        initialCount ? option.initialCount = count : option.count = count;
        option.disabled = count === 0;
      });

      if (initialCount) {
        filter.options.sort(function (a, b) {
          return b.initialCount - a.initialCount;
        });
      }
    });
  };

  return FilterService;
}();var MagazineService = /*#__PURE__*/function () {
  function MagazineService() {}

  MagazineService.all$ = function all$() {
    if (STATIC) {
      return ApiService.staticGet$('/magazine/all').pipe(operators.map(function (response) {
        return response.data;
      }));
    } else {
      return ApiService.get$('/magazine/all').pipe(operators.map(function (response) {
        return response.data;
      }));
    }
  };

  MagazineService.filters$ = function filters$() {
    if (STATIC) {
      return ApiService.staticGet$('/magazine/filters').pipe(operators.map(function (response) {
        return response.data;
      }));
    } else {
      return ApiService.get$('/magazine/filters').pipe(operators.map(function (response) {
        return response.data;
      }));
    }
  };

  return MagazineService;
}();var ITEMS_PER_PAGE = 9;

var MagazineComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(MagazineComponent, _Component);

  function MagazineComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = MagazineComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    this.maxVisibleItems = ITEMS_PER_PAGE;
    this.visibleItems = [];
    this.items = [];
    this.filters = {};
    this.busy = true;
    this.load$().pipe(operators.first()).subscribe(function (data) {
      _this.busy = false;
      _this.items = data[0];
      _this.filters = data[1];

      _this.onLoad();

      _this.pushChanges();
    });
  };

  _proto.onLoad = function onLoad() {
    var _this2 = this;

    var items = this.items;
    var filters = this.filters;
    Object.keys(filters).forEach(function (key) {
      filters[key].mode = FilterMode.SELECT;
    });
    var initialParams = {};
    var filterService = new FilterService(filters, initialParams, function (key, filter) {
      switch (key) {
        case 'category':
        case 'year':
          filter.filter = function (item, value) {
            return item[key] === value;
          };

          break;
      }
    });
    this.filterService = filterService;
    this.filters = filterService.filters;
    filterService.items$(items).pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
      _this2.maxVisibleItems = ITEMS_PER_PAGE;
      _this2.items = items;
      _this2.visibleItems = items.slice(0, _this2.maxVisibleItems);

      _this2.pushChanges();
    });
    this.scroll$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe();
  };

  _proto.scroll$ = function scroll$() {
    var _this3 = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    return rxjs.fromEvent(window, 'scroll').pipe(operators.tap(function () {
      if (_this3.items.length > _this3.visibleItems.length && !_this3.busy) {
        var rect = node.getBoundingClientRect();

        if (rect.bottom < window.innerHeight) {
          _this3.busy = true;

          _this3.pushChanges();

          setTimeout(function () {
            _this3.busy = false;
            _this3.maxVisibleItems += ITEMS_PER_PAGE;
            _this3.visibleItems = _this3.items.slice(0, _this3.maxVisibleItems);

            _this3.pushChanges();
          }, 1000);
        }
      }
    }));
  };

  _proto.load$ = function load$() {
    return rxjs.combineLatest([MagazineService.all$(), MagazineService.filters$()]);
  };

  _proto.toggleFilter = function toggleFilter(filter) {
    var _this4 = this;

    Object.keys(this.filters).forEach(function (key) {
      var f = _this4.filters[key];

      if (f === filter) {
        f.active = !f.active;
      } else {
        f.active = false;
      }
    });
    this.pushChanges();
  };

  _proto.clearFilter = function clearFilter(event, filter) {
    event.preventDefault();
    event.stopImmediatePropagation();
    filter.clear();
    this.pushChanges();
  };

  return MagazineComponent;
}(rxcomp.Component);
MagazineComponent.meta = {
  selector: '[magazine]'
};var ModalComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ModalComponent, _Component);

  function ModalComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ModalComponent.prototype;

  _proto.onInit = function onInit() {
    var _getContext = rxcomp.getContext(this),
        parentInstance = _getContext.parentInstance;

    if (parentInstance instanceof ModalOutletComponent) {
      this.data = parentInstance.modal.data;
    }
  };

  _proto.close = function close() {
    ModalService.reject();
  };

  return ModalComponent;
}(rxcomp.Component);
ModalComponent.meta = {
  selector: '[modal]'
};var PortfolioService = /*#__PURE__*/function () {
  function PortfolioService() {}

  PortfolioService.all$ = function all$() {
    if (STATIC) {
      return ApiService.staticGet$('/portfolio/stand/all').pipe(operators.map(function (response) {
        return response.data;
      }));
    } else {
      return ApiService.get$('/portfolio/stand/all').pipe(operators.map(function (response) {
        return response.data;
      }));
    }
  };

  PortfolioService.filters$ = function filters$() {
    if (STATIC) {
      return ApiService.staticGet$('/portfolio/stand/filters').pipe(operators.map(function (response) {
        return response.data;
      }));
    } else {
      return ApiService.get$('/portfolio/stand/filters').pipe(operators.map(function (response) {
        return response.data;
      }));
    }
  };

  return PortfolioService;
}();var ITEMS_PER_PAGE$1 = 9;

var PortfolioComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(PortfolioComponent, _Component);

  function PortfolioComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = PortfolioComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    this.maxVisibleItems = ITEMS_PER_PAGE$1;
    this.firstItem = null;
    this.visibleItems = null;
    this.items = [];
    this.filters = {};
    this.busy = true;
    this.load$().pipe(operators.first()).subscribe(function (data) {
      _this.busy = false;
      _this.items = data[0];
      _this.filters = data[1];

      _this.onLoad();

      _this.pushChanges();
    });
  };

  _proto.onLoad = function onLoad() {
    var _this2 = this;

    var items = this.items;
    var filters = this.filters;
    Object.keys(filters).forEach(function (key) {
      filters[key].mode = FilterMode.SELECT;
    });
    var initialParams = {};
    var filterService = new FilterService(filters, initialParams, function (key, filter) {
      switch (key) {
        case 'area':
        case 'city':
          filter.filter = function (item, value) {
            return item[key] === value;
          };

          break;
      }
    });
    this.filterService = filterService;
    this.filters = filterService.filters;
    filterService.items$(items).pipe(operators.map(function (items) {
      return _this2.sortPatternItems(items);
    }), operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
      _this2.maxVisibleItems = ITEMS_PER_PAGE$1;
      _this2.items = items;
      _this2.visibleItems = items.slice(0, _this2.maxVisibleItems);

      _this2.pushChanges();
    });
    this.scroll$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe();
  };

  _proto.sortPatternItems = function sortPatternItems(items) {
    var copy = items.slice();
    var firstItem = this.firstItem = copy.find(function (x) {
      return x.important;
    });

    if (firstItem) {
      copy.splice(copy.indexOf(firstItem), 1);
    }

    var order = [false, false, true, false, false, false, false, true];
    var sorted = [];
    var i = 0;

    var _loop = function _loop() {
      var important = order[i % order.length];
      var item = copy.find(function (x) {
        return x.important === important;
      });

      if (item) {
        copy.splice(copy.indexOf(item), 1);
        sorted.push(item);
      } else {
        sorted.push(copy.shift());
      }

      i++;
    };

    while (copy.length) {
      _loop();
    }

    return sorted;
  };

  _proto.scroll$ = function scroll$() {
    var _this3 = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    return rxjs.fromEvent(window, 'scroll').pipe(operators.tap(function () {
      if (_this3.items.length > _this3.visibleItems.length && !_this3.busy) {
        var rect = node.getBoundingClientRect();

        if (rect.bottom < window.innerHeight) {
          _this3.busy = true;

          _this3.pushChanges();

          setTimeout(function () {
            _this3.busy = false;
            _this3.maxVisibleItems += ITEMS_PER_PAGE$1;
            _this3.visibleItems = _this3.items.slice(0, _this3.maxVisibleItems);

            _this3.pushChanges();
          }, 1000);
        }
      }
    }));
  };

  _proto.load$ = function load$() {
    return rxjs.combineLatest([PortfolioService.all$(), PortfolioService.filters$()]);
  };

  _proto.toggleFilter = function toggleFilter(filter) {
    var _this4 = this;

    Object.keys(this.filters).forEach(function (key) {
      var f = _this4.filters[key];

      if (f === filter) {
        f.active = !f.active;
      } else {
        f.active = false;
      }
    });
    this.pushChanges();
  };

  _proto.clearFilter = function clearFilter(event, filter) {
    event.preventDefault();
    event.stopImmediatePropagation();
    filter.clear();
    this.pushChanges();
  };

  return PortfolioComponent;
}(rxcomp.Component);
PortfolioComponent.meta = {
  selector: '[portfolio]'
};var ScrollToDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(ScrollToDirective, _Directive);

  function ScrollToDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = ScrollToDirective.prototype;

  _proto.onInit = function onInit() {
    this.initialFocus = false;

    var _getContext = rxcomp.getContext(this),
        module = _getContext.module,
        node = _getContext.node;

    var expression = this.expression = node.getAttribute("(scrollTo)");
    this.outputFunction = module.makeFunction(expression, ['$event']);
    this.scrollTo$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function () {});
  };

  _proto.scrollTo$ = function scrollTo$() {
    var _this = this;

    var _getContext2 = rxcomp.getContext(this),
        module = _getContext2.module,
        node = _getContext2.node,
        parentInstance = _getContext2.parentInstance;

    return rxjs.fromEvent(node, 'click').pipe(operators.tap(function (event) {
      var result = module.resolve(_this.outputFunction, parentInstance, event);

      if (typeof result === 'string') {
        var target = document.querySelector(result);

        if (target) {
          var from = _this.currentTop();

          var to = from + target.getBoundingClientRect().top - 50;
          var o = {
            pow: 0
          };
          var html = document.querySelector('html');
          gsap.set(html, {
            'scroll-behavior': 'auto'
          });
          gsap.to(o, Math.abs(to - from) / 2000, {
            pow: 1,
            ease: Quad.easeOut,
            overwrite: 'all',
            onUpdate: function onUpdate() {
              window.scrollTo(0, from + (to - from) * o.pow);
            },
            onComplete: function onComplete() {
              gsap.set(html, {
                'scroll-behavior': 'smooth'
              });
            }
          });
        }
      }
    }), operators.shareReplay(1));
  };

  _proto.currentTop = function currentTop() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset; // Internet Explorer 6 - standards mode

    if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop; // Internet Explorer 6, 7 and 8

    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
  };

  return ScrollToDirective;
}(rxcomp.Directive);
ScrollToDirective.meta = {
  selector: "[(scrollTo)]"
};var DownloadService = /*#__PURE__*/function () {
  function DownloadService() {}

  DownloadService.download = function download(blob, fileName) {
    if (fileName === void 0) {
      fileName = 'download.txt';
    }

    // var json = JSON.stringify(data),
    // blob = new Blob([json], {type: "octet/stream"}),
    var url = window.URL.createObjectURL(blob);
    var a = this.a;
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  _createClass(DownloadService, null, [{
    key: "a",
    get: function get() {
      var a = this.a_;

      if (!a) {
        a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        this.a_ = a;
      }

      return a;
    }
  }]);

  return DownloadService;
}();var src = STATIC ? '/stipa/auth-modal.html' : '/stipa/auth-modal.html';

var SecureDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(SecureDirective, _Directive);

  function SecureDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  var _proto = SecureDirective.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    rxjs.fromEvent(node, 'click').pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
      event.preventDefault();

      _this.tryDownloadHref();
    });
  };

  _proto.tryDownloadHref = function tryDownloadHref() {
    var _this2 = this;

    var _getContext2 = rxcomp.getContext(this),
        node = _getContext2.node;

    var href = node.getAttribute('href');
    HttpService.get$(href, undefined, 'blob').pipe(operators.first(), operators.map(function (response) {
      return response.data;
    })).subscribe(function (blob) {
      DownloadService.download(blob, href.split('/').pop());
    }, function (error) {
      console.log('SecureDirective.tryDownloadHref', error);

      _this2.onLogin();
    });
  };

  _proto.onLogin = function onLogin() {
    var _this3 = this;

    console.log('SecureDirective.onLogin');
    ModalService.open$({
      src: src,
      data: {
        view: 1
      }
    }).pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
      // console.log('SecureDirective.onLogin', event);
      if (event instanceof ModalResolveEvent) {
        UserService.setUser(event.data);

        _this3.tryDownloadHref();
      }
    }); // this.pushChanges();
  };

  return SecureDirective;
}(rxcomp.Directive);
SecureDirective.meta = {
  selector: '[secure]'
};var ShareComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ShareComponent, _Component);

  function ShareComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ShareComponent.prototype;

  _proto.onInit = function onInit() {
    console.log('ShareComponent.onInit', this.share, this.title);
  };

  _proto.onChanges = function onChanges() {
    console.log('ShareComponent.onChanges', this.share, this.title);
  };

  _proto.getTitle = function getTitle() {
    var title = this.title ? this.title : document.title;
    return this.encodeURI(title);
  };

  _proto.getUrl = function getUrl() {
    var url = this.share;

    if (url) {
      if (url.indexOf(window.location.origin) === -1) {
        url = window.location.origin + (url.indexOf('/') === 0 ? url : '/' + url);
      }
    } else {
      url = window.location.href;
    }

    return this.encodeURI(url);
  };

  _proto.encodeURI = function encodeURI(text) {
    return encodeURIComponent(text).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  };

  _createClass(ShareComponent, [{
    key: "facebookUrl",
    get: function get() {
      return "https://www.facebook.com/sharer/sharer.php?u=" + this.getUrl();
    }
  }, {
    key: "pinterestUrl",
    get: function get() {
      return "https://www.pinterest.com/pin/create/button/?url=" + this.getUrl() + "&media=&description=" + this.getTitle();
    }
  }, {
    key: "linkedInUrl",
    get: function get() {
      return "https://www.linkedin.com/shareArticle?mini=true&url=" + this.getUrl() + "&title=" + this.getTitle();
    }
  }, {
    key: "twitterUrl",
    get: function get() {
      return "https://twitter.com/intent/tweet?text=" + this.getTitle() + "%20" + this.getUrl();
    }
  }, {
    key: "whatsappUrl",
    get: function get() {
      return "https://api.whatsapp.com/send?text=" + this.getUrl();
    }
  }, {
    key: "mailToUrl",
    get: function get() {
      return "mailto:?subject=" + this.getTitle() + "&body=" + this.getUrl();
    }
  }]);

  return ShareComponent;
}(rxcomp.Component);
ShareComponent.meta = {
  selector: '[share]',
  inputs: ['share', 'title'],
  template:
  /* html */
  "\n\t<ul class=\"nav--share\">\n\t\t<li>\n\t\t\t<a [href]=\"facebookUrl\" target=\"_blank\"><svg class=\"facebook\"><use xlink:href=\"#facebook\"></use></svg></a>\n\t\t</li>\n\t\t<li>\n\t\t\t<a [href]=\"twitterUrl\" target=\"_blank\"><svg class=\"twitter\"><use xlink:href=\"#twitter\"></use></svg></a>\n\t\t</li>\n\t\t<li>\n\t\t\t<a [href]=\"pinterestUrl\" target=\"_blank\"><svg class=\"pinterest\"><use xlink:href=\"#pinterest\"></use></svg></a>\n\t\t</li>\n\t\t<li>\n\t\t\t<a [href]=\"linkedInUrl\" target=\"_blank\"><svg class=\"linkedin\"><use xlink:href=\"#linkedin\"></use></svg></a>\n\t\t</li>\n\t\t<!--\n\t\t<li>\n\t\t\t<a [href]=\"whatsappUrl\" target=\"_blank\"><svg class=\"whatsapp\"><use xlink:href=\"#whatsapp\"></use></svg></a>\n\t\t</li>\n\t\t<li>\n\t\t\t<a [href]=\"mailToUrl\"><svg class=\"email\"><use xlink:href=\"#email\"></use></svg></a>\n\t\t</li>\n\t\t-->\n\t</ul>\n\t"
};var DragPoint = function DragPoint() {
  this.x = 0;
  this.y = 0;
};
var DragEvent = function DragEvent(options) {
  if (options) {
    Object.assign(this, options);
  }
};
var DragDownEvent = /*#__PURE__*/function (_DragEvent) {
  _inheritsLoose(DragDownEvent, _DragEvent);

  function DragDownEvent(options) {
    var _this;

    _this = _DragEvent.call(this, options) || this;
    _this.distance = new DragPoint();
    _this.strength = new DragPoint();
    _this.speed = new DragPoint();
    return _this;
  }

  return DragDownEvent;
}(DragEvent);
var DragMoveEvent = /*#__PURE__*/function (_DragEvent2) {
  _inheritsLoose(DragMoveEvent, _DragEvent2);

  function DragMoveEvent(options) {
    var _this2;

    _this2 = _DragEvent2.call(this, options) || this;
    _this2.distance = new DragPoint();
    _this2.strength = new DragPoint();
    _this2.speed = new DragPoint();
    return _this2;
  }

  return DragMoveEvent;
}(DragEvent);
var DragUpEvent = /*#__PURE__*/function (_DragEvent3) {
  _inheritsLoose(DragUpEvent, _DragEvent3);

  function DragUpEvent(options) {
    return _DragEvent3.call(this, options) || this;
  }

  return DragUpEvent;
}(DragEvent);

var DragService = /*#__PURE__*/function () {
  function DragService() {}

  DragService.getPosition = function getPosition(event, point) {
    if (event instanceof MouseEvent) {
      point ? (point.x = event.clientX, point.y = event.clientY) : point = {
        x: event.clientX,
        y: event.clientY
      };
    } else if (event instanceof TouchEvent) {
      if (event.touches.length > 0) {
        point ? (point.x = event.touches[0].pageX, point.y = event.touches[0].pageY) : point = {
          x: event.touches[0].pageX,
          y: event.touches[0].pageY
        };
      }
    }

    return point;
  };

  DragService.down$ = function down$(target, events$) {
    var _this3 = this;

    var downEvent;
    return rxjs.merge(rxjs.fromEvent(target, 'mousedown'), rxjs.fromEvent(target, 'touchstart')).pipe(operators.map(function (event) {
      downEvent = downEvent || new DragDownEvent();
      downEvent.node = target;
      downEvent.target = event.target;
      downEvent.originalEvent = event;
      downEvent.down = _this3.getPosition(event, downEvent.down);

      if (downEvent.down) {
        downEvent.distance = new DragPoint();
        downEvent.strength = new DragPoint();
        downEvent.speed = new DragPoint();
        events$.next(downEvent);
        return downEvent;
      }
    }), operators.filter(function (event) {
      return event !== undefined;
    }));
  };

  DragService.move$ = function move$(target, events$, dismiss$, downEvent) {
    var _this4 = this;

    var moveEvent;
    return rxjs.fromEvent(document, downEvent.originalEvent instanceof MouseEvent ? 'mousemove' : 'touchmove').pipe(operators.startWith(downEvent), operators.map(function (event) {
      moveEvent = moveEvent || new DragMoveEvent();
      moveEvent.node = target;
      moveEvent.target = event.target;
      moveEvent.originalEvent = event;
      moveEvent.position = _this4.getPosition(event, moveEvent.position);
      var dragging = downEvent.down !== undefined && moveEvent.position !== undefined;

      if (dragging) {
        moveEvent.distance.x = moveEvent.position.x - downEvent.down.x;
        moveEvent.distance.y = moveEvent.position.y - downEvent.down.y;
        moveEvent.strength.x = moveEvent.distance.x / window.innerWidth * 2;
        moveEvent.strength.y = moveEvent.distance.y / window.innerHeight * 2;
        moveEvent.speed.x = downEvent.speed.x + (moveEvent.strength.x - downEvent.strength.x) * 0.1;
        moveEvent.speed.y = downEvent.speed.y + (moveEvent.strength.y - downEvent.strength.y) * 0.1;
        downEvent.distance.x = moveEvent.distance.x;
        downEvent.distance.y = moveEvent.distance.y;
        downEvent.speed.x = moveEvent.speed.x;
        downEvent.speed.y = moveEvent.speed.y;
        downEvent.strength.x = moveEvent.strength.x;
        downEvent.strength.y = moveEvent.strength.y;
        events$.next(moveEvent);
        return moveEvent;
      }
    }));
  };

  DragService.up$ = function up$(target, events$, dismiss$, downEvent) {
    var upEvent;
    return rxjs.fromEvent(document, downEvent.originalEvent instanceof MouseEvent ? 'mouseup' : 'touchend').pipe(operators.map(function (event) {
      upEvent = upEvent || new DragUpEvent();
      events$.next(upEvent);
      dismiss$.next(); // console.log(downEvent.distance);

      if (Math.abs(downEvent.distance.x) > 10) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      return upEvent;
    }));
  };

  DragService.events$ = function events$(target) {
    var _this5 = this;

    target = target || document;
    var events$ = new rxjs.ReplaySubject(1);
    var dismiss$ = new rxjs.Subject();
    return this.down$(target, events$).pipe(operators.switchMap(function (downEvent) {
      return rxjs.merge(_this5.move$(target, events$, dismiss$, downEvent), _this5.up$(target, events$, dismiss$, downEvent)).pipe(operators.takeUntil(dismiss$));
    }), operators.switchMap(function () {
      return events$;
    }));
  };

  return DragService;
}();var SliderComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(SliderComponent, _Component);

  function SliderComponent() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = SliderComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    this.container = node;
    this.wrapper = node.querySelector('.slider__wrapper');

    if (this.items.length === 0) {
      var items = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
      this.items = items;
    } // console.log('SliderComponent.onInit', this.items);


    this.userGesture = false; // this.userGesture$ = new Subject();

    setTimeout(function () {
      // this.change.next(this.current);

      /*
      gsap.set(this.wrapper, {
      	x: -100 * this.current + '%',
      });
      */
      _this.slider$().pipe(operators.takeUntil(_this.unsubscribe$)).subscribe(function (event) {// console.log('dragService', event);
      });
    }, 1);
    this.changed$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe();
    setTimeout(function () {
      _this.setActiveState();
    }, 500);
    /*
    this.autoplay$().pipe(
    	takeUntil(this.unsubscribe$),
    ).subscribe(() => {
    	this.pushChanges();
    });
    */
  };

  _proto.changed$ = function changed$() {
    var _this2 = this;

    return this.change.pipe(operators.tap(function () {
      return _this2.setActiveState();
    }));
  };

  _proto.setActiveState = function setActiveState() {
    var _this3 = this;

    if (this.to) {
      clearTimeout(this.to);
      this.to = null;
    }

    var current = this.current;

    var _getContext2 = rxcomp.getContext(this),
        node = _getContext2.node;

    var slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
    var currentSlide;
    slides.forEach(function (slide, i) {
      if (i === current) {
        currentSlide = slide;
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    var videos = Array.prototype.slice.call(node.querySelectorAll('video'));
    videos.forEach(function (video) {
      if (!video.paused) {
        video.pause();
      }
    });

    if (currentSlide) {
      var video = currentSlide.querySelector('video');

      if (video) {
        var onEnded = function onEnded() {
          // console.log(video, 'onEnded');
          video.removeEventListener('ended', onEnded); // if (!this.userGesture) {

          _this3.current = (_this3.current + 1) % _this3.items.length;

          _this3.pushChanges(); // }

        };

        video.addEventListener('ended', onEnded);
        video.play();
      } else {
        var autoplay = typeof this.autoplay === 'number' ? this.autoplay : 4000;

        if (!this.userGesture) {
          this.to = setTimeout(function () {
            _this3.current = (_this3.current + 1) % _this3.items.length;

            _this3.pushChanges();
          }, autoplay);
        }
      }
    } // console.log('SliderComponent.setActiveState', current, currentSlide);

  };

  _proto.slider$ = function slider$() {
    var _this4 = this;

    var translation, dragDownEvent, dragMoveEvent;
    return DragService.events$(this.wrapper).pipe(operators.tap(function (event) {
      if (event instanceof DragDownEvent) {
        translation = _this4.getTranslation(_this4.wrapper, _this4.container);
        dragDownEvent = event;
      } else if (event instanceof DragMoveEvent) {
        dragMoveEvent = _this4.onDragMoveEvent(dragDownEvent, event, translation); // console.log('DragMoveEvent');
      } else if (event instanceof DragUpEvent) {
        if (dragMoveEvent) {
          _this4.container.classList.remove('dragging');

          _this4.wrapper.style.transform = null;

          _this4.onDragUpEvent(dragDownEvent, dragMoveEvent);
        } // console.log('DragUpEvent');

      }
    }));
  }
  /*
  autoplay$() {
  	if (this.autoplay) {
  		const autoplay = typeof this.autoplay === 'number' ? this.autoplay : 4000;
  		return interval(autoplay).pipe(
  			takeUntil(this.userGesture$),
  			tap(() => {
  				this.current = (this.current + 1) % this.items.length;
  			}),
  		);
  	} else {
  		return of(null);
  	}
  }
  */
  ;

  _proto.onDragMoveEvent = function onDragMoveEvent(dragDownEvent, dragMoveEvent, translation) {
    this.container.classList.add('dragging');
    var transformX = translation.x + dragMoveEvent.distance.x;
    this.wrapper.style.transform = "translate3d(" + transformX + "px, " + 0 + "px, " + 0 + "px)";
    return dragMoveEvent;
  };

  _proto.onDragUpEvent = function onDragUpEvent(dragDownEvent, dragMoveEvent) {
    var width = this.container.offsetWidth;

    if (dragMoveEvent.distance.x * -1 > width * 0.25 && this.hasNext()) {
      this.navTo(this.current + 1);
    } else if (dragMoveEvent.distance.x * -1 < width * -0.25 && this.hasPrev()) {
      this.navTo(this.current - 1);
    } else {
      this.wrapper.style.transform = "translate3d(" + -100 * this.current + "%, 0, 0)"; // this.navTo(this.current);
    } // this.navTo(current);

  };

  _proto.navTo = function navTo(current) {
    current = (current > 0 ? current : this.items.length + current) % this.items.length;
    this.current = current;
    this.userGesture = true; // this.userGesture$.next();

    this.pushChanges();
  };

  _proto.hasPrev = function hasPrev() {
    return this.current - 1 >= 0;
  };

  _proto.hasNext = function hasNext() {
    return this.current + 1 < this.items.length;
  };

  _proto.getTranslation = function getTranslation(node, container) {
    var x = 0,
        y = 0,
        z = 0;
    var transform = node.style.transform;

    if (transform) {
      var coords = transform.split('(')[1].split(')')[0].split(',');
      x = parseFloat(coords[0]);
      y = parseFloat(coords[1]);
      z = parseFloat(coords[2]);
      x = coords[0].indexOf('%') !== -1 ? x *= container.offsetWidth * 0.01 : x;
      y = coords[1].indexOf('%') !== -1 ? y *= container.offsetHeight * 0.01 : y;
    }

    return {
      x: x,
      y: y,
      z: z
    };
  };

  _createClass(SliderComponent, [{
    key: "items",
    get: function get() {
      return this.items_ || [];
    },
    set: function set(items) {
      if (this.items_ !== items) {
        this.items_ = items;
      }
    }
  }, {
    key: "current",
    get: function get() {
      return this.state.current || 0;
    },
    set: function set(current) {
      if (current === void 0) {
        current = 0;
      }

      if (this.state.current !== current) {
        this.state.current = current; // console.log('current');

        this.change.next(current);
      } // this.state.current = Math.min(current, items ? items.length - 1 : 0);

    }
  }, {
    key: "state",
    get: function get() {
      if (!this.state_) {
        this.state_ = {
          current: 0
        };
      }

      return this.state_;
    }
  }, {
    key: "wrapperStyle",
    get: function get() {
      return {
        'transform': 'translate3d(' + -100 * this.state.current + '%, 0, 0)'
      };
    }
  }, {
    key: "innerStyle",
    get: function get() {
      return {
        'width': 100 * this.items.length + '%'
      };
    }
  }]);

  return SliderComponent;
}(rxcomp.Component);
SliderComponent.meta = {
  selector: '[slider]',
  inputs: ['items', 'current', 'autoplay'],
  outputs: ['change', 'tween']
};var SliderCaseStudyComponent = /*#__PURE__*/function (_SliderComponent) {
  _inheritsLoose(SliderCaseStudyComponent, _SliderComponent);

  function SliderCaseStudyComponent() {
    return _SliderComponent.apply(this, arguments) || this;
  }

  var _proto = SliderCaseStudyComponent.prototype;

  _proto.onInit = function onInit() {
    var _this = this;

    _SliderComponent.prototype.onInit.call(this);

    this.resize$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function () {
      return _this.pushChanges();
    });
    /*
    this.changed$().pipe(
    	takeUntil(this.unsubscribe$)
    ).subscribe();
    setTimeout(() => {
    	this.setActiveState();
    }, 500);
    */
  };

  _proto.resize$ = function resize$() {
    return rxjs.fromEvent(window, 'resize');
  }
  /*
  changed$() {
  	return this.change.pipe(
  		tap(() => this.setActiveState()),
  	);
  }
  
  setActiveState() {
  	const current = this.current;
  	const { node } = getContext(this);
  	const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
  	slides.forEach((slide, i) => i === current ? slide.classList.add('active') : slide.classList.remove('active'));
  }
  */
  ;

  _proto.onContentOver = function onContentOver() {
    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    node.classList.add('content-over');
  };

  _proto.onContentOut = function onContentOut() {
    var _getContext2 = rxcomp.getContext(this),
        node = _getContext2.node;

    node.classList.remove('content-over');
  };

  _proto.navTo = function navTo(current) {
    _SliderComponent.prototype.navTo.call(this, current);
  };

  _createClass(SliderCaseStudyComponent, [{
    key: "items",
    get: function get() {
      return this.items_ || [];
    },
    set: function set(items) {
      if (this.items_ !== items) {
        this.items_ = items;
      }
    }
  }, {
    key: "current",
    get: function get() {
      return this.state.current || 0;
    },
    set: function set(current) {
      if (current === void 0) {
        current = 0;
      }

      if (this.state.current !== current) {
        this.state.current = current;
        this.change.next(current);
      }
    }
  }, {
    key: "state",
    get: function get() {
      if (!this.state_) {
        this.state_ = {
          current: 0
        };
      }

      return this.state_;
    }
  }, {
    key: "wrapperStyle",
    get: function get() {
      return {
        'transform': 'translate3d(' + -this.slideWidth * this.state.current + 'px, 0, 0)'
      };
    }
  }, {
    key: "innerStyle",
    get: function get() {
      return {
        'width': this.slideWidth * this.items.length + 'px'
      };
    }
  }, {
    key: "slideWidth",
    get: function get() {
      var _getContext3 = rxcomp.getContext(this),
          node = _getContext3.node; // const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));


      var slideWidth = (window.innerWidth < 768 ? node.offsetWidth : node.offsetWidth / 12 * 10) + 40;
      return slideWidth;
    }
  }]);

  return SliderCaseStudyComponent;
}(SliderComponent);
SliderCaseStudyComponent.meta = {
  selector: '[slider-case-study]',
  inputs: ['items', 'current', 'autoplay'],
  outputs: ['change', 'tween']
};var SliderGalleryComponent = /*#__PURE__*/function (_SliderComponent) {
  _inheritsLoose(SliderGalleryComponent, _SliderComponent);

  function SliderGalleryComponent() {
    return _SliderComponent.apply(this, arguments) || this;
  }

  var _proto = SliderGalleryComponent.prototype;

  _proto.onInit = function onInit() {
    _SliderComponent.prototype.onInit.call(this);
    /*
    this.changed$().pipe(
    	takeUntil(this.unsubscribe$)
    ).subscribe();
    setTimeout(() => {
    	this.setActiveState();
    }, 500);
    */

  }
  /*
  changed$() {
  	return this.change.pipe(
  		tap(() => this.setActiveState()),
  	);
  }
  
  setActiveState() {
  	const current = this.current;
  	const { node } = getContext(this);
  	const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
  	slides.forEach((slide, i) => i === current ? slide.classList.add('active') : slide.classList.remove('active'));
  }
  */
  ;

  _proto.navTo = function navTo(current) {
    _SliderComponent.prototype.navTo.call(this, current);
  };

  _proto.doClose = function doClose() {
    this.close.next();
  };

  _proto.toggleMode = function toggleMode() {
    this.mode.next();
  };

  _createClass(SliderGalleryComponent, [{
    key: "items",
    get: function get() {
      return this.items_ || [];
    },
    set: function set(items) {
      if (this.items_ !== items) {
        this.items_ = items;
      }
    }
  }, {
    key: "current",
    get: function get() {
      return this.state.current || 0;
    },
    set: function set(current) {
      if (current === void 0) {
        current = 0;
      }

      if (this.state.current !== current) {
        this.state.current = current;
        this.change.next(current);
      }
    }
  }, {
    key: "state",
    get: function get() {
      if (!this.state_) {
        this.state_ = {
          current: 0
        };
      }

      return this.state_;
    }
  }, {
    key: "wrapperStyle",
    get: function get() {
      return {
        'transform': 'translate3d(' + -100 * this.state.current + '%, 0, 0)'
      };
    }
  }, {
    key: "innerStyle",
    get: function get() {
      return {
        'width': 100 * this.items.length + '%'
      };
    }
  }]);

  return SliderGalleryComponent;
}(SliderComponent);
SliderGalleryComponent.meta = {
  selector: '[slider-gallery]',
  inputs: ['items', 'current', 'autoplay'],
  outputs: ['change', 'tween', 'close', 'mode']
};var SliderHeroComponent = /*#__PURE__*/function (_SliderComponent) {
  _inheritsLoose(SliderHeroComponent, _SliderComponent);

  function SliderHeroComponent() {
    return _SliderComponent.apply(this, arguments) || this;
  }

  var _proto = SliderHeroComponent.prototype;

  _proto.onInit = function onInit() {
    _SliderComponent.prototype.onInit.call(this);

    this.pagination$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe();
    this.click$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe();
    /*
    this.changed$().pipe(
    	takeUntil(this.unsubscribe$)
    ).subscribe();
    setTimeout(() => {
    	this.setActiveState();
    }, 500);
    */
  };

  _proto.raf$ = function raf$() {
    return rxjs.interval(0, rxjs.animationFrameScheduler);
  };

  _proto.mouse$ = function mouse$() {
    var event = {
      x: 0,
      y: 0
    };
    return rxjs.fromEvent(window, 'mousemove').pipe(operators.map(function (mouseEvent) {
      event.x = mouseEvent.clientX;
      event.y = mouseEvent.clientY;
      return event;
    }));
  };

  _proto.pagination$ = function pagination$() {
    var _this = this;

    var _getContext = rxcomp.getContext(this),
        node = _getContext.node;

    var position = {
      x: 0,
      y: 0
    };
    var pagination = node.querySelector('.slider__pagination');
    return rxjs.combineLatest([this.mouse$(), this.raf$()]).pipe(operators.tap(function (datas) {
      var mouse = datas[0];
      position.x += (mouse.x - position.x) / 20;
      position.y += (mouse.y - position.y) / 20; // const rect = node.getBoundingClientRect();

      _this.direction = mouse.x > window.innerWidth / 2 ? 1 : -1;
      pagination.style.transform = "translateX(" + position.x + "px) translateY(" + position.y + "px)";
    }));
  };

  _proto.click$ = function click$() {
    var _this2 = this;

    var _getContext2 = rxcomp.getContext(this),
        node = _getContext2.node;

    return rxjs.fromEvent(node, 'click').pipe(operators.map(function (event) {
      if (event.clientX > window.innerWidth / 2) {
        // if (this.hasNext()) {
        _this2.navTo(_this2.state.current + 1); // }

      } else {
        // if (this.hasPrev()) {
        _this2.navTo(_this2.state.current - 1); // }

      }
    }));
  }
  /*
  changed$() {
  	return this.change.pipe(
  		tap(() => this.setActiveState()),
  	);
  }
  
  setActiveState() {
  	const current = this.current;
  	const { node } = getContext(this);
  	const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
  	slides.forEach((slide, i) => i === current ? slide.classList.add('active') : slide.classList.remove('active'));
  }
  */
  ;

  _proto.onContentOver = function onContentOver() {
    var _getContext3 = rxcomp.getContext(this),
        node = _getContext3.node;

    node.classList.add('content-over');
  };

  _proto.onContentOut = function onContentOut() {
    var _getContext4 = rxcomp.getContext(this),
        node = _getContext4.node;

    node.classList.remove('content-over');
  };

  _createClass(SliderHeroComponent, [{
    key: "items",
    get: function get() {
      return this.items_ || [];
    },
    set: function set(items) {
      if (this.items_ !== items) {
        this.items_ = items;
      }
    }
  }, {
    key: "current",
    get: function get() {
      return this.state.current || 0;
    },
    set: function set(current) {
      if (current === void 0) {
        current = 0;
      }

      if (this.state.current !== current) {
        this.state.current = current;
        this.change.next(current);
      }
    }
  }, {
    key: "state",
    get: function get() {
      if (!this.state_) {
        this.state_ = {
          current: 0
        };
      }

      return this.state_;
    }
  }, {
    key: "wrapperStyle",
    get: function get() {
      return {
        'transform': 'translate3d(' + -100 * this.state.current + '%, 0, 0)'
      };
    }
  }, {
    key: "innerStyle",
    get: function get() {
      return {
        'width': 100 * this.items.length + '%'
      };
    }
  }, {
    key: "direction",
    set: function set(direction) {
      if (this.direction_ !== direction) {
        this.direction_ = direction;

        var _getContext5 = rxcomp.getContext(this),
            node = _getContext5.node;

        var pagination = node.querySelector('.slider__pagination');

        if (direction == 1) {
          pagination.classList.remove('prev');
          pagination.classList.add('next');
        } else {
          pagination.classList.remove('next');
          pagination.classList.add('prev');
        }
      }
    }
  }]);

  return SliderHeroComponent;
}(SliderComponent);
SliderHeroComponent.meta = {
  selector: '[slider-hero]',
  inputs: ['items', 'current', 'autoplay'],
  outputs: ['change', 'tween']
};var SlugPipe = /*#__PURE__*/function (_Pipe) {
  _inheritsLoose(SlugPipe, _Pipe);

  function SlugPipe() {
    return _Pipe.apply(this, arguments) || this;
  }

  SlugPipe.transform = function transform(value) {
    return getSlug(value);
  };

  return SlugPipe;
}(rxcomp.Pipe);
SlugPipe.meta = {
  name: 'slug'
};var VirtualItem = /*#__PURE__*/function (_Context) {
  _inheritsLoose(VirtualItem, _Context);

  function VirtualItem(key, $key, value, $value, index, count, parentInstance) {
    var _this;

    _this = _Context.call(this, parentInstance) || this;
    _this[key] = $key;
    _this[value] = $value;
    _this.index = index;
    _this.count = count;
    return _this;
  }

  _createClass(VirtualItem, [{
    key: "first",
    get: function get() {
      return this.index === 0;
    }
  }, {
    key: "last",
    get: function get() {
      return this.index === this.count - 1;
    }
  }, {
    key: "even",
    get: function get() {
      return this.index % 2 === 0;
    }
  }, {
    key: "odd",
    get: function get() {
      return !this.even;
    }
  }]);

  return VirtualItem;
}(rxcomp.Context);var VirtualMode = {
  Responsive: 1,
  Grid: 2,
  Centered: 3,
  List: 4
};

var VirtualStructure = /*#__PURE__*/function (_Structure) {
  _inheritsLoose(VirtualStructure, _Structure);

  function VirtualStructure() {
    return _Structure.apply(this, arguments) || this;
  }

  var _proto = VirtualStructure.prototype;

  _proto.onInit = function onInit() {
    var _getContext = rxcomp.getContext(this),
        module = _getContext.module,
        node = _getContext.node;

    var template = node.firstElementChild;
    var expression = node.getAttribute('*virtual');
    node.removeAttribute('*virtual');
    node.removeChild(template);
    var tokens = this.tokens = this.getExpressionTokens(expression);
    this.virtualFunction = module.makeFunction(tokens.iterable);
    this.container = node;
    this.template = template;
    this.mode = this.mode || 1;
    this.width = this.width || 250;
    this.gutter = this.gutter !== undefined ? this.gutter : 20;
    this.options = {
      top: 0,
      width: this.width,
      gutter: this.gutter,
      containerWidth: 0,
      containerHeight: 0,
      cols: [0],
      strategy: 1
    };
    this.cachedRects = {};
    this.cachedInstances = [];
    this.cacheNodes = [];
    this.items$ = new rxjs.BehaviorSubject([]);
    this.update$().pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (visibleItems) {// console.log(visibleItems.length);
    });
  };

  _proto.onChanges = function onChanges(changes) {
    var context = rxcomp.getContext(this);
    var module = context.module; // resolve

    var items = module.resolve(this.virtualFunction, context.parentInstance, this) || [];
    this.mode = this.mode || 1;
    this.width = this.width || 250;
    this.gutter = this.gutter !== undefined ? this.gutter : 20;
    this.options.width = this.width;
    this.updateView(true);
    this.items$.next(items);
  };

  _proto.update$ = function update$() {
    var _this = this;

    return rxjs.merge(this.scroll$(), this.resize$(), this.items$).pipe(operators.map(function (datas) {
      var options = _this.options;

      var items = _this.items$.getValue();

      var total = items.length;
      _this.container.position = 'relative';
      var highestHeight = 0;

      var width = _this.getWidth();

      var gutter = _this.getGutter(width);

      var visibleItems = items.filter(function (item, i) {
        var col, height, top, left, bottom;
        var rect = _this.cachedRects[i];

        if (rect) {
          col = rect.col;
          height = rect.height;
          left = rect.left; // top = rect.top;
          // bottom = rect.bottom;
        } else {
          col = _this.getCol();
          height = _this.getHeight(width, item);
        }

        top = options.cols[col];

        if (_this.intersect(top + options.top, top + height + options.top, 0, options.containerHeight)) {
          if (!rect) {
            left = _this.getLeft(col, width, gutter);
          }

          var node = _this.cachedNode(i, i, item, total);

          node.style.position = 'absolute';
          node.style.top = top + 'px';
          node.style.left = left + 'px';
          node.style.width = width + 'px';

          if (height !== node.offsetHeight) {
            height = node.offsetHeight;
          }

          bottom = top + height + options.gutter;
          highestHeight = Math.max(highestHeight, bottom);
          options.cols[col] = bottom;

          if (!rect) {
            _this.cachedRects[i] = {
              col: col,
              width: width,
              height: height,
              left: left,
              top: top,
              bottom: bottom
            };
          } else {
            rect.height = height;
            rect.bottom = bottom;
          }

          return true;
        } else {
          _this.removeNode(i);

          bottom = top + height + options.gutter;
          options.cols[col] = bottom;
          highestHeight = Math.max(highestHeight, bottom);
          return false;
        }
      });
      var removeIndex = items.length;

      while (removeIndex < _this.cacheNodes.length) {
        _this.removeNode(removeIndex);

        removeIndex++;
      }

      _this.cacheNodes.length = items.length;
      _this.container.style.height = highestHeight + "px";
      return visibleItems;
    }));
  };

  _proto.getCols = function getCols() {
    var options = this.options;
    var cols = Math.floor((options.containerWidth + options.gutter) / (options.width + options.gutter)) || 1;
    return new Array(cols).fill(0);
  };

  _proto.getCol = function getCol() {
    var options = this.options;
    var col;

    switch (this.mode) {
      case VirtualMode.Grid:
      case VirtualMode.Centered:
      case VirtualMode.Responsive:
        col = options.cols.reduce(function (p, c, i, a) {
          return c < a[p] ? i : p;
        }, 0);
        break;

      case VirtualMode.List:
      default:
        col = 0;
    }

    return col;
  };

  _proto.getWidth = function getWidth() {
    var options = this.options;
    var width;

    switch (this.mode) {
      case VirtualMode.Grid:
      case VirtualMode.Centered:
        width = options.width;
        break;

      case VirtualMode.Responsive:
        width = (options.containerWidth - (options.cols.length - 1) * options.gutter) / options.cols.length;
        break;

      case VirtualMode.List:
      default:
        width = options.containerWidth;
    }

    return width;
  };

  _proto.getHeight = function getHeight(width, item) {
    var options = this.options;
    var height;

    switch (this.mode) {
      case VirtualMode.Grid:
      case VirtualMode.Centered:
      case VirtualMode.Responsive:
        height = options.width;
        break;

      case VirtualMode.List:
      default:
        height = 80;
    }

    return height;
  };

  _proto.getGutter = function getGutter(width) {
    var options = this.options;
    var gutter;

    switch (this.mode) {
      case VirtualMode.Grid:
      case VirtualMode.Centered:
        gutter = options.gutter;
        break;

      case VirtualMode.Responsive:
        gutter = (options.containerWidth - options.cols.length * width) / (options.cols.length - 1);
        break;

      case VirtualMode.List:
      default:
        gutter = 0;
    }

    return gutter;
  };

  _proto.getLeft = function getLeft(index, width, gutter) {
    var options = this.options;
    var left;

    switch (this.mode) {
      case VirtualMode.Grid:
      case VirtualMode.Responsive:
        left = index * (width + gutter);
        break;

      case VirtualMode.Centered:
        left = (options.containerWidth - options.cols.length * (width + gutter) + gutter) / 2 + index * (width + gutter);
        break;

      case VirtualMode.List:
      default:
        left = 0;
    }

    return left;
  };

  _proto.cachedNode = function cachedNode(index, i, value, total) {
    if (this.cacheNodes[index]) {
      return this.updateNode(index, i, value);
    } else {
      return this.createNode(index, i, value, total);
    }
  };

  _proto.createNode = function createNode(index, i, value, total) {
    var clonedNode = this.template.cloneNode(true);
    delete clonedNode.rxcompId;
    this.container.appendChild(clonedNode);
    this.cacheNodes[index] = clonedNode;
    var context = rxcomp.getContext(this);
    var module = context.module;
    var tokens = this.tokens;
    var args = [tokens.key, i, tokens.value, value, i, total, context.parentInstance];
    var instance = module.makeInstance(clonedNode, VirtualItem, context.selector, context.parentInstance, args);
    var forItemContext = rxcomp.getContext(instance);
    module.compile(clonedNode, forItemContext.instance);
    this.cachedInstances[index] = instance;
    return clonedNode;
  };

  _proto.updateNode = function updateNode(index, i, value) {
    var instance = this.cachedInstances[index];
    var tokens = this.tokens;

    if (instance[tokens.key] !== i) {
      instance[tokens.key] = i;
      instance[tokens.value] = value;
      instance.pushChanges();
    } // console.log(index, i, value);


    return this.cacheNodes[index];
  };

  _proto.removeNode = function removeNode(index) {
    this.cachedInstances[index] = undefined;
    var node = this.cacheNodes[index];

    if (node) {
      var context = rxcomp.getContext(this);
      var module = context.module;
      node.parentNode.removeChild(node);
      module.remove(node);
    }

    this.cacheNodes[index] = undefined;
    return node;
  };

  _proto.intersect = function intersect(top1, bottom1, top2, bottom2) {
    return top2 < bottom1 && bottom2 > top1;
  };

  _proto.resize$ = function resize$() {
    var _this2 = this;

    return rxjs.fromEvent(window, 'resize').pipe(operators.auditTime(100), operators.startWith(null), operators.tap(function () {
      return _this2.updateView(true);
    }));
  };

  _proto.scroll$ = function scroll$(node) {
    var _this3 = this;

    return rxjs.fromEvent(window, 'scroll').pipe(operators.tap(function () {
      return _this3.updateView();
    }));
  };

  _proto.updateView = function updateView(reset) {
    var rect = this.container.getBoundingClientRect();
    var options = this.options;
    options.top = rect.top;
    options.containerWidth = rect.width;
    options.containerHeight = window.innerHeight;
    options.cols = this.getCols();

    if (reset) {
      this.cachedRects = {};
    }
  };

  _proto.getExpressionTokens = function getExpressionTokens(expression) {
    if (expression === null) {
      throw new Error('invalid virtual');
    }

    if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
      throw new Error('invalid virtual');
    }

    var expressions = expression.split(';').map(function (x) {
      return x.trim();
    }).filter(function (x) {
      return x !== '';
    });
    var virtualExpressions = expressions[0].split(' of ').map(function (x) {
      return x.trim();
    });
    var value = virtualExpressions[0].replace(/\s*let\s*/, '');
    var iterable = virtualExpressions[1];
    var key = 'index';
    var keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);

    if (keyValueMatches) {
      key = keyValueMatches[1];
      value = keyValueMatches[2];
    }

    if (expressions.length > 1) {
      var indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(function (x) {
        return x.trim();
      });

      if (indexExpressions.length === 3) {
        key = indexExpressions[1];
      }
    }

    return {
      key: key,
      value: value,
      iterable: iterable
    };
  };

  return VirtualStructure;
}(rxcomp.Structure);
VirtualStructure.meta = {
  selector: '[*virtual]',
  inputs: ['mode', 'width', 'gutter']
};var AppModule = /*#__PURE__*/function (_Module) {
  _inheritsLoose(AppModule, _Module);

  function AppModule() {
    return _Module.apply(this, arguments) || this;
  }

  return AppModule;
}(rxcomp.Module);
AppModule.meta = {
  imports: [rxcomp.CoreModule, rxcompForm.FormModule],
  declarations: [AppearDirective, AppearStaggerDirective, AuthComponent, AuthForgotComponent, AuthModalComponent, AuthSigninComponent, AuthSignupComponent, ClickOutsideDirective, ContactsComponent, ContactsSimpleComponent, ControlCheckboxComponent, ControlCustomSelectComponent, ControlPasswordComponent, ControlTextComponent, ControlTextareaComponent, DropdownDirective, DropdownItemDirective, ErrorsComponent, FilterDropdownComponent, GalleryComponent, GalleryModalComponent, HeaderComponent, HtmlPipe, MagazineComponent, ModalComponent, ModalOutletComponent, PortfolioComponent, ScrollToDirective, SecureDirective, ShareComponent, SliderComponent, SliderCaseStudyComponent, SliderGalleryComponent, SliderHeroComponent, SlugPipe, VirtualStructure],
  bootstrap: AppComponent
};rxcomp.Browser.bootstrap(AppModule);})));