!function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = !0;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            configurable: !1,
            enumerable: !0,
            get: getter
        });
    };
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
    };
    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    __webpack_require__(__webpack_require__.s = "./public/js/button/index.js");
}({
    "./bower_modules/squid-core/dist/api.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$Api = void 0;
        var obj, _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        }, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, _beaverLogger = __webpack_require__("./node_modules/beaver-logger/index.js"), _beaverLogger2 = (obj = _beaverLogger) && obj.__esModule ? obj : {
            default: obj
        }, _event = __webpack_require__("./bower_modules/squid-core/dist/event.js"), _class = __webpack_require__("./bower_modules/squid-core/dist/class.js"), _util = __webpack_require__("./bower_modules/squid-core/dist/util.js"), _promise = __webpack_require__("./bower_modules/squid-core/dist/promise.js"), _config = __webpack_require__("./bower_modules/squid-core/dist/config.js"), _error = __webpack_require__("./bower_modules/squid-core/dist/error.js"), _loader = __webpack_require__("./bower_modules/squid-core/dist/loader.js");
        var standardHeaders = {};
        _config.$meta.headers = _config.$meta.headers || {};
        _config.$meta.headers["x-cookies"] = "object" !== _typeof(_config.$meta.headers["x-cookies"]) ? JSON.parse(_config.$meta.headers["x-cookies"] || "{}") : _config.$meta.headers["x-cookies"];
        function cookiesEnabled() {
            return _util.$util.cookiesEnabled() && window.location.hostname.indexOf(".paypal.com") > -1;
        }
        var cache = {}, windowLoad = _util.$util.memoize(function() {
            return _promise.$promise.resolver(function(resolve) {
                "complete" === document.readyState ? resolve() : window.addEventListener("load", resolve);
            });
        }), batchQueue = {};
        window.pre = window.pre || {};
        var transientCache = {};
        Object.keys(window.pre).forEach(function(key) {
            var _window$pre$key = window.pre[key], method = _window$pre$key.method, uri = _window$pre$key.uri, res = _window$pre$key.res;
            transientCache[method + ":" + uri] = res;
        });
        var transientCacheResolvers = {}, metaBuilder = void 0;
        window.preload = function(method, url, data, name) {
            name && (window.pre[name] = {
                method: method,
                uri: url,
                res: data
            });
            var key = method + ":" + url, resolvers = transientCacheResolvers[key] || [];
            transientCache[key] = data;
            for (;resolvers.length; ) resolvers.pop().call();
        };
        var preloadComplete = !1;
        window.preloadComplete = function() {
            preloadComplete = !0;
            Object.keys(transientCacheResolvers).forEach(function(key) {
                for (var resolvers = transientCacheResolvers[key] || []; resolvers.length; ) resolvers.pop().call();
            });
        };
        _beaverLogger2.default.info(cookiesEnabled() ? "cookies_enabled" : "cookies_disabled");
        var $Api = exports.$Api = _class.$Class.extend("$Api", {
            cache: !1,
            timeout: 45e3,
            getAttempts: 3,
            postAttempts: 1,
            action: function(_action, options) {
                options.action = _action;
                return this.post(options);
            },
            retrieve: function() {
                var options = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                options.method = "get";
                return this.call(options);
            },
            post: function(options) {
                options.method = "post";
                return this.call(options);
            },
            call: function(options) {
                var self = this;
                options.api = this;
                options.uri = this.getURI(options.model, options.action);
                options.params = options.params || {};
                options.cache = options.cache || self.cache && "get" === options.method;
                options.name = this.buildAPIName(options);
                options.meta = this.buildMeta();
                options.transientError = options.transientError || !1;
                options.cacheKey = _util.$util.buildURL(options.uri, options.params);
                _beaverLogger2.default.info(options.name + "_call", {
                    name: options.name,
                    method: options.method,
                    uri: options.uri
                });
                options.silent || _event.$event.emit("loading");
                return _promise.$promise.first([ function() {
                    if (options.cache && cache[options.cacheKey]) return cache[options.cacheKey];
                }, function() {
                    return _promise.$promise.providing(self.hasTransientCacheData(options), function() {
                        return self.attemptRequest(options);
                    });
                }, function() {
                    if (options.batch) return self.batchRequest(options);
                }, function() {
                    return self.attemptRequest(options);
                } ]).finally(function() {
                    options.silent || _event.$event.emit("loaded");
                }).then(function(res) {
                    options.cache && (cache[options.cacheKey] = res);
                    return self.handleResponse(res.data, options);
                }, function(err) {
                    return err instanceof _error.$BatchShortCircuit ? _promise.$promise.reject(err) : self.handleErrorResponse(err, options);
                });
            },
            batchRequest: function(options) {
                _util.$util.assert(options.batch.name, 'Must define a "name" for batch request: ' + options.batch);
                _util.$util.assert(options.batch.id, 'Must define a "id" for batch request: ' + options.batch);
                var name = options.batch.name, id = options.batch.id;
                (batchQueue[name] = batchQueue[name] || {})[id] = options;
                return this.buildBatchRequest(name).then(function(results) {
                    return results[id].then(function(result) {
                        return result || _promise.$promise.reject(new _error.$BatchShortCircuit());
                    });
                });
            },
            buildBatchRequest: _promise.$promise.debounce(function(name) {
                var self = this, batch = batchQueue[name], batchIds = _class.$Class.keys(batch), batchData = {}, headers = {};
                delete batchQueue[name];
                if (1 === batchIds.length) {
                    var batchId = batchIds[0], opts = batch[batchId], results = {};
                    results[batchId] = opts.api.attemptRequest(opts);
                    return results;
                }
                _util.$util.forEach(batch, function(options, id) {
                    batchData[id] = {
                        method: options.method,
                        uri: options.api.getURI(options.model, options.action, !0),
                        data: options.data,
                        params: options.params,
                        dependencies: options.batch.dependencies
                    };
                    _util.$util.extend(headers, options.headers);
                });
                return $batchApi.action(name, {
                    data: batchData,
                    headers: headers
                }).then(function(res) {
                    return self.handleBatchResponse(batch, res.data);
                });
            }),
            handleBatchResponse: function(batch, data) {
                var self = this, promises = {};
                _util.$util.forEach(batch, function(options, id) {
                    promises[id] = _promise.$promise.run(function() {
                        var depsPresent = _promise.$promise.every(options.batch.dependencies || [], function(depName) {
                            batch[depName] || _beaverLogger2.default.info("missing_batch_dependency", {
                                dependency: depName,
                                available: Object.keys(batch).join("|")
                            });
                            return !batch[depName] || promises[depName].then(function(dependency) {
                                return dependency && dependency.data && "success" === dependency.data.ack;
                            });
                        });
                        return _promise.$promise.providing(depsPresent, function() {
                            return _promise.$promise.providing(data[id], function(result) {
                                self.addTransientCacheData(options.method, options.api.getURI(options.model, options.action), result);
                            }).then(function() {
                                return options.api.attemptRequest(options);
                            });
                        });
                    });
                });
                return promises;
            },
            attemptRequest: function(options) {
                var self = this, attempts = "get" === options.method ? this.getAttempts : this.postAttempts;
                return _promise.$promise.attempt(attempts, function(remaining) {
                    return self.getTransientCacheResponse(options).then(function(res) {
                        return res || self.getHttpResponse(options);
                    }).catch(function(res) {
                        if (!(res && res.status || 1 !== attempts)) {
                            _beaverLogger2.default.warn("api_retry_aborted", {
                                method: options.method,
                                uri: options.uri
                            });
                            return self.getHttpResponse(options);
                        }
                        return _promise.$promise.reject(res);
                    }).catch(function(res) {
                        if (401 === res.status) {
                            _beaverLogger2.default.warn("api_retry_401", {
                                method: options.method,
                                uri: options.uri
                            });
                            return self.getHttpResponse(options);
                        }
                        return _promise.$promise.reject(res);
                    }).catch(function(res) {
                        if (401 === res.status) return {
                            data: {
                                ack: "permission_denied"
                            }
                        };
                        if (remaining) {
                            _beaverLogger2.default.warn("api_retry", {
                                method: options.method,
                                uri: options.uri
                            });
                            return _promise.$promise.reject(res);
                        }
                        return res && res.data && "error" === res.data.ack ? _promise.$promise.reject(new _error.$ApiError("api_error", {
                            name: options.name,
                            method: options.method,
                            uri: options.uri,
                            stack: res.data.stack,
                            transient: options.transientError
                        })) : res && res.status ? _promise.$promise.reject(new _error.$ApiError("response_status_" + res.status, {
                            uri: options.uri,
                            transient: options.transientError
                        })) : res && res.error ? _promise.$promise.reject(new _error.$ApiError("request_" + res.error, {
                            uri: options.uri,
                            transient: options.transientError
                        })) : _promise.$promise.reject(new _error.$ApiError("request_aborted", {
                            uri: options.uri,
                            transient: options.transientError
                        }));
                    });
                });
            },
            getHttpResponse: function(options) {
                var self = this, startTime = _util.$util.now();
                return this.http(options).finally(function() {
                    options.duration = _util.$util.now() - startTime;
                }).catch(function(res) {
                    return res && res.status && "400" === res.status.toString() && res.data && res.data.ack ? res : _promise.$promise.reject(res);
                }).then(function(res) {
                    self.saveResponseState(res);
                    var loggerPayload = {
                        name: options.name,
                        method: options.method,
                        uri: options.uri,
                        server: res.data.server,
                        time: options.duration,
                        duration: options.duration
                    };
                    window.performance && window.performance.getEntries && _util.$util.forEach(window.performance.getEntries(), function(resource) {
                        resource.name && resource.name.indexOf(options.uri) > -1 && _util.$util.extend(loggerPayload, resource);
                    });
                    _beaverLogger2.default.info("api_response", loggerPayload);
                    res && res.status && _beaverLogger2.default.info("http_response_" + res.status);
                    return res;
                }, function(res) {
                    self.saveResponseState(res);
                    res && res.status && _beaverLogger2.default.info("http_response_" + res.status);
                    return _promise.$promise.reject(res);
                });
            },
            setTransientCache: function(data) {
                throw new Error("NotImplemented");
            },
            getTransientCacheData: function(options, pop) {
                if (!_config.$config.enablePreload) return _promise.$promise.resolve();
                var key = options.method.toLowerCase() + ":" + _util.$util.buildURL(options.uri, options.params);
                return _promise.$promise.resolver(function(resolve) {
                    function res() {
                        var data = transientCache[key];
                        pop && delete transientCache[key];
                        resolve(data);
                    }
                    transientCacheResolvers[key] = transientCacheResolvers[key] || [];
                    transientCacheResolvers[key].push(res);
                    if (transientCache[key] || "complete" === document.readyState || preloadComplete) return res();
                    windowLoad().then(res);
                });
            },
            hasTransientCacheData: function(options) {
                return this.getTransientCacheData(options, !1).then(function(data) {
                    return Boolean(data);
                });
            },
            addTransientCacheData: function(method, uri, data) {
                window.preload(method, uri, data);
            },
            getTransientCacheResponse: function(options) {
                return this.getTransientCacheData(options, !0).then(function(data) {
                    if (data) return "error" === data.ack ? _promise.$promise.reject({
                        status: 500,
                        data: data
                    }) : "permission_denied" === data.ack ? _promise.$promise.reject({
                        status: 401,
                        data: data
                    }) : "contingency" === data.ack || "validation_error" === data.ack ? {
                        status: 400,
                        data: data
                    } : {
                        status: 200,
                        data: data
                    };
                    "get" !== options.method || _loader.$loader.firstLoad() || options.silent || _beaverLogger2.default.info("preload_cache_miss", {
                        uri: options.uri
                    });
                });
            },
            getHeaders: function(options) {
                _config.$meta.headers["x-csrf-jwt"] || _config.$meta.csrfJwt || _beaverLogger2.default.warn("missing_csrf_jwt");
                var headers = {
                    "X-Requested-With": "XMLHttpRequest",
                    "x-csrf-jwt": _config.$meta.headers["x-csrf-jwt"] || _config.$meta.csrfJwt
                };
                cookiesEnabled() || (headers["x-cookies"] = JSON.stringify(_config.$meta.headers["x-cookies"]));
                _util.$util.extend(headers, standardHeaders);
                options.headers && _util.$util.extend(headers, options.headers);
                return headers;
            },
            http: function(options) {
                return this.httpNative(options);
            },
            httpJQuery: function(options) {
                var settings = {
                    method: options.method,
                    data: "get" === options.method ? options.params : JSON.stringify({
                        data: options.data,
                        meta: options.meta || {}
                    }),
                    headers: this.getHeaders(options),
                    timeout: this.timeout
                };
                "post" === options.method ? settings.headers["Content-Type"] = "application/json;charset=UTF-8" : "get" === options.method && (settings.data.meta = JSON.stringify(options.meta));
                return _promise.$promise.resolver(function(resolve, reject) {
                    function getRes(res, data) {
                        return {
                            status: res.status,
                            data: data,
                            headers: function(name) {
                                return res.getResponseHeader(name);
                            }
                        };
                    }
                    settings.success = function(data, status, res) {
                        return resolve(getRes(res, data));
                    };
                    settings.error = function(res) {
                        return res && res.status ? res.status >= 400 ? reject(getRes(res, res.responseJSON)) : resolve(getRes(res, res.responseJSON)) : reject({
                            status: 0,
                            headers: _util.$util.noop,
                            error: res && res.statusText
                        });
                    };
                    jQuery.ajax(options.uri, settings);
                });
            },
            httpNative: function(options) {
                options.params = options.params || {};
                return (config = {
                    method: options.method,
                    url: options.uri,
                    query: _extends({}, options.params, {
                        meta: JSON.stringify(options.meta)
                    }),
                    json: {
                        data: options.data,
                        meta: options.meta || {}
                    },
                    headers: this.getHeaders(options),
                    timeout: this.timeout
                }, _promise.$promise.resolver(function(resolve, reject) {
                    config.method = config.method || "get";
                    if ("get" === config.method) {
                        delete config.body;
                        delete config.json;
                    }
                    "post" === config.method && delete config.query;
                    config.query && (config.url = _util.$util.extendUrl(config.url, config.query));
                    var headers = config.headers || {};
                    config.json ? headers["Content-Type"] = headers["Content-Type"] || "application/json" : config.body && (headers["Content-Type"] = headers["Content-Type"] || "application/x-www-form-urlencoded; charset=utf-8");
                    headers.Accept = headers.Accept || "application/json";
                    var xhr = new window.XMLHttpRequest();
                    xhr.addEventListener("load", function() {
                        var status = this.status;
                        if (!status) return reject(new Error("Request did not return a response"));
                        var json = JSON.parse(this.responseText), responseHeaders = {};
                        this.getAllResponseHeaders().split("\n").forEach(function(line) {
                            var i = line.indexOf(":");
                            responseHeaders[line.slice(0, i).trim()] = line.slice(i + 1).trim();
                        });
                        return resolve({
                            status: status,
                            headers: responseHeaders,
                            json: json
                        });
                    }, !1);
                    xhr.addEventListener("error", function(evt) {
                        reject(new Error("Request to " + config.method.toLowerCase() + " " + config.url + " failed: " + evt.toString()));
                    }, !1);
                    xhr.open(config.method, config.url, !0);
                    if (headers) for (var key in headers) xhr.setRequestHeader(key, headers[key]);
                    config.json && !config.body && (config.body = JSON.stringify(config.json));
                    config.body && "object" === _typeof(config.body) && (config.body = Object.keys(config.body).map(function(key) {
                        return encodeURIComponent(key) + "=" + encodeURIComponent(config.body[key]);
                    }).join("&"));
                    xhr.send(config.body);
                })).then(function(res) {
                    return {
                        status: res.status,
                        data: res.json,
                        headers: function(name) {
                            return res.headers[name];
                        }
                    };
                }).catch(function(err) {
                    return {
                        status: 0,
                        headers: _util.$util.noop,
                        error: err.message
                    };
                }).then(function(res) {
                    if (res.status >= 400) throw res;
                    return res;
                });
                var config;
            },
            saveResponseState: function(res) {
                if (res.headers("x-csrf-jwt")) {
                    _config.$meta.headers["x-csrf-jwt"] = res.headers("x-csrf-jwt");
                    _config.$meta.csrfJwt = res.headers("x-csrf-jwt");
                    _config.$meta.headers["x-csrf-jwt-hash"] = res.headers("x-csrf-jwt-hash");
                }
                if (res.headers("X-cookies")) {
                    _config.$meta.headers["x-cookies-hash"] = res.headers("x-cookies-hash");
                    _util.$util.extend(_config.$meta.headers["x-cookies"], JSON.parse(res.headers("X-cookies") || "{}"));
                }
            },
            handleResponse: function(res, options) {
                var loggerName = "ui_" + options.name, loggerPayload = {
                    name: options.name,
                    method: options.method,
                    uri: options.uri,
                    time: options.duration,
                    duration: options.duration
                }, resultModel = options.resultModel || options.model;
                return _promise.$promise.call(function() {
                    res.data && resultModel && (resultModel.populate ? resultModel.populate(res.data) : _util.$util.extend(resultModel, res.data));
                    if (res && "success" === res.ack && resultModel && resultModel.fetchChildren) return _promise.$promise.resolve(resultModel.fetchChildren()).then(function(children) {
                        return _util.$util.extend(resultModel, children);
                    });
                }).then(function() {
                    if ("success" === res.ack) {
                        _beaverLogger2.default.info(loggerName + "_success", loggerPayload);
                        return options.success ? options.success instanceof Function ? options.success(res.data) : options.success : res;
                    }
                    if (!options.failSilently) {
                        if ("contingency" === res.ack) {
                            _beaverLogger2.default.info(loggerName + "_contingency", _util.$util.extend(loggerPayload, {
                                contingency: res.contingency
                            }));
                            if (!res.contingency) throw new _error.$ApiError("expected_contingency_name", {
                                api: options.name
                            });
                            var contingency = new _error.$Contingency(res.contingency, {
                                transient: options.transientError
                            });
                            resultModel && (resultModel.errorData = res.errorData || {});
                            var handler = options.contingencies && (options.contingencies[contingency.message] || options.contingencies.DEFAULT);
                            _util.$util.extend(contingency, res.errorData);
                            if (handler) return handler instanceof Function ? handler(contingency.message, contingency) : handler;
                            throw contingency;
                        }
                        if ("validation" === res.ack) {
                            _beaverLogger2.default.info(loggerName + "_validation", _util.$util.extend(loggerPayload, {
                                validation: res.validation
                            }));
                            if (options.validation) return options.validation(res.validation);
                            throw new _error.$ApiError("validation", {
                                transient: options.transientError
                            });
                        }
                        if ("permission_denied" === res.ack) {
                            _beaverLogger2.default.info(loggerName + "_denied", loggerPayload);
                            throw new _error.$Forbidden(options.uri + ": forbidden", {
                                transient: options.transientError
                            });
                        }
                        _beaverLogger2.default.info(loggerName + "_noack", loggerPayload);
                        throw new _error.$ApiError("noack", {
                            transient: options.transientError
                        });
                    }
                });
            },
            handleErrorResponse: function(err, options) {
                return _promise.$promise.run(function() {
                    if (options.error) return options.error(err);
                    throw err;
                });
            },
            getURI: function(model, action, relative) {
                var self = this, uri = [];
                uri.push(this.uri.replace(/\/:[\w\.]+\?/g, function(key) {
                    key = (key = key.slice(2)).substring(0, key.length - 1);
                    var component = model.get ? model.get(key) : model[key];
                    return component ? "/" + component : "";
                }).replace(/:[\w\.]+/g, function(key) {
                    key = key.slice(1);
                    var component = model.get ? model.get(key) : model[key];
                    if (!component) throw new Error('Property "' + key + '" not found in model for: ' + self.uri);
                    return component;
                }));
                action && uri.push(action);
                this.ext && (uri[uri.length - 1] += "." + this.ext);
                uri = "/" + uri.join("/").replace(/\/{2,}/g, "/").replace(/^\//, "");
                relative || (uri = (this.baseURI || _config.$config.urls.baseUrl) + uri);
                return uri;
            },
            buildMeta: function() {
                if (metaBuilder) return metaBuilder();
            },
            buildAPIName: function(options) {
                var apiName = this.uri.replace(/^\/+/, "").replace(/\//g, "_").replace(/\?(.*)/, "").replace(/[^a-zA-Z0-9_]/g, "");
                return apiName = "_" === (apiName = options.action ? apiName + "_" + options.action : apiName).charAt(0) ? apiName.slice(1) : apiName;
            }
        });
        $Api.reopenClass({
            clearCache: function() {
                cache = {};
            }
        });
        $Api.registerMetaBuilder = function(builder) {
            metaBuilder = builder;
        };
        $Api.addHeader = function(name, value) {
            standardHeaders[name] = value;
        };
        var $batchApi = new $Api({
            uri: "/api/batch",
            postAttempts: 3
        });
    },
    "./bower_modules/squid-core/dist/class.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, EmptyConstructor = function() {}, create = Object.create || function(obj) {
            EmptyConstructor.prototype = obj;
            var instance = new EmptyConstructor();
            EmptyConstructor.prototype = null;
            return instance;
        };
        function _extend(obj, source) {
            if (!source) return obj;
            for (var key in source) source.hasOwnProperty(key) && (obj[key] = source[key]);
            return obj;
        }
        function isobject(obj) {
            return obj && "object" === (void 0 === obj ? "undefined" : _typeof(obj)) && obj instanceof Object;
        }
        function transpose(recipient, args) {
            for (var i = 0; i < args.length; i++) {
                var ob = args[i];
                if (isobject(ob)) for (var key in ob) if (ob.hasOwnProperty(key)) {
                    var item = ob[key];
                    item instanceof Function && (item.__name__ = key);
                    recipient[key] = item;
                }
            }
        }
        function construct() {
            if (this.construct) {
                var ob = this.construct.apply(this, arguments);
                if (isobject(ob)) return ob;
            }
            transpose(this, arguments);
            this.init && this.init();
        }
        function reopen() {
            transpose(this.prototype, arguments);
            return this;
        }
        function reopenClass() {
            transpose(this, arguments);
            transpose(this.__classmethods__, arguments);
            return this;
        }
        function isChild(Cls) {
            return Cls && Cls.prototype instanceof this;
        }
        var id = 0;
        function extend(name) {
            var Cls = void 0, className = void 0, args = void 0, argsLength = void 0, startIndex = void 0;
            if ("string" == typeof name) {
                if (!name.match(/^[\w$][\w\d]*$/)) throw new Error("Class name can not include special characters: " + name);
                className = name;
                argsLength = arguments.length && arguments.length - 1;
                startIndex = 1;
            } else {
                className = this.name || "Object";
                argsLength = arguments.length;
                startIndex = 0;
            }
            args = new Array(argsLength);
            for (var i = startIndex; i < arguments.length; i++) args[i - startIndex] = arguments[i];
            eval("Cls = function " + className + "() { return construct.apply(this, arguments) }");
            Cls.__name__ = className;
            Cls.__classmethods__ = {
                extend: extend,
                reopen: reopen,
                reopenClass: reopenClass,
                isChild: isChild
            };
            id += 1;
            Cls.id = id;
            if (this && this !== window) {
                Cls.prototype = create(this.prototype);
                Cls.prototype.constructor = Cls;
                Cls.prototype._super = this.prototype;
                _extend(Cls.__classmethods__, this.__classmethods__);
            }
            _extend(Cls, Cls.__classmethods__);
            transpose(Cls.prototype, args);
            0 === className.indexOf("$") ? window[className] = Cls : window["$" + className] = Cls;
            return Cls;
        }
        function _get(item, path, def) {
            if (!path) return def;
            path = path.split(".");
            for (var i = 0; i < path.length; i++) {
                if (!isobject(item)) return def;
                item = item[path[i]];
            }
            return void 0 === item ? def : item;
        }
        function _set(item, path, value) {
            path = path.split(".");
            for (var i = 0; i < path.length - 1; i++) if (!isobject(item = item[path[i]])) throw new Error(path[i - 1] + "." + path[i] + " is not an object");
            item[path[path.length - 1]] = value;
        }
        function each(ob, callback) {
            for (var key in ob) ob.hasOwnProperty(key) && callback.call(ob, key, ob[key]);
        }
        function _keys(ob) {
            if (Object.keys) return Object.keys(ob);
            var result = [];
            for (var key in ob) ob.hasOwnProperty(key) && result.push(key);
            return result;
        }
        var $Class = exports.$Class = extend("Class", {
            init: function() {},
            get: function(path, def) {
                return _get(this, path, def);
            },
            set: function(path, value) {
                _set(this, path, value);
            },
            setProperties: function() {
                transpose(this, arguments);
            },
            forEach: function(callback) {
                each(this, callback);
            },
            keys: function() {
                return _keys(this);
            }
        });
        $Class.get = _get;
        $Class.set = _set;
        $Class.keys = _keys;
    },
    "./bower_modules/squid-core/dist/config.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$meta = window.meta || {}, exports.$cookies = window.cookies || {}, exports.$config = window.config || {};
    },
    "./bower_modules/squid-core/dist/error.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$FallbackError = exports.$BatchShortCircuit = exports.$ApiError = exports.$Forbidden = exports.$Contingency = exports.$Error = void 0;
        var _event = __webpack_require__("./bower_modules/squid-core/dist/event.js"), _class = __webpack_require__("./bower_modules/squid-core/dist/class.js"), _util = __webpack_require__("./bower_modules/squid-core/dist/util.js");
        _util.$util.monkeyPatch(window, "onerror", function(_ref, original) {
            var message = _ref[0], file = _ref[1], line = _ref[2], col = _ref[3], err = _ref[4];
            original();
            _event.$event.emit("$windowError", {
                message: message && (message.stack || message).toString(),
                file: file && file.toString(),
                line: line && line.toString(),
                col: col && col.toString(),
                stack: err && (err.stack || err).toString()
            });
        });
        var $Error = exports.$Error = _class.$Class.extend.call(Error, "$Error", {
            construct: function(err, properties) {
                err instanceof Error && (err = err.message);
                properties && _util.$util.extend(this, properties);
                this.payload = properties;
                this.message = err;
            }
        });
        exports.$Contingency = $Error.extend("$Contingency", {
            handle: function(handlers) {
                var handler = handlers[this.message] || handlers.DEFAULT;
                if (handler) {
                    var result = handler.call(this, this.message, this);
                    return void 0 === result || result;
                }
            }
        }), exports.$Forbidden = $Error.extend("$Forbidden"), exports.$ApiError = $Error.extend("$ApiError"), 
        exports.$BatchShortCircuit = $Error.extend("$BatchShortCircuit"), exports.$FallbackError = $Error.extend("$FallbackError", {
            init: function() {
                this.reason = this.reason || "";
                this.product = this.product || "";
                this.entryPoint = this.entryPoint || "";
            }
        });
    },
    "./bower_modules/squid-core/dist/event.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$event = void 0;
        var _promise = __webpack_require__("./bower_modules/squid-core/dist/promise.js"), handlers = {}, customEventEmitter = void 0, $event = exports.$event = {
            use: function(eventEmitter) {
                customEventEmitter = eventEmitter;
                var _iterator = Object.keys(handlers), _isArray = Array.isArray(_iterator), _i = 0;
                for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                    var _ref;
                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        if ((_i = _iterator.next()).done) break;
                        _ref = _i.value;
                    }
                    var eventName = _ref;
                    if (handlers[eventName]) {
                        var _iterator2 = handlers[eventName], _isArray2 = Array.isArray(_iterator2), _i2 = 0;
                        for (_iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ;) {
                            var _ref2;
                            if (_isArray2) {
                                if (_i2 >= _iterator2.length) break;
                                _ref2 = _iterator2[_i2++];
                            } else {
                                if ((_i2 = _iterator2.next()).done) break;
                                _ref2 = _i2.value;
                            }
                            var handler = _ref2;
                            customEventEmitter.on(eventName, handler);
                        }
                    }
                }
            },
            on: function(eventName, method) {
                if (customEventEmitter) return customEventEmitter.on(eventName, method);
                handlers[eventName] = handlers[eventName] || [];
                handlers[eventName].push(method);
                var cancelled = !1;
                function cancel() {
                    if (!cancelled) {
                        handlers[eventName].splice(handlers[eventName].indexOf(method), 1);
                        cancelled = !0;
                    }
                }
                cancel.cancel = cancel;
                return cancel;
            },
            once: function(eventName, method) {
                if (customEventEmitter) return customEventEmitter.once(eventName, method);
                var listener = $event.on(eventName, function() {
                    listener.cancel();
                    return method.apply(this, arguments);
                });
                return listener;
            },
            emit: function(eventName) {
                if (customEventEmitter) {
                    var _customEventEmitter;
                    return (_customEventEmitter = customEventEmitter).emit.apply(_customEventEmitter, arguments);
                }
                var event = {
                    preventDefault: function() {
                        event.defaultPrevented = !0;
                    }
                };
                if (handlers[eventName]) {
                    var _iterator3 = Array.prototype.slice.apply(handlers[eventName]), _isArray3 = Array.isArray(_iterator3), _i3 = 0;
                    for (_iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator](); ;) {
                        var _ref3;
                        if (_isArray3) {
                            if (_i3 >= _iterator3.length) break;
                            _ref3 = _iterator3[_i3++];
                        } else {
                            if ((_i3 = _iterator3.next()).done) break;
                            _ref3 = _i3.value;
                        }
                        var handler = _ref3;
                        handler.apply.apply(handler, [ this, event ].concat(Array.prototype.slice.call(arguments)));
                    }
                }
                return event;
            },
            broadcast: function(eventName) {
                if (customEventEmitter) {
                    var _customEventEmitter2;
                    return (_customEventEmitter2 = customEventEmitter).broadcast.apply(_customEventEmitter2, arguments);
                }
                return $event.emit.apply($event, arguments);
            },
            refCount: function($scope, start, stop) {
                return _promise.$promise.resolver(function(resolve) {
                    var count = 0;
                    function res() {
                        if (!count) {
                            if (cancelStartListener && cancelStopListener) {
                                cancelStartListener();
                                cancelStopListener();
                            }
                            return resolve();
                        }
                    }
                    var cancelStartListener = $scope.$on(start, function(event, data) {
                        count += 1;
                    }), cancelStopListener = $scope.$on(stop, function(event, data) {
                        setTimeout(function() {
                            count -= 1;
                            res();
                        }, 50);
                    });
                    setTimeout(res, 50);
                });
            },
            compose: function(start, end, startAll, endAll) {
                var count = 0;
                $event.on(start, function() {
                    count || setTimeout(function() {
                        $event.emit(startAll);
                    });
                    count += 1;
                });
                $event.on(end, function() {
                    setTimeout(function() {
                        (count -= 1) || $event.emit(endAll);
                    }, 50);
                });
                return {
                    getCount: function() {
                        return count;
                    },
                    isActive: function() {
                        return Boolean(count);
                    },
                    reset: function() {
                        count = 0;
                    }
                };
            }
        };
    },
    "./bower_modules/squid-core/dist/integration.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$integration = exports.$CONTEXT = exports.$DEFAULT = void 0;
        var obj, _beaverLogger = __webpack_require__("./node_modules/beaver-logger/index.js"), _beaverLogger2 = (obj = _beaverLogger) && obj.__esModule ? obj : {
            default: obj
        };
        var $DEFAULT = exports.$DEFAULT = "DEFAULT", $CONTEXT = exports.$CONTEXT = {
            FULLPAGE: "FULLPAGE",
            POPUP: "POPUP",
            LIGHTBOX: "LIGHTBOX",
            WEBVIEW: "WEBVIEW",
            NATIVE_CHECKOUT: "NATIVE_CHECKOUT"
        };
        exports.$integration = {
            flow: $DEFAULT,
            init: function(flow, config) {
                this.config = config || {};
                flow && this.setFlow(flow);
                this.setContext(this.getContext());
            },
            getContext: function() {
                return this.isIFrame() ? $CONTEXT.LIGHTBOX : this.isPopup() ? $CONTEXT.POPUP : $CONTEXT.FULLPAGE;
            },
            isPopup: function() {
                return Boolean(window.opener);
            },
            isIFrame: function() {
                return window.top !== window.self;
            },
            setContext: function(context) {
                _beaverLogger2.default.info("integration_context_" + context);
                this.context = context;
            },
            setFlow: function(flow) {
                _beaverLogger2.default.info("integration_flow_" + flow);
                this.flow = flow;
            },
            is: function(context, flow) {
                return this.isContext(context) && this.isFlow(flow);
            },
            isContext: function(context) {
                return this.context === context;
            },
            isFlow: function(flow) {
                return this.flow === flow;
            },
            getConfig: function(key) {
                this.context = this.getContext();
                if (this.config) return this.config.hasOwnProperty(this.context) && this.config[this.context].hasOwnProperty(this.flow) && this.config[this.context][this.flow].hasOwnProperty(key) ? this.config[this.context][this.flow][key] : this.config.hasOwnProperty(this.context) && this.config[this.context].hasOwnProperty(key) ? this.config[this.context][key] : this.config.hasOwnProperty($DEFAULT) && this.config[$DEFAULT].hasOwnProperty(this.flow) && this.config[$DEFAULT][this.flow].hasOwnProperty(key) ? this.config[$DEFAULT][this.flow][key] : this.config.hasOwnProperty($DEFAULT) && this.config[$DEFAULT].hasOwnProperty(key) ? this.config[$DEFAULT][key] : void 0;
            },
            error: function(message) {
                return new Error("Integration error: " + this.context + " / " + this.flow + " :: " + message);
            }
        };
    },
    "./bower_modules/squid-core/dist/loader.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$loader = void 0;
        var _event = __webpack_require__("./bower_modules/squid-core/dist/event.js"), _firstLoad = !1, loader = _event.$event.compose("loading", "loaded", "startLoad", "allLoaded");
        exports.$loader = {
            isLoading: function() {
                return Boolean(loader.getCount());
            },
            firstLoad: function() {
                return _firstLoad;
            },
            reset: function() {
                loader.reset();
            }
        };
        _event.$event.on("allLoaded", function() {
            _firstLoad = !0;
        });
    },
    "./bower_modules/squid-core/dist/promise.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$promise = $promise;
        var _util = __webpack_require__("./bower_modules/squid-core/dist/util.js");
        window.Promise && (window.Promise.prototype.finally = function(callback) {
            var promise = this.constructor;
            return this.then(function(value) {
                return promise.resolve(callback()).then(function() {
                    return value;
                });
            }, function(err) {
                return promise.resolve(callback()).then(function() {
                    throw err;
                });
            });
        });
        var Promise = window.Promise;
        function $promise(obj) {
            return Promise.resolve(obj);
        }
        _util.$util.extend($promise, {
            use: function(CustomPromise) {
                Promise = CustomPromise;
            },
            resolver: function(method) {
                return new Promise(method);
            },
            resolve: function(value) {
                return Promise.resolve(value);
            },
            reject: function(value) {
                return Promise.reject(value);
            },
            run: function(method) {
                return Promise.resolve().then(method);
            },
            call: function(method) {
                return Promise.resolve().then(method);
            },
            sequential: function(methods) {
                var prom = Promise.resolve();
                _util.$util.forEach(methods, function(method) {
                    prom = prom.then(method);
                });
                return prom;
            },
            sleep: function(time) {
                return new Promise(function(resolve) {
                    setTimeout(resolve, time);
                });
            },
            map: function(items, method) {
                var promises = void 0;
                if (items instanceof Array) promises = []; else {
                    if (!(items instanceof Object)) return Promise.resolve();
                    promises = {};
                }
                return this.all(_util.$util.map(items, function(item, key) {
                    promises[key] = Promise.resolve(item).then(function(result) {
                        return method(result, key, promises);
                    });
                    return promises[key];
                }));
            },
            all: function(items) {
                return items instanceof Array ? Promise.all(items) : items instanceof Object ? this.hash(items) : Promise.resolve([]);
            },
            hash: function(obj) {
                var results = {};
                return Promise.all(_util.$util.map(obj, function(item, key) {
                    return Promise.resolve(item).then(function(result) {
                        results[key] = result;
                    });
                })).then(function() {
                    return results;
                });
            },
            extend: function(obj, hash) {
                return this.hash(hash || {}).then(function(data) {
                    _util.$util.extend(obj, data);
                });
            },
            attempt: function(attempts, method) {
                attempts -= 1;
                return Promise.resolve().then(function() {
                    return method(attempts);
                }).catch(function(err) {
                    return attempts ? $promise.attempt(attempts, method) : Promise.reject(err);
                });
            },
            debounce: function(method, time) {
                var timeout = void 0, resolvers = {};
                return function() {
                    var self = this, args = arguments, key = JSON.stringify(args);
                    resolvers[key] = resolvers[key] || [];
                    return new Promise(function(resolve) {
                        resolvers[key].push(resolve);
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            var result = method.apply(self, args);
                            _util.$util.forEach(resolvers[key], function(resolver) {
                                resolver(result);
                            });
                            delete resolvers[key];
                        }, time);
                    });
                };
            },
            every: function(collection, handler) {
                return this.map(collection, function(item) {
                    return handler(item);
                }).then(function(results) {
                    return _util.$util.every(results);
                });
            },
            providing: function(condition, handler) {
                return Promise.resolve(condition).then(function(result) {
                    if (result) return handler(result);
                });
            },
            until: function(condition, pollTime, timeout, alwaysResolve) {
                return new Promise(function(resolve, reject) {
                    if (condition()) return resolve();
                    var interval = setInterval(function() {
                        if (condition()) {
                            clearInterval(interval);
                            return resolve();
                        }
                    }, pollTime);
                    timeout && setTimeout(function() {
                        clearInterval(interval);
                        return alwaysResolve ? resolve() : reject();
                    }, timeout);
                });
            },
            first: function(handlers) {
                var prom = $promise.resolve(), result = void 0;
                _util.$util.forEach(handlers, function(handler) {
                    prom = prom.then(function() {
                        return result || handler();
                    }).then(function(handlerResult) {
                        return result = handlerResult;
                    });
                });
                return prom;
            }
        });
    },
    "./bower_modules/squid-core/dist/util.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$unresolved = exports.$util = void 0;
        exports.$getRedirectUrl = $getRedirectUrl;
        exports.$dispatch = function(product, params, stateChange) {
            $util.assert(product, "expected product");
            _beaverLogger2.default.log("info", "dispatch", {
                product: product
            });
            _event.$event.emit("loading");
            var url = "";
            url = $getRedirectUrl(product, params);
            stateChange && _event.$event.emit("page_loaded", stateChange.fromState, stateChange.toState);
            return $util.redirect(url);
        };
        exports.$experiment = function(name, sample, id, loggerPayload) {
            var throttle = $util.hashStr(name + "_" + id) % 100, group = void 0;
            group = "true" === $util.param(name) ? "test_forced" : "false" === $util.param(name) ? "control_forced" : throttle < sample ? "test" : sample >= 50 || sample <= throttle && throttle < 2 * sample ? "control" : "throttle";
            _beaverLogger2.default.info("fpti_pxp_check", {
                from: "PXP_CHECK",
                to: "process_pxp_check",
                pxp_exp_id: name,
                pxp_trtmnt_id: group
            });
            _beaverLogger2.default.info(name + "_" + group, loggerPayload || {});
            if ("test" === group || "test_forced" === group) return !0;
            if ("control" === group) return !1;
        };
        var obj, _event = __webpack_require__("./bower_modules/squid-core/dist/event.js"), _beaverLogger = __webpack_require__("./node_modules/beaver-logger/index.js"), _beaverLogger2 = (obj = _beaverLogger) && obj.__esModule ? obj : {
            default: obj
        }, _config = __webpack_require__("./bower_modules/squid-core/dist/config.js"), _integration = __webpack_require__("./bower_modules/squid-core/dist/integration.js");
        var redirected = !1, paramCache = {}, $util = exports.$util = {
            forEach: function(collection, method) {
                if (collection instanceof Array) for (var i = 0; i < collection.length; i++) method(collection[i], i); else if (collection instanceof Object) for (var key in collection) collection.hasOwnProperty(key) && method(collection[key], key);
            },
            idleTimeout: function(time) {
                setTimeout(function() {
                    _beaverLogger2.default.info("page_idle");
                    $util.reload();
                }, time);
            },
            reload: function() {
                _beaverLogger2.default.info("reload");
                window.location.reload();
            },
            redirect: function(url, options) {
                if (-1 !== url.indexOf("javascript:")) {
                    _beaverLogger2.default.error("unsafe_redirect_url", {
                        url: url
                    });
                    throw new Error("Unsafe redirect url: " + url);
                }
                _beaverLogger2.default.info("redirect", {
                    url: url
                });
                _event.$event.on("$stateChangeStart", function(event) {
                    _beaverLogger2.default.info("state_change_after_redirect");
                    event.preventDefault();
                });
                function redir() {
                    if (!redirected) {
                        _beaverLogger2.default.info("redirect", {
                            url: url
                        });
                        window.onunload = window.onbeforeunload = function() {};
                        !1 !== _integration.$integration.getConfig("REDIRECT_TOP") ? window.top.location = url : window.location = url;
                        redirected = !0;
                    }
                }
                _event.$event.emit("loading");
                _beaverLogger2.default.flush().then(redir);
                setTimeout(redir, 500);
                _beaverLogger2.default.done();
            },
            cookiesEnabled: function() {
                var cookiesEnabled = void 0;
                document.cookie = "_cookiecheck=1";
                cookiesEnabled = Boolean(document.cookie.indexOf("_cookiecheck") > -1);
                document.cookie = "_cookiecheck=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie = "_cookiecheck; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                return cookiesEnabled;
            },
            params: function(string) {
                "string" != typeof string && (string = this.queryString().slice(1));
                var params = {};
                if (!string) return params;
                if (paramCache[string]) return paramCache[string];
                $util.forEach(string.split("&"), function(pair) {
                    (pair = pair.split("="))[0] && pair[1] && (params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]));
                });
                paramCache[string] = params;
                return params;
            },
            queryString: function() {
                if (window.location.search) return window.location.search;
                var string = window.location.href, idx = string.indexOf("&"), rIdx = string.lastIndexOf("#");
                return idx ? "?" + string.substring(idx, rIdx >= 0 ? rIdx : string.length) : "";
            },
            queryStringSplice: function(qs, insert, remove) {
                0 === qs.indexOf("?") && (qs = qs.slice(1));
                var params = $util.extend(this.params(qs), insert);
                $util.forEach(remove, function(key) {
                    delete params[key];
                });
                return "?" + this.paramToQueryString(params);
            },
            extend: function(obj, source) {
                if (!source) return obj;
                for (var key in source) source.hasOwnProperty(key) && (obj[key] = source[key]);
                return obj;
            },
            paramToQueryString: function(params) {
                return this.filter(this.map(Object.keys(params).sort(), function(key) {
                    if (params[key]) return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
                })).join("&");
            },
            extendUrl: function(url, query) {
                return (url += -1 === url.indexOf("?") ? "?" : "&") + $util.paramToQueryString(query);
            },
            param: function(name) {
                return this.params()[name];
            },
            hashParam: function(name) {
                return this.params(window.location.hash.slice(1))[name];
            },
            base64Decode: function(encodedString) {
                return encodedString && window.atob(encodedString);
            },
            decodeAndParse: function(encodedString) {
                if (encodedString) return this.params(decodeURIComponent(this.base64Decode(encodedString)));
            },
            assert: function(value, message, payload) {
                if (!value) throw new Error(message, payload || {});
            },
            map: function(array, method) {
                var results = void 0;
                if ((array = array || []) instanceof Array) {
                    results = [];
                    $util.forEach(array, function() {
                        results.push(method.apply(this, arguments));
                    });
                    return results;
                }
                if (array instanceof Object) {
                    results = {};
                    $util.forEach(array, function(val, key) {
                        results[key] = method.apply(this, arguments);
                    });
                    return results;
                }
                throw new Error("$util.map expects array or object");
            },
            filter: function(array, method) {
                method = method || Boolean;
                var results = [];
                $util.forEach(array, function(item) {
                    method.apply(this, arguments) && results.push(item);
                });
                return results;
            },
            find: function(array, method) {
                if (array) for (var i = 0; i < array.length; i++) if (method(array[i])) return array[i];
            },
            findIndex: function(array, method) {
                if (array) for (var i = 0; i < array.length; i++) if (method(array[i])) return i;
            },
            range: function(start, end) {
                if (!end) {
                    end = start;
                    start = 0;
                }
                for (var result = [], i = start; i < end; i++) result.push(i);
                return result;
            },
            pad: function(string, n, char) {
                n = n || 0;
                char = char || "0";
                return (Array(n + 1).join(char.toString()) + string).slice(-n);
            },
            some: function(array, method) {
                var result = void 0;
                $util.forEach(array, function(item, key) {
                    result || (result = method(item, key));
                });
                return result;
            },
            every: function(array, method) {
                method = method || Boolean;
                var result = !0;
                $util.forEach(array, function(item) {
                    method(item) || (result = !1);
                });
                return result;
            },
            reduce: function(array, method, intial) {
                $util.forEach(array, function(item) {
                    intial = method(intial, item);
                });
                return intial;
            },
            isPopup: function() {
                return _integration.$integration.isPopup();
            },
            isIFrame: function() {
                return _integration.$integration.isIFrame();
            },
            buildURL: function(url, params) {
                this.assert(url, "buildURL :: expected url");
                var paramKeys = Object.keys(params || {});
                if ("{}" === JSON.stringify(params)) return url;
                if (!paramKeys.length) return url;
                -1 === url.indexOf("?") ? url += "?" : url += "&";
                return url += this.paramToQueryString(params);
            },
            paypalURL: function(url, params) {
                url = "https://" + (_config.$meta.stage ? _config.$meta.stage : window.location.host) + url;
                return this.buildURL(url, params);
            },
            override: function(obj, methodName, handler) {
                var existing = obj[methodName];
                obj[methodName] = function() {
                    if (existing) try {
                        existing.apply(obj, arguments);
                    } catch (err) {
                        _beaverLogger2.default.error(methodName + "event_error", {
                            error: err.toString
                        });
                    }
                    return handler.apply(obj, arguments);
                };
            },
            result: function(method) {
                return method();
            },
            memoize: function(method) {
                var result = void 0, called = !1;
                function memoized() {
                    called || (result = method.apply(this, arguments));
                    called = !0;
                    return result;
                }
                memoized.flush = function() {
                    called = !1;
                };
                return memoized;
            },
            now: function() {
                return window.enablePerformance ? parseInt(window.performance.now(), 10) : Date.now();
            },
            bindObject: function(obj, self) {
                return $util.map(obj, function(method) {
                    return method.bind(self);
                });
            },
            hashStr: function(str) {
                var len, hash = 0, i = void 0;
                if (0 === str.length) return hash;
                for (i = 0, len = str.length; i < len; i++) {
                    hash = (hash << 5) - hash + str.charCodeAt(i);
                    hash |= 0;
                }
                return Math.abs(hash);
            },
            hash: function() {
                return this.hashStr(Math.random());
            },
            popup: function(name, url, options, callback) {
                callback = $util.once(callback);
                var win = window.open(url, name, $util.map(Object.keys(options), function(key) {
                    return key + "=" + options[key];
                }).join(", ")), interval = void 0;
                function checkWindowClosed() {
                    if (win.closed) {
                        clearInterval(interval);
                        callback();
                    }
                }
                interval = setInterval(checkWindowClosed, 50);
                setTimeout(checkWindowClosed);
                try {
                    var close = win.close;
                    win.close = function() {
                        close.apply(this, arguments);
                        checkWindowClosed();
                    };
                } catch (err) {}
                return win;
            },
            unique: function(collection) {
                return collection.filter(function(value, index, self) {
                    return self.indexOf(value) === index;
                });
            },
            monkeyPatch: function(mod, prop, method) {
                var original = mod[prop];
                mod[prop] = function() {
                    var _this = this, _arguments = arguments;
                    return method.call(this, arguments, function(self, args) {
                        if (original) return original.apply(self || _this, args || _arguments);
                    });
                };
            },
            once: function(method) {
                var called = !1;
                return function() {
                    if (!called) {
                        called = !0;
                        return method.apply(this, arguments);
                    }
                };
            },
            camelToDasherize: function(string) {
                return string.replace(/([A-Z])/g, function(g) {
                    return "-" + g.toLowerCase();
                });
            },
            camelToCapsUnderscore: function(string) {
                return string.replace(/([a-z][A-Z])/g, function(g) {
                    return g[0] + "_" + g[1];
                }).toUpperCase();
            },
            dasherizeToCamel: function(string) {
                return string.replace(/-([a-z])/g, function(g) {
                    return g[1].toUpperCase();
                });
            },
            parentWindow: function() {
                return window.opener ? window.opener : window.parent !== window ? window.parent : void 0;
            },
            noop: function() {}
        };
        exports.$unresolved = {
            then: $util.noop,
            catch: $util.noop
        };
        function $getRedirectUrl(product, params) {
            var url = "", urlParams = $util.params();
            (_config.$config.deploy.isLocal() || _config.$config.deploy.isStage()) && (url = _config.$config.urls.dispatch && _config.$config.urls.dispatch[product] || "");
            url += _config.$config.urls.fallbackUrl[product];
            $util.extend(urlParams, params || {});
            urlParams.cmd && delete urlParams.cmd;
            return $util.buildURL(url, urlParams);
        }
    },
    "./button/util/get.js": function(module, exports, __webpack_require__) {
        "use strict";
        var _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        exports.__esModule = !0;
        var _typeof = "function" == typeof Symbol && "symbol" === _typeof2(Symbol.iterator) ? function(obj) {
            return void 0 === obj ? "undefined" : _typeof2(obj);
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : void 0 === obj ? "undefined" : _typeof2(obj);
        }, isObjectOrArray = exports.isObjectOrArray = function(value) {
            return value && "object" === (void 0 === value ? "undefined" : _typeof(value)) && value instanceof Object;
        };
        exports.get = function(item, path, def) {
            if (!path) return def;
            for (var splitPath = path.split("."), i = 0; i < splitPath.length; i++) {
                if (!isObjectOrArray(item)) return def;
                item = item[splitPath[i]];
            }
            return void 0 === item ? def : item;
        };
    },
    "./node_modules/beaver-logger/dist/beaver-logger.js": function(module, exports, __webpack_require__) {
        "use strict";
        (function(module) {
            var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
                return typeof obj;
            } : function(obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };
            !function(root, factory) {
                if ("object" === _typeof(exports) && "object" === _typeof(module)) module.exports = factory(); else {
                    __WEBPACK_AMD_DEFINE_ARRAY__ = [], void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
                }
            }(0, function() {
                return function(modules) {
                    var installedModules = {};
                    function __webpack_require__(moduleId) {
                        if (installedModules[moduleId]) return installedModules[moduleId].exports;
                        var module = installedModules[moduleId] = {
                            exports: {},
                            id: moduleId,
                            loaded: !1
                        };
                        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
                        module.loaded = !0;
                        return module.exports;
                    }
                    __webpack_require__.m = modules;
                    __webpack_require__.c = installedModules;
                    __webpack_require__.p = "";
                    return __webpack_require__(0);
                }([ function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _interface = __webpack_require__(1);
                    Object.keys(_interface).forEach(function(key) {
                        "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                            enumerable: !0,
                            get: function() {
                                return _interface[key];
                            }
                        });
                    });
                    var INTERFACE = function(obj) {
                        if (obj && obj.__esModule) return obj;
                        var newObj = {};
                        if (null != obj) for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                        newObj.default = obj;
                        return newObj;
                    }(_interface);
                    exports.default = INTERFACE;
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _logger = __webpack_require__(2);
                    Object.keys(_logger).forEach(function(key) {
                        "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                            enumerable: !0,
                            get: function() {
                                return _logger[key];
                            }
                        });
                    });
                    var _init = __webpack_require__(11);
                    Object.keys(_init).forEach(function(key) {
                        "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                            enumerable: !0,
                            get: function() {
                                return _init[key];
                            }
                        });
                    });
                    var _transitions = __webpack_require__(13);
                    Object.keys(_transitions).forEach(function(key) {
                        "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                            enumerable: !0,
                            get: function() {
                                return _transitions[key];
                            }
                        });
                    });
                    var _builders = __webpack_require__(9);
                    Object.keys(_builders).forEach(function(key) {
                        "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                            enumerable: !0,
                            get: function() {
                                return _builders[key];
                            }
                        });
                    });
                    var _config = __webpack_require__(10);
                    Object.keys(_config).forEach(function(key) {
                        "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                            enumerable: !0,
                            get: function() {
                                return _config[key];
                            }
                        });
                    });
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.track = exports.flush = exports.tracking = exports.buffer = void 0;
                    exports.getTransport = function() {
                        return transport;
                    };
                    exports.setTransport = function(newTransport) {
                        transport = newTransport;
                    };
                    exports.print = print;
                    exports.immediateFlush = immediateFlush;
                    exports.log = log;
                    exports.prefix = function(name) {
                        return {
                            debug: function(event, payload) {
                                return log("debug", name + "_" + event, payload);
                            },
                            info: function(event, payload) {
                                return log("info", name + "_" + event, payload);
                            },
                            warn: function(event, payload) {
                                return log("warn", name + "_" + event, payload);
                            },
                            error: function(event, payload) {
                                return log("error", name + "_" + event, payload);
                            },
                            track: function(payload) {
                                return _track(payload);
                            },
                            flush: function() {
                                return _flush();
                            }
                        };
                    };
                    exports.debug = function(event, payload) {
                        return log("debug", event, payload);
                    };
                    exports.info = function(event, payload) {
                        return log("info", event, payload);
                    };
                    exports.warn = function(event, payload) {
                        return log("warn", event, payload);
                    };
                    exports.error = function(event, payload) {
                        return log("error", event, payload);
                    };
                    var _util = __webpack_require__(3), _builders = __webpack_require__(9), _config = __webpack_require__(10), buffer = exports.buffer = [], tracking = exports.tracking = [], transport = function(headers, data, options) {
                        return (0, _util.ajax)("post", _config.config.uri, headers, data, options);
                    };
                    var loaded = !1;
                    setTimeout(function() {
                        loaded = !0;
                    }, 1);
                    function print(level, event, payload) {
                        if ("undefined" != typeof window && window.console && window.console.log) {
                            if (!loaded) return setTimeout(function() {
                                return print(level, event, payload);
                            }, 1);
                            var logLevel = _config.config.logLevel;
                            window.LOG_LEVEL && (logLevel = window.LOG_LEVEL);
                            if (!(_config.logLevels.indexOf(level) > _config.logLevels.indexOf(logLevel))) {
                                payload = payload || {};
                                var args = [ event ];
                                (0, _util.isIE)() && (payload = JSON.stringify(payload));
                                args.push(payload);
                                (payload.error || payload.warning) && args.push("\n\n", payload.error || payload.warning);
                                try {
                                    window.console[level] && window.console[level].apply ? window.console[level].apply(window.console, args) : window.console.log && window.console.log.apply && window.console.log.apply(window.console, args);
                                } catch (err) {}
                            }
                        }
                    }
                    function immediateFlush() {
                        var _ref$fireAndForget = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).fireAndForget, fireAndForget = void 0 !== _ref$fireAndForget && _ref$fireAndForget;
                        if ("undefined" != typeof window && _config.config.uri) {
                            var hasBuffer = buffer.length, hasTracking = tracking.length;
                            if (hasBuffer || hasTracking) {
                                var meta = {}, _iterator = _builders.metaBuilders, _isArray = Array.isArray(_iterator), _i = 0;
                                for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                                    var _ref2;
                                    if (_isArray) {
                                        if (_i >= _iterator.length) break;
                                        _ref2 = _iterator[_i++];
                                    } else {
                                        if ((_i = _iterator.next()).done) break;
                                        _ref2 = _i.value;
                                    }
                                    var builder = _ref2;
                                    try {
                                        (0, _util.extend)(meta, builder(meta), !1);
                                    } catch (err) {
                                        console.error("Error in custom meta builder:", err.stack || err.toString());
                                    }
                                }
                                var headers = {}, _iterator2 = _builders.headerBuilders, _isArray2 = Array.isArray(_iterator2), _i2 = 0;
                                for (_iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ;) {
                                    var _ref3;
                                    if (_isArray2) {
                                        if (_i2 >= _iterator2.length) break;
                                        _ref3 = _iterator2[_i2++];
                                    } else {
                                        if ((_i2 = _iterator2.next()).done) break;
                                        _ref3 = _i2.value;
                                    }
                                    var _builder = _ref3;
                                    try {
                                        (0, _util.extend)(headers, _builder(headers), !1);
                                    } catch (err) {
                                        console.error("Error in custom header builder:", err.stack || err.toString());
                                    }
                                }
                                var req = transport(headers, {
                                    events: buffer,
                                    meta: meta,
                                    tracking: tracking
                                }, {
                                    fireAndForget: fireAndForget
                                });
                                exports.buffer = buffer = [];
                                exports.tracking = tracking = [];
                                return req;
                            }
                        }
                    }
                    var _flush = (0, _util.promiseDebounce)(immediateFlush, _config.config.debounceInterval);
                    exports.flush = _flush;
                    function enqueue(level, event, payload) {
                        buffer.push({
                            level: level,
                            event: event,
                            payload: payload
                        });
                        _config.config.autoLog.indexOf(level) > -1 && _flush();
                    }
                    function log(level, event, payload) {
                        if ("undefined" != typeof window) {
                            _config.config.prefix && (event = _config.config.prefix + "_" + event);
                            "string" == typeof (payload = payload || {}) ? payload = {
                                message: payload
                            } : payload instanceof Error && (payload = {
                                error: payload.stack || payload.toString()
                            });
                            try {
                                JSON.stringify(payload);
                            } catch (err) {
                                return;
                            }
                            payload.timestamp = Date.now();
                            var _iterator3 = _builders.payloadBuilders, _isArray3 = Array.isArray(_iterator3), _i3 = 0;
                            for (_iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator](); ;) {
                                var _ref4;
                                if (_isArray3) {
                                    if (_i3 >= _iterator3.length) break;
                                    _ref4 = _iterator3[_i3++];
                                } else {
                                    if ((_i3 = _iterator3.next()).done) break;
                                    _ref4 = _i3.value;
                                }
                                var builder = _ref4;
                                try {
                                    (0, _util.extend)(payload, builder(payload), !1);
                                } catch (err) {
                                    console.error("Error in custom payload builder:", err.stack || err.toString());
                                }
                            }
                            _config.config.silent || print(level, event, payload);
                            buffer.length === _config.config.sizeLimit ? enqueue("info", "logger_max_buffer_length") : buffer.length < _config.config.sizeLimit && enqueue(level, event, payload);
                        }
                    }
                    function _track(payload) {
                        if ("undefined" != typeof window && payload) {
                            try {
                                JSON.stringify(payload);
                            } catch (err) {
                                return;
                            }
                            var _iterator4 = _builders.trackingBuilders, _isArray4 = Array.isArray(_iterator4), _i4 = 0;
                            for (_iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator](); ;) {
                                var _ref5;
                                if (_isArray4) {
                                    if (_i4 >= _iterator4.length) break;
                                    _ref5 = _iterator4[_i4++];
                                } else {
                                    if ((_i4 = _iterator4.next()).done) break;
                                    _ref5 = _i4.value;
                                }
                                var builder = _ref5;
                                try {
                                    (0, _util.extend)(payload, builder(payload), !1);
                                } catch (err) {
                                    console.error("Error in custom tracking builder:", err.stack || err.toString());
                                }
                            }
                            print("debug", "tracking", payload);
                            tracking.push(payload);
                        }
                    }
                    exports.track = _track;
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.extend = function(dest, src) {
                        var over = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2];
                        dest = dest || {};
                        src = src || {};
                        for (var i in src) src.hasOwnProperty(i) && (!over && dest.hasOwnProperty(i) || (dest[i] = src[i]));
                        return dest;
                    };
                    exports.isSameProtocol = isSameProtocol;
                    exports.isSameDomain = isSameDomain;
                    exports.ajax = function(method, url) {
                        var headers = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, data = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}, _ref$fireAndForget = (arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : {}).fireAndForget, fireAndForget = void 0 !== _ref$fireAndForget && _ref$fireAndForget;
                        return new _src.ZalgoPromise(function(resolve) {
                            var XRequest = window.XMLHttpRequest || window.ActiveXObject;
                            if (window.XDomainRequest && !isSameDomain(url)) {
                                if (!isSameProtocol(url)) return resolve();
                                XRequest = window.XDomainRequest;
                            }
                            var req = new XRequest("MSXML2.XMLHTTP.3.0");
                            req.open(method.toUpperCase(), url, !0);
                            if ("function" == typeof req.setRequestHeader) {
                                req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                                req.setRequestHeader("Content-type", "application/json");
                                for (var headerName in headers) headers.hasOwnProperty(headerName) && req.setRequestHeader(headerName, headers[headerName]);
                            }
                            fireAndForget ? resolve() : req.onreadystatechange = function() {
                                req.readyState > 3 && resolve();
                            };
                            req.send(JSON.stringify(data).replace(/&/g, "%26"));
                        });
                    };
                    exports.promiseDebounce = function(method, interval) {
                        var debounce = {};
                        return function() {
                            var args = arguments;
                            if (debounce.timeout) {
                                clearTimeout(debounce.timeout);
                                delete debounce.timeout;
                            }
                            debounce.timeout = setTimeout(function() {
                                var resolver = debounce.resolver, rejector = debounce.rejector;
                                delete debounce.promise;
                                delete debounce.resolver;
                                delete debounce.rejector;
                                delete debounce.timeout;
                                return _src.ZalgoPromise.resolve().then(function() {
                                    return method.apply(null, args);
                                }).then(resolver, rejector);
                            }, interval);
                            debounce.promise = debounce.promise || new _src.ZalgoPromise(function(resolver, rejector) {
                                debounce.resolver = resolver;
                                debounce.rejector = rejector;
                            });
                            return debounce.promise;
                        };
                    };
                    exports.onWindowReady = function() {
                        return new _src.ZalgoPromise(function(resolve) {
                            "undefined" != typeof document && "complete" === document.readyState && resolve();
                            window.addEventListener("load", resolve);
                        });
                    };
                    exports.safeInterval = function(method, time) {
                        var timeout = void 0;
                        !function loop() {
                            timeout = setTimeout(function() {
                                method();
                                loop();
                            }, time);
                        }();
                        return {
                            cancel: function() {
                                clearTimeout(timeout);
                            }
                        };
                    };
                    exports.uniqueID = function() {
                        var chars = "0123456789abcdef";
                        return "xxxxxxxxxx".replace(/./g, function() {
                            return chars.charAt(Math.floor(Math.random() * chars.length));
                        });
                    };
                    exports.isIE = function() {
                        return Boolean(window.document.documentMode);
                    };
                    var _src = __webpack_require__(4);
                    function isSameProtocol(url) {
                        return window.location.protocol === url.split("/")[0];
                    }
                    function isSameDomain(url) {
                        var match = url.match(/https?:\/\/[^/]+/);
                        return !match || match[0] === window.location.protocol + "//" + window.location.host;
                    }
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _promise = __webpack_require__(5);
                    Object.defineProperty(exports, "ZalgoPromise", {
                        enumerable: !0,
                        get: function() {
                            return _promise.ZalgoPromise;
                        }
                    });
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.ZalgoPromise = void 0;
                    var _createClass = function() {
                        function defineProperties(target, props) {
                            for (var i = 0; i < props.length; i++) {
                                var descriptor = props[i];
                                descriptor.enumerable = descriptor.enumerable || !1;
                                descriptor.configurable = !0;
                                "value" in descriptor && (descriptor.writable = !0);
                                Object.defineProperty(target, descriptor.key, descriptor);
                            }
                        }
                        return function(Constructor, protoProps, staticProps) {
                            protoProps && defineProperties(Constructor.prototype, protoProps);
                            staticProps && defineProperties(Constructor, staticProps);
                            return Constructor;
                        };
                    }(), _utils = __webpack_require__(6), _exceptions = __webpack_require__(7), _global = __webpack_require__(8);
                    var ZalgoPromise = function() {
                        function ZalgoPromise(handler) {
                            var _this = this;
                            !function(instance, Constructor) {
                                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
                            }(this, ZalgoPromise);
                            this.resolved = !1;
                            this.rejected = !1;
                            this.errorHandled = !1;
                            this.handlers = [];
                            if (handler) {
                                var _result = void 0, _error = void 0, resolved = !1, rejected = !1, isAsync = !1;
                                try {
                                    handler(function(res) {
                                        if (isAsync) _this.resolve(res); else {
                                            resolved = !0;
                                            _result = res;
                                        }
                                    }, function(err) {
                                        if (isAsync) _this.reject(err); else {
                                            rejected = !0;
                                            _error = err;
                                        }
                                    });
                                } catch (err) {
                                    this.reject(err);
                                    return;
                                }
                                isAsync = !0;
                                resolved ? this.resolve(_result) : rejected && this.reject(_error);
                            }
                        }
                        _createClass(ZalgoPromise, [ {
                            key: "resolve",
                            value: function(result) {
                                if (this.resolved || this.rejected) return this;
                                if ((0, _utils.isPromise)(result)) throw new Error("Can not resolve promise with another promise");
                                this.resolved = !0;
                                this.value = result;
                                this.dispatch();
                                return this;
                            }
                        }, {
                            key: "reject",
                            value: function(error) {
                                var _this2 = this;
                                if (this.resolved || this.rejected) return this;
                                if ((0, _utils.isPromise)(error)) throw new Error("Can not reject promise with another promise");
                                if (!error) {
                                    var _err = error && "function" == typeof error.toString ? error.toString() : Object.prototype.toString.call(error);
                                    error = new Error("Expected reject to be called with Error, got " + _err);
                                }
                                this.rejected = !0;
                                this.error = error;
                                this.errorHandled || setTimeout(function() {
                                    _this2.errorHandled || (0, _exceptions.dispatchPossiblyUnhandledError)(error);
                                }, 1);
                                this.dispatch();
                                return this;
                            }
                        }, {
                            key: "asyncReject",
                            value: function(error) {
                                this.errorHandled = !0;
                                this.reject(error);
                            }
                        }, {
                            key: "dispatch",
                            value: function() {
                                var _this3 = this, dispatching = this.dispatching, resolved = this.resolved, rejected = this.rejected, handlers = this.handlers;
                                if (!dispatching && (resolved || rejected)) {
                                    this.dispatching = !0;
                                    (0, _global.getGlobal)().activeCount += 1;
                                    for (var _loop = function(i) {
                                        var _handlers$i = handlers[i], onSuccess = _handlers$i.onSuccess, onError = _handlers$i.onError, promise = _handlers$i.promise, result = void 0;
                                        if (resolved) try {
                                            result = onSuccess ? onSuccess(_this3.value) : _this3.value;
                                        } catch (err) {
                                            promise.reject(err);
                                            return "continue";
                                        } else if (rejected) {
                                            if (!onError) {
                                                promise.reject(_this3.error);
                                                return "continue";
                                            }
                                            try {
                                                result = onError(_this3.error);
                                            } catch (err) {
                                                promise.reject(err);
                                                return "continue";
                                            }
                                        }
                                        if (result instanceof ZalgoPromise && (result.resolved || result.rejected)) {
                                            result.resolved ? promise.resolve(result.value) : promise.reject(result.error);
                                            result.errorHandled = !0;
                                        } else (0, _utils.isPromise)(result) ? result instanceof ZalgoPromise && (result.resolved || result.rejected) ? result.resolved ? promise.resolve(result.value) : promise.reject(result.error) : result.then(function(res) {
                                            promise.resolve(res);
                                        }, function(err) {
                                            promise.reject(err);
                                        }) : promise.resolve(result);
                                    }, i = 0; i < handlers.length; i++) _loop(i);
                                    handlers.length = 0;
                                    this.dispatching = !1;
                                    (0, _global.getGlobal)().activeCount -= 1;
                                    0 === (0, _global.getGlobal)().activeCount && ZalgoPromise.flushQueue();
                                }
                            }
                        }, {
                            key: "then",
                            value: function(onSuccess, onError) {
                                if (onSuccess && "function" != typeof onSuccess && !onSuccess.call) throw new Error("Promise.then expected a function for success handler");
                                if (onError && "function" != typeof onError && !onError.call) throw new Error("Promise.then expected a function for error handler");
                                var promise = new ZalgoPromise();
                                this.handlers.push({
                                    promise: promise,
                                    onSuccess: onSuccess,
                                    onError: onError
                                });
                                this.errorHandled = !0;
                                this.dispatch();
                                return promise;
                            }
                        }, {
                            key: "catch",
                            value: function(onError) {
                                return this.then(void 0, onError);
                            }
                        }, {
                            key: "finally",
                            value: function(handler) {
                                return this.then(function(result) {
                                    return ZalgoPromise.try(handler).then(function() {
                                        return result;
                                    });
                                }, function(err) {
                                    return ZalgoPromise.try(handler).then(function() {
                                        throw err;
                                    });
                                });
                            }
                        }, {
                            key: "timeout",
                            value: function(time, err) {
                                var _this4 = this;
                                if (this.resolved || this.rejected) return this;
                                var timeout = setTimeout(function() {
                                    _this4.resolved || _this4.rejected || _this4.reject(err || new Error("Promise timed out after " + time + "ms"));
                                }, time);
                                return this.then(function(result) {
                                    clearTimeout(timeout);
                                    return result;
                                });
                            }
                        }, {
                            key: "toPromise",
                            value: function() {
                                if ("undefined" == typeof Promise) throw new TypeError("Could not find Promise");
                                return Promise.resolve(this);
                            }
                        } ], [ {
                            key: "resolve",
                            value: function(value) {
                                return value instanceof ZalgoPromise ? value : (0, _utils.isPromise)(value) ? new ZalgoPromise(function(resolve, reject) {
                                    return value.then(resolve, reject);
                                }) : new ZalgoPromise().resolve(value);
                            }
                        }, {
                            key: "reject",
                            value: function(error) {
                                return new ZalgoPromise().reject(error);
                            }
                        }, {
                            key: "all",
                            value: function(promises) {
                                var promise = new ZalgoPromise(), count = promises.length, results = [];
                                if (!count) {
                                    promise.resolve(results);
                                    return promise;
                                }
                                for (var _loop2 = function(i) {
                                    var prom = promises[i];
                                    if (prom instanceof ZalgoPromise) {
                                        if (prom.resolved) {
                                            results[i] = prom.value;
                                            count -= 1;
                                            return "continue";
                                        }
                                    } else if (!(0, _utils.isPromise)(prom)) {
                                        results[i] = prom;
                                        count -= 1;
                                        return "continue";
                                    }
                                    ZalgoPromise.resolve(prom).then(function(result) {
                                        results[i] = result;
                                        0 === (count -= 1) && promise.resolve(results);
                                    }, function(err) {
                                        promise.reject(err);
                                    });
                                }, i = 0; i < promises.length; i++) _loop2(i);
                                0 === count && promise.resolve(results);
                                return promise;
                            }
                        }, {
                            key: "hash",
                            value: function(promises) {
                                var result = {};
                                return ZalgoPromise.all(Object.keys(promises).map(function(key) {
                                    return ZalgoPromise.resolve(promises[key]).then(function(value) {
                                        result[key] = value;
                                    });
                                })).then(function() {
                                    return result;
                                });
                            }
                        }, {
                            key: "map",
                            value: function(items, method) {
                                return ZalgoPromise.all(items.map(method));
                            }
                        }, {
                            key: "onPossiblyUnhandledException",
                            value: function(handler) {
                                return (0, _exceptions.onPossiblyUnhandledException)(handler);
                            }
                        }, {
                            key: "try",
                            value: function(method, context, args) {
                                var result = void 0;
                                try {
                                    result = method.apply(context, args || []);
                                } catch (err) {
                                    return ZalgoPromise.reject(err);
                                }
                                return ZalgoPromise.resolve(result);
                            }
                        }, {
                            key: "delay",
                            value: function(_delay) {
                                return new ZalgoPromise(function(resolve) {
                                    setTimeout(resolve, _delay);
                                });
                            }
                        }, {
                            key: "isPromise",
                            value: function(value) {
                                return !!(value && value instanceof ZalgoPromise) || (0, _utils.isPromise)(value);
                            }
                        }, {
                            key: "flush",
                            value: function() {
                                var promise = new ZalgoPromise();
                                (0, _global.getGlobal)().flushPromises.push(promise);
                                0 === (0, _global.getGlobal)().activeCount && ZalgoPromise.flushQueue();
                                return promise;
                            }
                        }, {
                            key: "flushQueue",
                            value: function() {
                                var promisesToFlush = (0, _global.getGlobal)().flushPromises;
                                (0, _global.getGlobal)().flushPromises = [];
                                var _iterator = promisesToFlush, _isArray = Array.isArray(_iterator), _i = 0;
                                for (_iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
                                    var _ref;
                                    if (_isArray) {
                                        if (_i >= _iterator.length) break;
                                        _ref = _iterator[_i++];
                                    } else {
                                        if ((_i = _iterator.next()).done) break;
                                        _ref = _i.value;
                                    }
                                    _ref.resolve();
                                }
                            }
                        } ]);
                        return ZalgoPromise;
                    }();
                    exports.ZalgoPromise = ZalgoPromise;
                }, function(module, exports) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.isPromise = function(item) {
                        try {
                            if (!item) return !1;
                            if ("undefined" != typeof Promise && item instanceof Promise) return !0;
                            if ("undefined" != typeof window && window.Window && item instanceof window.Window) return !1;
                            if ("undefined" != typeof window && window.constructor && item instanceof window.constructor) return !1;
                            var _toString = {}.toString;
                            if (_toString) {
                                var name = _toString.call(item);
                                if ("[object Window]" === name || "[object global]" === name || "[object DOMWindow]" === name) return !1;
                            }
                            if ("function" == typeof item.then) return !0;
                        } catch (err) {
                            return !1;
                        }
                        return !1;
                    };
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.dispatchPossiblyUnhandledError = function(err) {
                        if (-1 !== (0, _global.getGlobal)().dispatchedErrors.indexOf(err)) return;
                        (0, _global.getGlobal)().dispatchedErrors.push(err);
                        setTimeout(function() {
                            throw err;
                        }, 1);
                        for (var j = 0; j < (0, _global.getGlobal)().possiblyUnhandledPromiseHandlers.length; j++) (0, 
                        _global.getGlobal)().possiblyUnhandledPromiseHandlers[j](err);
                    };
                    exports.onPossiblyUnhandledException = function(handler) {
                        (0, _global.getGlobal)().possiblyUnhandledPromiseHandlers.push(handler);
                        return {
                            cancel: function() {
                                (0, _global.getGlobal)().possiblyUnhandledPromiseHandlers.splice((0, _global.getGlobal)().possiblyUnhandledPromiseHandlers.indexOf(handler), 1);
                            }
                        };
                    };
                    var _global = __webpack_require__(8);
                }, function(module, exports) {
                    (function(global) {
                        Object.defineProperty(exports, "__esModule", {
                            value: !0
                        });
                        exports.getGlobal = function() {
                            var glob = void 0;
                            if ("undefined" != typeof window) glob = window; else {
                                if (void 0 === global) throw new TypeError("Can not find global");
                                glob = global;
                            }
                            var zalgoGlobal = glob.__zalgopromise__ = glob.__zalgopromise__ || {};
                            zalgoGlobal.flushPromises = zalgoGlobal.flushPromises || [];
                            zalgoGlobal.activeCount = zalgoGlobal.activeCount || 0;
                            zalgoGlobal.possiblyUnhandledPromiseHandlers = zalgoGlobal.possiblyUnhandledPromiseHandlers || [];
                            zalgoGlobal.dispatchedErrors = zalgoGlobal.dispatchedErrors || [];
                            return zalgoGlobal;
                        };
                    }).call(exports, function() {
                        return this;
                    }());
                }, function(module, exports) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.addPayloadBuilder = function(builder) {
                        payloadBuilders.push(builder);
                    };
                    exports.addMetaBuilder = function(builder) {
                        metaBuilders.push(builder);
                    };
                    exports.addTrackingBuilder = function(builder) {
                        trackingBuilders.push(builder);
                    };
                    exports.addHeaderBuilder = function(builder) {
                        headerBuilders.push(builder);
                    };
                    var payloadBuilders = exports.payloadBuilders = [], metaBuilders = exports.metaBuilders = [], trackingBuilders = exports.trackingBuilders = [], headerBuilders = exports.headerBuilders = [];
                }, function(module, exports) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.config = {
                        uri: "",
                        prefix: "",
                        initial_state_name: "init",
                        flushInterval: 6e5,
                        debounceInterval: 10,
                        sizeLimit: 300,
                        silent: !1,
                        heartbeat: !0,
                        heartbeatConsoleLog: !0,
                        heartbeatInterval: 5e3,
                        heartbeatTooBusy: !1,
                        heartbeatTooBusyThreshold: 1e4,
                        logLevel: "warn",
                        autoLog: [ "warn", "error" ],
                        logUnload: !0,
                        logPerformance: !0
                    }, exports.logLevels = [ "error", "warn", "info", "debug" ];
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.init = function(conf) {
                        (0, _util.extend)(_config.config, conf || {});
                        if (initiated) return;
                        initiated = !0;
                        _config.config.logPerformance && (0, _performance.initPerformance)();
                        _config.config.heartbeat && (0, _performance.initHeartBeat)();
                        if (_config.config.logUnload) {
                            window.addEventListener("beforeunload", function() {
                                (0, _logger.info)("window_beforeunload");
                                (0, _logger.immediateFlush)({
                                    fireAndForget: !0
                                });
                            });
                            window.addEventListener("unload", function() {
                                (0, _logger.info)("window_unload");
                                (0, _logger.immediateFlush)({
                                    fireAndForget: !0
                                });
                            });
                        }
                        _config.config.flushInterval && setInterval(_logger.flush, _config.config.flushInterval);
                        if (window.beaverLogQueue) {
                            window.beaverLogQueue.forEach(function(payload) {
                                (0, _logger.log)(payload.level, payload.event, payload);
                            });
                            delete window.beaverLogQueue;
                        }
                    };
                    var _config = __webpack_require__(10), _util = __webpack_require__(3), _performance = __webpack_require__(12), _logger = __webpack_require__(2), initiated = !1;
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.reqTimer = exports.clientTimer = void 0;
                    exports.now = now;
                    exports.reqStartElapsed = reqStartElapsed;
                    exports.initHeartBeat = function() {
                        var heartBeatTimer = timer(), heartbeatCount = 0;
                        (0, _util.safeInterval)(function() {
                            if (!(_config.config.heartbeatMaxThreshold && heartbeatCount > _config.config.heartbeatMaxThreshold)) {
                                heartbeatCount += 1;
                                var elapsed = heartBeatTimer.elapsed(), lag = elapsed - _config.config.heartbeatInterval, heartbeatPayload = {
                                    count: heartbeatCount,
                                    elapsed: elapsed
                                };
                                if (_config.config.heartbeatTooBusy) {
                                    heartbeatPayload.lag = lag;
                                    lag >= _config.config.heartbeatTooBusyThreshold && (0, _logger.info)("toobusy", heartbeatPayload, {
                                        noConsole: !_config.config.heartbeatConsoleLog
                                    });
                                }
                                (0, _logger.info)("heartbeat", heartbeatPayload, {
                                    noConsole: !_config.config.heartbeatConsoleLog
                                });
                            }
                        }, _config.config.heartbeatInterval);
                    };
                    exports.initPerformance = function() {
                        if (!enablePerformance) return (0, _logger.info)("no_performance_data");
                        (0, _builders.addPayloadBuilder)(function() {
                            var payload = {};
                            payload.client_elapsed = clientTimer.elapsed();
                            enablePerformance && (payload.req_elapsed = reqTimer.elapsed());
                            return payload;
                        });
                        (0, _util.onWindowReady)().then(function() {
                            var timing = {};
                            [ "connectEnd", "connectStart", "domComplete", "domContentLoadedEventEnd", "domContentLoadedEventStart", "domInteractive", "domLoading", "domainLookupEnd", "domainLookupStart", "fetchStart", "loadEventEnd", "loadEventStart", "navigationStart", "redirectEnd", "redirectStart", "requestStart", "responseEnd", "responseStart", "secureConnectionStart", "unloadEventEnd", "unloadEventStart" ].forEach(function(key) {
                                timing[key] = parseInt(window.performance.timing[key], 10) || 0;
                            });
                            var offset = timing.connectEnd - timing.navigationStart;
                            timing.connectEnd && Object.keys(timing).forEach(function(name) {
                                var time = timing[name];
                                time && (0, _logger.info)("timing_" + name, {
                                    client_elapsed: parseInt(time - timing.connectEnd - (clientTimer.startTime - offset), 10),
                                    req_elapsed: parseInt(time - timing.connectEnd, 10)
                                });
                            });
                            (0, _logger.info)("timing", timing);
                            (0, _logger.info)("memory", window.performance.memory);
                            (0, _logger.info)("navigation", window.performance.navigation);
                            window.performance.getEntries && window.performance.getEntries().forEach(function(resource) {
                                [ "link", "script", "img", "css" ].indexOf(resource.initiatorType) > -1 && (0, _logger.info)(resource.initiatorType, resource);
                            });
                        });
                    };
                    var _config = __webpack_require__(10), _logger = __webpack_require__(2), _builders = __webpack_require__(9), _util = __webpack_require__(3), enablePerformance = window && window.performance && performance.now && performance.timing && performance.timing.connectEnd && performance.timing.navigationStart && Math.abs(performance.now() - Date.now()) > 1e3 && performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart) > 0;
                    function now() {
                        return enablePerformance ? performance.now() : Date.now();
                    }
                    function timer(startTime) {
                        return {
                            startTime: startTime = void 0 !== startTime ? startTime : now(),
                            elapsed: function() {
                                return parseInt(now() - startTime, 10);
                            },
                            reset: function() {
                                startTime = now();
                            }
                        };
                    }
                    function reqStartElapsed() {
                        if (enablePerformance) {
                            var timing = window.performance.timing;
                            return parseInt(timing.connectEnd - timing.navigationStart, 10);
                        }
                    }
                    var clientTimer = exports.clientTimer = timer(), reqTimer = exports.reqTimer = timer(reqStartElapsed());
                }, function(module, exports, __webpack_require__) {
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.startTransition = startTransition;
                    exports.endTransition = endTransition;
                    exports.transition = function(toState) {
                        startTransition();
                        endTransition(toState);
                    };
                    var _performance = __webpack_require__(12), _logger = __webpack_require__(2), _builders = __webpack_require__(9), _util = __webpack_require__(3), _config = __webpack_require__(10), windowID = (0, 
                    _util.uniqueID)(), pageID = (0, _util.uniqueID)(), currentState = _config.config.initial_state_name, startTime = void 0;
                    function startTransition() {
                        startTime = (0, _performance.now)();
                    }
                    function endTransition(toState) {
                        startTime = startTime || (0, _performance.reqStartElapsed)();
                        var currentTime = (0, _performance.now)(), elapsedTime = void 0;
                        void 0 !== startTime && (elapsedTime = parseInt(currentTime - startTime, 0));
                        var transitionName = "transition_" + currentState + "_to_" + toState;
                        (0, _logger.info)(transitionName, {
                            duration: elapsedTime
                        });
                        (0, _logger.track)({
                            transition: transitionName,
                            transition_time: elapsedTime
                        });
                        (0, _logger.immediateFlush)();
                        startTime = currentTime;
                        currentState = toState;
                        pageID = (0, _util.uniqueID)();
                    }
                    (0, _builders.addPayloadBuilder)(function() {
                        return {
                            windowID: windowID,
                            pageID: pageID
                        };
                    });
                    (0, _builders.addMetaBuilder)(function() {
                        return {
                            state: "ui_" + currentState
                        };
                    });
                } ]);
            });
        }).call(exports, __webpack_require__("./node_modules/webpack/buildin/module.js")(module));
    },
    "./node_modules/beaver-logger/index.js": function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__("./node_modules/beaver-logger/dist/beaver-logger.js");
        module.exports.default = module.exports;
    },
    "./node_modules/paypal-sdk-constants/dist/paypal-sdk-constants.js": function(module, exports, __webpack_require__) {
        "use strict";
        (function(module) {
            var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__, factory, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
                return typeof obj;
            } : function(obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };
            "undefined" != typeof self && self, factory = function() {
                return function(modules) {
                    var installedModules = {};
                    function __webpack_require__(moduleId) {
                        if (installedModules[moduleId]) return installedModules[moduleId].exports;
                        var module = installedModules[moduleId] = {
                            i: moduleId,
                            l: !1,
                            exports: {}
                        };
                        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
                        module.l = !0;
                        return module.exports;
                    }
                    __webpack_require__.m = modules;
                    __webpack_require__.c = installedModules;
                    __webpack_require__.d = function(exports, name, getter) {
                        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                            configurable: !1,
                            enumerable: !0,
                            get: getter
                        });
                    };
                    __webpack_require__.n = function(module) {
                        var getter = module && module.__esModule ? function() {
                            return module.default;
                        } : function() {
                            return module;
                        };
                        __webpack_require__.d(getter, "a", getter);
                        return getter;
                    };
                    __webpack_require__.o = function(object, property) {
                        return Object.prototype.hasOwnProperty.call(object, property);
                    };
                    __webpack_require__.p = "";
                    return __webpack_require__(__webpack_require__.s = "./src/index.js");
                }({
                    "./src/index.js": function(module, __webpack_exports__, __webpack_require__) {
                        Object.defineProperty(__webpack_exports__, "__esModule", {
                            value: !0
                        });
                        var _COUNTRY_LANGS, COUNTRY = {
                            AD: "AD",
                            AE: "AE",
                            AG: "AG",
                            AI: "AI",
                            AL: "AL",
                            AM: "AM",
                            AN: "AN",
                            AO: "AO",
                            AR: "AR",
                            AT: "AT",
                            AU: "AU",
                            AW: "AW",
                            AZ: "AZ",
                            BA: "BA",
                            BB: "BB",
                            BE: "BE",
                            BF: "BF",
                            BG: "BG",
                            BH: "BH",
                            BI: "BI",
                            BJ: "BJ",
                            BM: "BM",
                            BN: "BN",
                            BO: "BO",
                            BR: "BR",
                            BS: "BS",
                            BT: "BT",
                            BW: "BW",
                            BY: "BY",
                            BZ: "BZ",
                            CA: "CA",
                            CD: "CD",
                            CG: "CG",
                            CH: "CH",
                            CI: "CI",
                            CK: "CK",
                            CL: "CL",
                            CM: "CM",
                            CN: "CN",
                            CO: "CO",
                            CR: "CR",
                            CV: "CV",
                            CY: "CY",
                            CZ: "CZ",
                            DE: "DE",
                            DJ: "DJ",
                            DK: "DK",
                            DM: "DM",
                            DO: "DO",
                            DZ: "DZ",
                            EC: "EC",
                            EE: "EE",
                            EG: "EG",
                            ER: "ER",
                            ES: "ES",
                            ET: "ET",
                            FI: "FI",
                            FJ: "FJ",
                            FK: "FK",
                            FM: "FM",
                            FO: "FO",
                            FR: "FR",
                            GA: "GA",
                            GB: "GB",
                            GD: "GD",
                            GE: "GE",
                            GF: "GF",
                            GI: "GI",
                            GL: "GL",
                            GM: "GM",
                            GN: "GN",
                            GP: "GP",
                            GR: "GR",
                            GT: "GT",
                            GW: "GW",
                            GY: "GY",
                            HK: "HK",
                            HN: "HN",
                            HR: "HR",
                            HU: "HU",
                            ID: "ID",
                            IE: "IE",
                            IL: "IL",
                            IN: "IN",
                            IS: "IS",
                            IT: "IT",
                            JM: "JM",
                            JO: "JO",
                            JP: "JP",
                            KE: "KE",
                            KG: "KG",
                            KH: "KH",
                            KI: "KI",
                            KM: "KM",
                            KN: "KN",
                            KR: "KR",
                            KW: "KW",
                            KY: "KY",
                            KZ: "KZ",
                            LA: "LA",
                            LC: "LC",
                            LI: "LI",
                            LK: "LK",
                            LS: "LS",
                            LT: "LT",
                            LU: "LU",
                            LV: "LV",
                            MA: "MA",
                            MC: "MC",
                            MD: "MD",
                            ME: "ME",
                            MG: "MG",
                            MH: "MH",
                            MK: "MK",
                            ML: "ML",
                            MN: "MN",
                            MQ: "MQ",
                            MR: "MR",
                            MS: "MS",
                            MT: "MT",
                            MU: "MU",
                            MV: "MV",
                            MW: "MW",
                            MX: "MX",
                            MY: "MY",
                            MZ: "MZ",
                            NA: "NA",
                            NC: "NC",
                            NE: "NE",
                            NF: "NF",
                            NG: "NG",
                            NI: "NI",
                            NL: "NL",
                            NO: "NO",
                            NP: "NP",
                            NR: "NR",
                            NU: "NU",
                            NZ: "NZ",
                            OM: "OM",
                            PA: "PA",
                            PE: "PE",
                            PF: "PF",
                            PG: "PG",
                            PH: "PH",
                            PL: "PL",
                            PM: "PM",
                            PN: "PN",
                            PT: "PT",
                            PW: "PW",
                            PY: "PY",
                            QA: "QA",
                            RE: "RE",
                            RO: "RO",
                            RS: "RS",
                            RU: "RU",
                            RW: "RW",
                            SA: "SA",
                            SB: "SB",
                            SC: "SC",
                            SE: "SE",
                            SG: "SG",
                            SH: "SH",
                            SI: "SI",
                            SJ: "SJ",
                            SK: "SK",
                            SL: "SL",
                            SM: "SM",
                            SN: "SN",
                            SO: "SO",
                            SR: "SR",
                            ST: "ST",
                            SV: "SV",
                            SZ: "SZ",
                            TC: "TC",
                            TD: "TD",
                            TG: "TG",
                            TH: "TH",
                            TJ: "TJ",
                            TM: "TM",
                            TN: "TN",
                            TO: "TO",
                            TR: "TR",
                            TT: "TT",
                            TV: "TV",
                            TW: "TW",
                            TZ: "TZ",
                            UA: "UA",
                            UG: "UG",
                            US: "US",
                            UY: "UY",
                            VA: "VA",
                            VC: "VC",
                            VE: "VE",
                            VG: "VG",
                            VN: "VN",
                            VU: "VU",
                            WF: "WF",
                            WS: "WS",
                            YE: "YE",
                            YT: "YT",
                            ZA: "ZA",
                            ZM: "ZM",
                            ZW: "ZW"
                        }, LANG = {
                            AR: "ar",
                            CS: "cs",
                            DA: "da",
                            DE: "de",
                            EL: "el",
                            EN: "en",
                            ES: "es",
                            FI: "fi",
                            FR: "fr",
                            HE: "he",
                            HU: "hu",
                            ID: "id",
                            IT: "it",
                            JA: "ja",
                            KO: "ko",
                            NL: "nl",
                            NO: "no",
                            PL: "pl",
                            PT: "pt",
                            RU: "ru",
                            SK: "sk",
                            SV: "sv",
                            TH: "th",
                            TR: "tr",
                            ZH: "zh"
                        }, COUNTRY_LANGS = ((_COUNTRY_LANGS = {})[COUNTRY.AD] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.AE] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH, LANG.AR ], _COUNTRY_LANGS[COUNTRY.AG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.AI] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.AL] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.AM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.AN] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.AO] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.AR] = [ LANG.ES, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.AT] = [ LANG.DE, LANG.EN ], _COUNTRY_LANGS[COUNTRY.AU] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.AW] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.AZ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.BA] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.BB] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.BE] = [ LANG.EN, LANG.NL, LANG.FR ], _COUNTRY_LANGS[COUNTRY.BF] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.BG] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.BH] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.BI] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.BJ] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.BM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.BN] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.BO] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.BR] = [ LANG.PT, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.BS] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.BT] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.BW] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.BY] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.BZ] = [ LANG.EN, LANG.ES, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.CA] = [ LANG.EN, LANG.FR ], 
                        _COUNTRY_LANGS[COUNTRY.CD] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.CG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.CH] = [ LANG.DE, LANG.FR, LANG.EN ], _COUNTRY_LANGS[COUNTRY.CI] = [ LANG.FR, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.CK] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.CL] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.CM] = [ LANG.FR, LANG.EN ], _COUNTRY_LANGS[COUNTRY.CN] = [ LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.CO] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.CR] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.CV] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.CY] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.CZ] = [ LANG.CS, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.DE] = [ LANG.DE, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.DJ] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.DK] = [ LANG.DA, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.DM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.DO] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.DZ] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.EC] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.EE] = [ LANG.EN, LANG.RU, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.EG] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.ER] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.ES] = [ LANG.ES, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.ET] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.FI] = [ LANG.FI, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.FJ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.FK] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.FM] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.FO] = [ LANG.DA, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.FR] = [ LANG.FR, LANG.EN ], _COUNTRY_LANGS[COUNTRY.GA] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GB] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.GD] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GE] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.GF] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GI] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.GL] = [ LANG.DA, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.GN] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GP] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.GR] = [ LANG.EL, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GT] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.GW] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.GY] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.HK] = [ LANG.EN, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.HN] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.HR] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.HU] = [ LANG.HU, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.ID] = [ LANG.ID, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.IE] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.IL] = [ LANG.HE, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.IN] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.IS] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.IT] = [ LANG.IT, LANG.EN ], _COUNTRY_LANGS[COUNTRY.JM] = [ LANG.EN, LANG.ES, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.JO] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.JP] = [ LANG.JA, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.KE] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.KG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.KH] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.KI] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.KM] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.KN] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.KR] = [ LANG.KO, LANG.EN ], _COUNTRY_LANGS[COUNTRY.KW] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.KY] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.KZ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.LA] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.LC] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.LI] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.LK] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.LS] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.LT] = [ LANG.EN, LANG.RU, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.LU] = [ LANG.EN, LANG.DE, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.LV] = [ LANG.EN, LANG.RU, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MA] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.MC] = [ LANG.FR, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.MD] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.ME] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.MG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.MH] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MK] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.ML] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MN] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.MQ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MR] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.MS] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MT] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.MU] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MV] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.MW] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.MX] = [ LANG.ES, LANG.EN ], _COUNTRY_LANGS[COUNTRY.MY] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.MZ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.NA] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.NC] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.NE] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.NF] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.NG] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.NI] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.NL] = [ LANG.NL, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.NO] = [ LANG.NO, LANG.EN ], _COUNTRY_LANGS[COUNTRY.NP] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.NR] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.NU] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.NZ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.OM] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.PA] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.PE] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.PF] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.PG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.PH] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.PL] = [ LANG.PL, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.PM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.PN] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.PT] = [ LANG.PT, LANG.EN ], _COUNTRY_LANGS[COUNTRY.PW] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.PY] = [ LANG.ES, LANG.EN ], _COUNTRY_LANGS[COUNTRY.QA] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH, LANG.AR ], 
                        _COUNTRY_LANGS[COUNTRY.RE] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.RO] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.RS] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.RU] = [ LANG.RU, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.RW] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SA] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SB] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SC] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SE] = [ LANG.SV, LANG.EN ], _COUNTRY_LANGS[COUNTRY.SG] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.SH] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SI] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SJ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SK] = [ LANG.SK, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SL] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SN] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SO] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SR] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.ST] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.SV] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.SZ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.TC] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.TD] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.TG] = [ LANG.FR, LANG.EN, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.TH] = [ LANG.TH, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.TJ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.TM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.TN] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.TO] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.TR] = [ LANG.TR, LANG.EN ], _COUNTRY_LANGS[COUNTRY.TT] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.TV] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.TW] = [ LANG.ZH, LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.TZ] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.UA] = [ LANG.EN, LANG.RU, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.UG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.US] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.UY] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.VA] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.VC] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.VE] = [ LANG.ES, LANG.EN, LANG.FR, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.VG] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.VN] = [ LANG.EN ], 
                        _COUNTRY_LANGS[COUNTRY.VU] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.WF] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.WS] = [ LANG.EN ], _COUNTRY_LANGS[COUNTRY.YE] = [ LANG.AR, LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.YT] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.ZA] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], 
                        _COUNTRY_LANGS[COUNTRY.ZM] = [ LANG.EN, LANG.FR, LANG.ES, LANG.ZH ], _COUNTRY_LANGS[COUNTRY.ZW] = [ LANG.EN ], 
                        _COUNTRY_LANGS), SDK_SETTINGS = {
                            CLIENT_TOKEN: "data-client-token",
                            PARTNER_ATTRIBUTION_ID: "data-partner-attribution-id",
                            STAGE_HOST: "data-stage-host",
                            API_STAGE_HOST: "data-api-stage-host"
                        }, SDK_QUERY_KEYS = {
                            COMPONENTS: "components",
                            ENV: "env",
                            DEBUG: "debug",
                            CACHEBUST: "cachebust",
                            CLIENT_ID: "client-id",
                            MERCHANT_ID: "merchant-id",
                            LOCALE: "locale",
                            CURRENCY: "currency",
                            INTENT: "intent",
                            COMMIT: "commit",
                            VAULT: "vault",
                            BUYER_COUNTRY: "buyer-country",
                            DISABLE_FUNDING: "disable-funding",
                            DISABLE_CARD: "disable-card",
                            LOCALE_COUNTRY: "locale-country",
                            LOCALE_LANG: "locale-lang",
                            ORDER_CURRENCY: "order-currency",
                            ORDER_INTENT: "order-intent",
                            ORDER_COMMIT: "order-commit",
                            ORDER_VAULT: "order-vault"
                        }, COMPONENTS = {
                            BUTTONS: "buttons",
                            HOSTED_FIELDS: "hosted-fields"
                        }, DEBUG = {
                            TRUE: !0,
                            FALSE: !1
                        }, QUERY_BOOL = {
                            TRUE: "true",
                            FALSE: "false"
                        }, ENV = {
                            LOCAL: "local",
                            STAGE: "stage",
                            SANDBOX: "sandbox",
                            PRODUCTION: "production",
                            TEST: "test"
                        }, FPTI_KEY = {
                            FEED: "feed_name",
                            STATE: "state_name",
                            TRANSITION: "transition_name",
                            BUTTON_TYPE: "button_type",
                            SESSION_UID: "page_session_id",
                            BUTTON_SESSION_UID: "button_session_id",
                            TOKEN: "token",
                            CONTEXT_ID: "context_id",
                            CONTEXT_TYPE: "context_type",
                            REFERER: "referer_url",
                            PAY_ID: "pay_id",
                            SELLER_ID: "seller_id",
                            CLIENT_ID: "client_id",
                            DATA_SOURCE: "serverside_data_source",
                            BUTTON_SOURCE: "button_source",
                            ERROR_CODE: "ext_error_code",
                            ERROR_DESC: "ext_error_desc",
                            PAGE_LOAD_TIME: "page_load_time",
                            EXPERIMENT_NAME: "pxp_exp_id",
                            TREATMENT_NAME: "pxp_trtmnt_id",
                            TRANSITION_TIME: "transition_time",
                            FUNDING_LIST: "eligible_payment_methods",
                            FUNDING_COUNT: "eligible_payment_count",
                            CHOSEN_FUNDING: "selected_payment_method",
                            BUTTON_LAYOUT: "button_layout",
                            VERSION: "checkoutjs_version",
                            LOCALE: "locale",
                            BUYER_COUNTRY: "buyer_cntry",
                            INTEGRATION_IDENTIFIER: "integration_identifier",
                            PARTNER_ATTRIBUTION_ID: "bn_code",
                            SDK_NAME: "sdk_name",
                            SDK_VERSION: "sdk_version",
                            USER_AGENT: "user_agent",
                            USER_ACTION: "user_action",
                            CONTEXT_CORRID: "context_correlation_id"
                        }, FPTI_USER_ACTION = {
                            COMMIT: "commit",
                            CONTINUE: "continue"
                        }, FPTI_DATA_SOURCE = {
                            PAYMENTS_SDK: "checkout"
                        }, FPTI_FEED = {
                            PAYMENTS_SDK: "payments_sdk"
                        }, FPTI_SDK_NAME = {
                            PAYMENTS_SDK: "payments_sdk"
                        }, INTENT = {
                            CAPTURE: "capture",
                            AUTHORIZE: "authorize",
                            ORDER: "order"
                        }, COMMIT = {
                            TRUE: !0,
                            FALSE: !1
                        }, VAULT = {
                            TRUE: !0,
                            FALSE: !1
                        }, CURRENCY = {
                            AUD: "AUD",
                            BRL: "BRL",
                            CAD: "CAD",
                            CZK: "CZK",
                            DKK: "DKK",
                            EUR: "EUR",
                            HKD: "HKD",
                            HUF: "HUF",
                            INR: "INR",
                            ILS: "ILS",
                            JPY: "JPY",
                            MYR: "MYR",
                            MXN: "MXN",
                            TWD: "TWD",
                            NZD: "NZD",
                            NOK: "NOK",
                            PHP: "PHP",
                            PLN: "PLN",
                            GBP: "GBP",
                            RUB: "RUB",
                            SGD: "SGD",
                            SEK: "SEK",
                            CHF: "CHF",
                            THB: "THB",
                            USD: "USD"
                        }, PLATFORM = {
                            DESKTOP: "desktop",
                            MOBILE: "mobile"
                        }, FUNDING = {
                            PAYPAL: "paypal",
                            VENMO: "venmo",
                            CREDIT: "credit",
                            CARD: "card",
                            IDEAL: "ideal",
                            SEPA: "sepa",
                            BANCONTACT: "bancontact",
                            GIROPAY: "giropay",
                            SOFORT: "sofort",
                            EPS: "eps",
                            MYBANK: "mybank",
                            P24: "p24",
                            ZIMPLER: "zimpler",
                            WECHATPAY: "wechatpay"
                        }, CARD = {
                            VISA: "visa",
                            MASTERCARD: "mastercard",
                            AMEX: "amex",
                            DISCOVER: "discover",
                            HIPER: "hiper",
                            ELO: "elo",
                            JCB: "jcb",
                            CUP: "cup"
                        }, DEFAULT_COUNTRY = COUNTRY.US, DEFAULT_CURRENCY = CURRENCY.USD, DEFAULT_INTENT = INTENT.CAPTURE, DEFAULT_COMMIT = COMMIT.TRUE, DEFAULT_VAULT = VAULT.FALSE, DEFAULT_COMPONENTS = COMPONENTS.BUTTONS, DEFAULT_DEBUG = DEBUG.FALSE;
                        __webpack_require__.d(__webpack_exports__, "COUNTRY", function() {
                            return COUNTRY;
                        });
                        __webpack_require__.d(__webpack_exports__, "LANG", function() {
                            return LANG;
                        });
                        __webpack_require__.d(__webpack_exports__, "COUNTRY_LANGS", function() {
                            return COUNTRY_LANGS;
                        });
                        __webpack_require__.d(__webpack_exports__, "SDK_PATH", function() {
                            return "/sdk/js";
                        });
                        __webpack_require__.d(__webpack_exports__, "SDK_SETTINGS", function() {
                            return SDK_SETTINGS;
                        });
                        __webpack_require__.d(__webpack_exports__, "SDK_QUERY_KEYS", function() {
                            return SDK_QUERY_KEYS;
                        });
                        __webpack_require__.d(__webpack_exports__, "COMPONENTS", function() {
                            return COMPONENTS;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEBUG", function() {
                            return DEBUG;
                        });
                        __webpack_require__.d(__webpack_exports__, "QUERY_BOOL", function() {
                            return QUERY_BOOL;
                        });
                        __webpack_require__.d(__webpack_exports__, "ENV", function() {
                            return ENV;
                        });
                        __webpack_require__.d(__webpack_exports__, "FPTI_KEY", function() {
                            return FPTI_KEY;
                        });
                        __webpack_require__.d(__webpack_exports__, "FPTI_USER_ACTION", function() {
                            return FPTI_USER_ACTION;
                        });
                        __webpack_require__.d(__webpack_exports__, "FPTI_DATA_SOURCE", function() {
                            return FPTI_DATA_SOURCE;
                        });
                        __webpack_require__.d(__webpack_exports__, "FPTI_FEED", function() {
                            return FPTI_FEED;
                        });
                        __webpack_require__.d(__webpack_exports__, "FPTI_SDK_NAME", function() {
                            return FPTI_SDK_NAME;
                        });
                        __webpack_require__.d(__webpack_exports__, "INTENT", function() {
                            return INTENT;
                        });
                        __webpack_require__.d(__webpack_exports__, "COMMIT", function() {
                            return COMMIT;
                        });
                        __webpack_require__.d(__webpack_exports__, "VAULT", function() {
                            return VAULT;
                        });
                        __webpack_require__.d(__webpack_exports__, "CURRENCY", function() {
                            return CURRENCY;
                        });
                        __webpack_require__.d(__webpack_exports__, "PLATFORM", function() {
                            return PLATFORM;
                        });
                        __webpack_require__.d(__webpack_exports__, "FUNDING", function() {
                            return FUNDING;
                        });
                        __webpack_require__.d(__webpack_exports__, "CARD", function() {
                            return CARD;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_COUNTRY", function() {
                            return DEFAULT_COUNTRY;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_CURRENCY", function() {
                            return DEFAULT_CURRENCY;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_INTENT", function() {
                            return DEFAULT_INTENT;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_COMMIT", function() {
                            return DEFAULT_COMMIT;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_VAULT", function() {
                            return DEFAULT_VAULT;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_COMPONENTS", function() {
                            return DEFAULT_COMPONENTS;
                        });
                        __webpack_require__.d(__webpack_exports__, "DEFAULT_DEBUG", function() {
                            return DEFAULT_DEBUG;
                        });
                    }
                });
            }, "object" == _typeof(exports) && "object" == _typeof(module) ? module.exports = factory() : (__WEBPACK_AMD_DEFINE_ARRAY__ = [], 
            void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        }).call(exports, __webpack_require__("./node_modules/webpack/buildin/module.js")(module));
    },
    "./node_modules/paypal-sdk-constants/index.js": function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__("./node_modules/paypal-sdk-constants/dist/paypal-sdk-constants.js");
    },
    "./node_modules/webpack/buildin/module.js": function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = function(module) {
            if (!module.webpackPolyfill) {
                module.deprecate = function() {};
                module.paths = [];
                module.children || (module.children = []);
                Object.defineProperty(module, "loaded", {
                    enumerable: !0,
                    get: function() {
                        return module.l;
                    }
                });
                Object.defineProperty(module, "id", {
                    enumerable: !0,
                    get: function() {
                        return module.i;
                    }
                });
                module.webpackPolyfill = 1;
            }
            return module;
        };
    },
    "./node_modules/whatwg-fetch/fetch.js": function(module, exports, __webpack_require__) {
        "use strict";
        !function(self) {
            if (!self.fetch) {
                var support = {
                    searchParams: "URLSearchParams" in self,
                    iterable: "Symbol" in self && "iterator" in Symbol,
                    blob: "FileReader" in self && "Blob" in self && function() {
                        try {
                            new Blob();
                            return !0;
                        } catch (e) {
                            return !1;
                        }
                    }(),
                    formData: "FormData" in self,
                    arrayBuffer: "ArrayBuffer" in self
                };
                if (support.arrayBuffer) var viewClasses = [ "[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]" ], isDataView = function(obj) {
                    return obj && DataView.prototype.isPrototypeOf(obj);
                }, isArrayBufferView = ArrayBuffer.isView || function(obj) {
                    return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
                };
                Headers.prototype.append = function(name, value) {
                    name = normalizeName(name);
                    value = normalizeValue(value);
                    var oldValue = this.map[name];
                    this.map[name] = oldValue ? oldValue + "," + value : value;
                };
                Headers.prototype.delete = function(name) {
                    delete this.map[normalizeName(name)];
                };
                Headers.prototype.get = function(name) {
                    name = normalizeName(name);
                    return this.has(name) ? this.map[name] : null;
                };
                Headers.prototype.has = function(name) {
                    return this.map.hasOwnProperty(normalizeName(name));
                };
                Headers.prototype.set = function(name, value) {
                    this.map[normalizeName(name)] = normalizeValue(value);
                };
                Headers.prototype.forEach = function(callback, thisArg) {
                    for (var name in this.map) this.map.hasOwnProperty(name) && callback.call(thisArg, this.map[name], name, this);
                };
                Headers.prototype.keys = function() {
                    var items = [];
                    this.forEach(function(value, name) {
                        items.push(name);
                    });
                    return iteratorFor(items);
                };
                Headers.prototype.values = function() {
                    var items = [];
                    this.forEach(function(value) {
                        items.push(value);
                    });
                    return iteratorFor(items);
                };
                Headers.prototype.entries = function() {
                    var items = [];
                    this.forEach(function(value, name) {
                        items.push([ name, value ]);
                    });
                    return iteratorFor(items);
                };
                support.iterable && (Headers.prototype[Symbol.iterator] = Headers.prototype.entries);
                var methods = [ "DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT" ];
                Request.prototype.clone = function() {
                    return new Request(this, {
                        body: this._bodyInit
                    });
                };
                Body.call(Request.prototype);
                Body.call(Response.prototype);
                Response.prototype.clone = function() {
                    return new Response(this._bodyInit, {
                        status: this.status,
                        statusText: this.statusText,
                        headers: new Headers(this.headers),
                        url: this.url
                    });
                };
                Response.error = function() {
                    var response = new Response(null, {
                        status: 0,
                        statusText: ""
                    });
                    response.type = "error";
                    return response;
                };
                var redirectStatuses = [ 301, 302, 303, 307, 308 ];
                Response.redirect = function(url, status) {
                    if (-1 === redirectStatuses.indexOf(status)) throw new RangeError("Invalid status code");
                    return new Response(null, {
                        status: status,
                        headers: {
                            location: url
                        }
                    });
                };
                self.Headers = Headers;
                self.Request = Request;
                self.Response = Response;
                self.fetch = function(input, init) {
                    return new Promise(function(resolve, reject) {
                        var request = new Request(input, init), xhr = new XMLHttpRequest();
                        xhr.onload = function() {
                            var options = {
                                status: xhr.status,
                                statusText: xhr.statusText,
                                headers: function(rawHeaders) {
                                    var headers = new Headers();
                                    rawHeaders.replace(/\r?\n[\t ]+/g, " ").split(/\r?\n/).forEach(function(line) {
                                        var parts = line.split(":"), key = parts.shift().trim();
                                        if (key) {
                                            var value = parts.join(":").trim();
                                            headers.append(key, value);
                                        }
                                    });
                                    return headers;
                                }(xhr.getAllResponseHeaders() || "")
                            };
                            options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
                            var body = "response" in xhr ? xhr.response : xhr.responseText;
                            resolve(new Response(body, options));
                        };
                        xhr.onerror = function() {
                            reject(new TypeError("Network request failed"));
                        };
                        xhr.ontimeout = function() {
                            reject(new TypeError("Network request failed"));
                        };
                        xhr.open(request.method, request.url, !0);
                        "include" === request.credentials ? xhr.withCredentials = !0 : "omit" === request.credentials && (xhr.withCredentials = !1);
                        "responseType" in xhr && support.blob && (xhr.responseType = "blob");
                        request.headers.forEach(function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });
                        xhr.send(void 0 === request._bodyInit ? null : request._bodyInit);
                    });
                };
                self.fetch.polyfill = !0;
            }
            function normalizeName(name) {
                "string" != typeof name && (name = String(name));
                if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) throw new TypeError("Invalid character in header field name");
                return name.toLowerCase();
            }
            function normalizeValue(value) {
                "string" != typeof value && (value = String(value));
                return value;
            }
            function iteratorFor(items) {
                var iterator = {
                    next: function() {
                        var value = items.shift();
                        return {
                            done: void 0 === value,
                            value: value
                        };
                    }
                };
                support.iterable && (iterator[Symbol.iterator] = function() {
                    return iterator;
                });
                return iterator;
            }
            function Headers(headers) {
                this.map = {};
                headers instanceof Headers ? headers.forEach(function(value, name) {
                    this.append(name, value);
                }, this) : Array.isArray(headers) ? headers.forEach(function(header) {
                    this.append(header[0], header[1]);
                }, this) : headers && Object.getOwnPropertyNames(headers).forEach(function(name) {
                    this.append(name, headers[name]);
                }, this);
            }
            function consumed(body) {
                if (body.bodyUsed) return Promise.reject(new TypeError("Already read"));
                body.bodyUsed = !0;
            }
            function fileReaderReady(reader) {
                return new Promise(function(resolve, reject) {
                    reader.onload = function() {
                        resolve(reader.result);
                    };
                    reader.onerror = function() {
                        reject(reader.error);
                    };
                });
            }
            function readBlobAsArrayBuffer(blob) {
                var reader = new FileReader(), promise = fileReaderReady(reader);
                reader.readAsArrayBuffer(blob);
                return promise;
            }
            function bufferClone(buf) {
                if (buf.slice) return buf.slice(0);
                var view = new Uint8Array(buf.byteLength);
                view.set(new Uint8Array(buf));
                return view.buffer;
            }
            function Body() {
                this.bodyUsed = !1;
                this._initBody = function(body) {
                    this._bodyInit = body;
                    if (body) if ("string" == typeof body) this._bodyText = body; else if (support.blob && Blob.prototype.isPrototypeOf(body)) this._bodyBlob = body; else if (support.formData && FormData.prototype.isPrototypeOf(body)) this._bodyFormData = body; else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) this._bodyText = body.toString(); else if (support.arrayBuffer && support.blob && isDataView(body)) {
                        this._bodyArrayBuffer = bufferClone(body.buffer);
                        this._bodyInit = new Blob([ this._bodyArrayBuffer ]);
                    } else {
                        if (!support.arrayBuffer || !ArrayBuffer.prototype.isPrototypeOf(body) && !isArrayBufferView(body)) throw new Error("unsupported BodyInit type");
                        this._bodyArrayBuffer = bufferClone(body);
                    } else this._bodyText = "";
                    this.headers.get("content-type") || ("string" == typeof body ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : support.searchParams && URLSearchParams.prototype.isPrototypeOf(body) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"));
                };
                if (support.blob) {
                    this.blob = function() {
                        var rejected = consumed(this);
                        if (rejected) return rejected;
                        if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
                        if (this._bodyArrayBuffer) return Promise.resolve(new Blob([ this._bodyArrayBuffer ]));
                        if (this._bodyFormData) throw new Error("could not read FormData body as blob");
                        return Promise.resolve(new Blob([ this._bodyText ]));
                    };
                    this.arrayBuffer = function() {
                        return this._bodyArrayBuffer ? consumed(this) || Promise.resolve(this._bodyArrayBuffer) : this.blob().then(readBlobAsArrayBuffer);
                    };
                }
                this.text = function() {
                    var rejected = consumed(this);
                    if (rejected) return rejected;
                    if (this._bodyBlob) return function(blob) {
                        var reader = new FileReader(), promise = fileReaderReady(reader);
                        reader.readAsText(blob);
                        return promise;
                    }(this._bodyBlob);
                    if (this._bodyArrayBuffer) return Promise.resolve(function(buf) {
                        for (var view = new Uint8Array(buf), chars = new Array(view.length), i = 0; i < view.length; i++) chars[i] = String.fromCharCode(view[i]);
                        return chars.join("");
                    }(this._bodyArrayBuffer));
                    if (this._bodyFormData) throw new Error("could not read FormData body as text");
                    return Promise.resolve(this._bodyText);
                };
                support.formData && (this.formData = function() {
                    return this.text().then(decode);
                });
                this.json = function() {
                    return this.text().then(JSON.parse);
                };
                return this;
            }
            function Request(input, options) {
                var method, upcased, body = (options = options || {}).body;
                if (input instanceof Request) {
                    if (input.bodyUsed) throw new TypeError("Already read");
                    this.url = input.url;
                    this.credentials = input.credentials;
                    options.headers || (this.headers = new Headers(input.headers));
                    this.method = input.method;
                    this.mode = input.mode;
                    if (!body && null != input._bodyInit) {
                        body = input._bodyInit;
                        input.bodyUsed = !0;
                    }
                } else this.url = String(input);
                this.credentials = options.credentials || this.credentials || "omit";
                !options.headers && this.headers || (this.headers = new Headers(options.headers));
                this.method = (method = options.method || this.method || "GET", upcased = method.toUpperCase(), 
                methods.indexOf(upcased) > -1 ? upcased : method);
                this.mode = options.mode || this.mode || null;
                this.referrer = null;
                if (("GET" === this.method || "HEAD" === this.method) && body) throw new TypeError("Body not allowed for GET or HEAD requests");
                this._initBody(body);
            }
            function decode(body) {
                var form = new FormData();
                body.trim().split("&").forEach(function(bytes) {
                    if (bytes) {
                        var split = bytes.split("="), name = split.shift().replace(/\+/g, " "), value = split.join("=").replace(/\+/g, " ");
                        form.append(decodeURIComponent(name), decodeURIComponent(value));
                    }
                });
                return form;
            }
            function Response(bodyInit, options) {
                options || (options = {});
                this.type = "default";
                this.status = void 0 === options.status ? 200 : options.status;
                this.ok = this.status >= 200 && this.status < 300;
                this.statusText = "statusText" in options ? options.statusText : "OK";
                this.headers = new Headers(options.headers);
                this.url = options.url || "";
                this._initBody(bodyInit);
            }
        }("undefined" != typeof self ? self : void 0);
    },
    "./public/js/button/api.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.$buttonFundingApi = exports.$localeApi = exports.$orderApi = exports.$paymentApi = exports.$checkoutSessionApi = exports.$checkoutCartApi = exports.$checkoutAppDataApi = exports.$authApi = void 0;
        exports.getLocale = getLocale;
        exports.getAuth = function() {
            return $authApi.retrieve().then(function(res) {
                return res.data;
            });
        };
        exports.getButtonFunding = function() {
            return getLocale().then(function(locale) {
                return $buttonFundingApi.retrieve({
                    params: {
                        country: locale.country,
                        domain: window && window.xprops && window.xprops.domain,
                        buttonSessionID: window && window.xprops && window.xprops.buttonSessionID,
                        remembered: window && window.xprops && window.xprops.funding && window.xprops.funding.remembered && window.xprops.funding.remembered.join(),
                        allowed: window && window.xprops && window.xprops.funding && window.xprops.funding.allowed && window.xprops.funding.allowed.join()
                    }
                }).then(function(res) {
                    return res.data;
                });
            });
        };
        exports.getPayment = function(paymentID) {
            return $paymentApi.retrieve({
                model: {
                    id: paymentID
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Get payment failed");
                return res.data;
            });
        };
        exports.patchPayment = function(paymentID, patch) {
            return $paymentApi.action("patch", {
                model: {
                    id: paymentID
                },
                data: {
                    patch: patch
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Patch payment failed");
                return res.data;
            });
        };
        exports.executePayment = function(paymentID, payerID) {
            return $paymentApi.action("execute", {
                model: {
                    id: paymentID
                },
                data: {
                    payer_id: payerID
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Execute payment failed");
                return res.data;
            });
        };
        exports.getOrder = function(orderID) {
            return $orderApi.retrieve({
                model: {
                    id: orderID
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Get order failed");
                return res.data;
            });
        };
        exports.captureOrder = function(orderID) {
            return $orderApi.action("capture", {
                model: {
                    id: orderID
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Capture order failed");
                return res.data;
            });
        };
        exports.authorizeOrder = function(orderID) {
            return $orderApi.action("authorize", {
                model: {
                    id: orderID
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Authorize order failed");
                return res.data;
            });
        };
        exports.patchOrder = function(orderID, patch) {
            return $orderApi.action("patch", {
                model: {
                    id: orderID
                },
                data: {
                    patch: patch
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Patch order failed");
                return res.data;
            });
        };
        exports.mapToToken = mapToToken;
        exports.getCheckoutAppData = function(token) {
            return $checkoutAppDataApi.retrieve({
                model: {
                    id: token
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Get payment failed");
                return res.data;
            });
        };
        exports.getCheckoutCart = function(token) {
            return $checkoutCartApi.retrieve({
                model: {
                    id: token
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Get payment failed");
                return res.data;
            });
        };
        exports.callGraphQL = callGraphQL;
        exports.normalizeECToken = normalizeECToken;
        exports.updateClientConfig = function(_ref) {
            var paymentToken = _ref.paymentToken, fundingSource = _ref.fundingSource, integrationArtifact = _ref.integrationArtifact, userExperienceFlow = _ref.userExperienceFlow, productFlow = _ref.productFlow;
            return normalizeECToken(paymentToken).then(function(normalizedToken) {
                return callGraphQL("\n            mutation UpdateClientConfig(\n                $paymentToken : String!,\n                $fundingSource : ButtonFundingSourceType!,\n                $integrationArtifact : IntegrationArtifactType!,\n                $userExperienceFlow : UserExperienceFlowType!,\n                $productFlow : ProductFlowType!\n            ) {\n                updateClientConfig(\n                    token: $paymentToken,\n                    fundingSource: $fundingSource,\n                    integrationArtifact: $integrationArtifact,\n                    userExperienceFlow: $userExperienceFlow,\n                    productFlow: $productFlow\n                )\n            }\n        ", {
                    paymentToken: normalizedToken,
                    fundingSource: fundingSource,
                    integrationArtifact: integrationArtifact,
                    userExperienceFlow: userExperienceFlow,
                    productFlow: productFlow
                });
            });
        };
        var _api = __webpack_require__("./bower_modules/squid-core/dist/api.js"), _util = __webpack_require__("./bower_modules/squid-core/dist/util.js"), _config = __webpack_require__("./bower_modules/squid-core/dist/config.js"), _config2 = __webpack_require__("./public/js/button/config.js"), $authApi = exports.$authApi = new _api.$Api({
            uri: "/api/auth"
        }), $checkoutAppDataApi = exports.$checkoutAppDataApi = new _api.$Api({
            uri: "/api/checkout/:id/appData"
        }), $checkoutCartApi = exports.$checkoutCartApi = new _api.$Api({
            uri: "/api/checkout/:id/cart"
        }), $paymentApi = (exports.$checkoutSessionApi = new _api.$Api({
            uri: "/api/checkout/:id/session"
        }), exports.$paymentApi = new _api.$Api({
            uri: "/api/payment/:id"
        })), $orderApi = exports.$orderApi = new _api.$Api({
            uri: "/api/order/:id"
        }), $localeApi = exports.$localeApi = new _api.$Api({
            uri: "/api/locale"
        }), $buttonFundingApi = exports.$buttonFundingApi = new _api.$Api({
            uri: "/api/button/funding"
        });
        function getLocale() {
            return $localeApi.retrieve({
                params: {
                    ipCountry: _config.$meta.ipcountry,
                    localeTestUrlParam: _util.$util.param("locale.test"),
                    countryParam: _util.$util.param("country.x"),
                    localeParam: _util.$util.param("locale.x")
                }
            }).then(function(res) {
                return res.data;
            });
        }
        function mapToToken(id) {
            return $paymentApi.action("ectoken", {
                model: {
                    id: id
                }
            }).then(function(res) {
                if ("success" !== res.ack) throw new Error("Map payment failed");
                return res.data.token;
            });
        }
        function callGraphQL(query, variables) {
            return window.paypal.request({
                url: _config2.API_URI.GRAPHQL,
                method: "POST",
                json: {
                    query: query,
                    variables: variables
                }
            }).then(function(body) {
                var errors = (body.errors || []).filter(function(error) {
                    return "ACCOUNT_CANNOT_BE_FETCHED" !== error.message;
                });
                if (errors.length) {
                    var message = errors[0].message || JSON.stringify(errors[0]);
                    throw new Error(message);
                }
                return body;
            });
        }
        function normalizeECToken(id) {
            return window.paypal.Promise.try(function() {
                return 0 === id.indexOf("PAY-") || 0 === id.indexOf("PAYID-") || 0 === id.indexOf("BA-") ? mapToToken(id) : id;
            });
        }
    },
    "./public/js/button/button.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.setupButton = setupButton;
        exports.setup = function() {
            if (!(window.paypal || window.name && -1 !== window.name.indexOf("xcomponent__ppbutton"))) return;
            return window.paypal.Promise.try(function() {
                return setupButton();
            }).catch(function(err) {
                window.paypal.logger.error("xo_buttonjs_bootstrap_err", {
                    err: err.stack ? err.stack : err.toString()
                });
            });
        };
        var obj, _paypalSdkConstants = __webpack_require__("./node_modules/paypal-sdk-constants/index.js"), _inlineGuest = __webpack_require__("./public/js/inlineGuest/index.js"), _get = __webpack_require__("./button/util/get.js"), _lightbox = __webpack_require__("./public/js/button/lightbox.js"), _locale = __webpack_require__("./public/js/button/locale.js"), _util = __webpack_require__("./public/js/button/util.js"), _checkout = __webpack_require__("./public/js/button/checkout.js"), _api = __webpack_require__("./public/js/button/api.js"), _attachClickEvent = __webpack_require__("./public/js/button/util/attachClickEvent.js"), _paymentRequest = __webpack_require__("./public/js/button/paymentRequest.js"), _promise = __webpack_require__("./public/js/button/promise.js"), _promiseRetry = __webpack_require__("./public/js/button/promiseRetry.js"), _promiseRetry2 = (obj = _promiseRetry) && obj.__esModule ? obj : {
            default: obj
        }, _logger = __webpack_require__("./public/js/button/logger.js");
        var buttonEnabled = !0;
        function clickButton(event, _ref) {
            var _ref$fundingSource = _ref.fundingSource, fundingSource = void 0 === _ref$fundingSource ? _paypalSdkConstants.FUNDING.PAYPAL : _ref$fundingSource, card = _ref.card;
            event.preventDefault();
            event.stopPropagation();
            window.xprops.onClick && window.xprops.onClick({
                fundingSource: fundingSource,
                card: card
            });
            if (buttonEnabled) {
                var buttonEl = event.currentTarget, buttonSize = buttonEl.getAttribute("data-size"), buttonLayout = buttonEl.getAttribute("data-layout"), buttonsContainer = document.getElementById("paypal-animation-container");
                if (!(0, _inlineGuest.shouldEnableInlineGuest)(buttonEl, buttonsContainer)) return (0, 
                _checkout.renderCheckout)({
                    fundingSource: fundingSource
                });
                if (card || fundingSource === _paypalSdkConstants.FUNDING.CARD) {
                    if (card === _paypalSdkConstants.CARD.CUP) {
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.CARD_FORM_COLLAPSE
                        });
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.CARD_FORM_CLEAR
                        });
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.BUTTONS_RESET
                        });
                        return (0, _checkout.renderCheckout)({
                            fundingSource: fundingSource
                        });
                    }
                    var _getState = (0, _inlineGuest.getState)(), currentCardType = _getState.currentCardType, isZomboRendered = _getState.isZomboRendered;
                    if (!card) return;
                    if ((0, _inlineGuest.isSubmitting)()) return;
                    if (currentCardType !== card) {
                        (0, _inlineGuest.changeCardTypeTo)(card);
                        !currentCardType && (0, _inlineGuest.expand)();
                        (0, _inlineGuest.dispatch)(_inlineGuest.clearFormAction);
                    }
                    if (isZomboRendered) return;
                    return window.xprops.payment().then(function(paymentToken) {
                        return (0, _promiseRetry2.default)(function() {
                            return (0, _paymentRequest.guestEligibilityCheck)({
                                token: paymentToken
                            });
                        }).then(function(res) {
                            return (0, _get.get)(res, "data.checkoutSession.flags", {});
                        }).then(function(_ref2) {
                            var isHostedFieldsAllowed = _ref2.isHostedFieldsAllowed;
                            (0, _logger.track)({
                                state_name: "checkoutjs_inline_guest",
                                transition_name: "process_checking_inline_guest_eligibility",
                                inline_guest_enabled: isHostedFieldsAllowed ? 1 : 0
                            });
                            (0, _logger.info)("inline_guest_eligibility", JSON.stringify({
                                inlineGuestEnable: isHostedFieldsAllowed,
                                isInlneGuestCookied: _inlineGuest.isZomboCookieEnabled,
                                spbLayout: buttonLayout,
                                spbSize: buttonSize,
                                inlineGuestPXP: (0, _inlineGuest.inlineGuestPXPEnabled)()
                            }));
                            (0, _logger.flush)();
                            var state = (0, _inlineGuest.getState)();
                            if (isHostedFieldsAllowed) {
                                if (!state.isZomboRendered) {
                                    (0, _inlineGuest.setState)({
                                        isZomboRendered: !0
                                    });
                                    var treatments = (0, _get.get)(window.pre, "inlineGuest.res.data.treatments") || [];
                                    (0, _logger.track)({
                                        state_name: "checkoutjs_inline_guest",
                                        transition_name: "process_pxp_checkoutjs_inline_guest",
                                        pxp_trtmnt_id: treatments.map(function(t) {
                                            return t.treatment_id;
                                        }).join(":"),
                                        pxp_exp_id: treatments.map(function(t) {
                                            return t.experiment_id;
                                        }).join(":")
                                    });
                                    (0, _logger.info)("inline_guest_checkoutjs_render_inline_guest");
                                    (0, _logger.flush)();
                                    return (0, _inlineGuest.renderCardExperience)({
                                        token: paymentToken,
                                        card: card,
                                        onEvent: _inlineGuest.onEvent,
                                        getState: _inlineGuest.getState
                                    });
                                }
                            } else {
                                (0, _logger.info)("inline_guest_checkoutjs_render_go_to_xoon_button");
                                (0, _inlineGuest.renderGoToXoon)({
                                    paymentToken: paymentToken
                                });
                            }
                        });
                    }).catch(function(err) {
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.CARD_FORM_COLLAPSE
                        });
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.CARD_FORM_CLEAR
                        });
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.BUTTONS_RESET
                        });
                        (0, _logger.error)("inline_guest_buttonjs_init_error", {
                            err: err.stack ? err.stack : err.toString()
                        });
                        window.xprops.onError(err);
                    });
                }
                return (0, _checkout.renderCheckout)({
                    fundingSource: fundingSource
                });
            }
        }
        function setupButton() {
            if (!window.name || 0 !== window.name.indexOf("__prerender")) {
                (0, _promise.usePayPalPromise)();
                (0, _util.querySelectorAll)("#paypal-other-options").forEach(function(button) {
                    (0, _attachClickEvent.attachClickEventToElement)(button, function() {
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.CARD_FORM_COLLAPSE
                        });
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.CARD_FORM_CLEAR
                        });
                        (0, _inlineGuest.onEvent)({
                            type: _inlineGuest.ACTIONS.BUTTONS_RESET
                        });
                    });
                });
                (0, _util.querySelectorAll)(".paypal-button").forEach(function(button) {
                    (0, _attachClickEvent.attachClickEventToElement)(button, function(event) {
                        return clickButton(event, {
                            fundingSource: button.getAttribute("data-funding-source")
                        });
                    });
                });
                (0, _util.querySelectorAll)(".paypal-button-card").forEach(function(button) {
                    (0, _attachClickEvent.attachClickEventToElement)(button, function(event) {
                        return clickButton(event, {
                            fundingSource: button.getAttribute("data-funding-source"),
                            card: button.getAttribute("data-card")
                        });
                    });
                });
                buttonEnabled = !0;
                window.xprops.validate && window.xprops.validate({
                    enable: function() {
                        buttonEnabled = !0;
                    },
                    disable: function() {
                        buttonEnabled = !1;
                    }
                });
                return window.paypal.Promise.all([ (0, _lightbox.detectLightboxEligibility)(), (0, 
                _locale.determineLocale)().then(function(locale) {
                    window.paypal.config.locale.country = locale.country;
                    window.paypal.config.locale.lang = locale.lang;
                }), (0, _api.getButtonFunding)().then(function(funding) {
                    window.xprops.funding && window.xprops.funding.remember && funding.remembered && funding.remembered.length && window.xprops.funding.remember(funding.remembered);
                }) ]);
            }
            window.console && window.console.warn && window.console.warn("Button setup inside prerender");
        }
    },
    "./public/js/button/checkout.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        };
        exports.renderCheckout = renderCheckout;
        __webpack_require__("./node_modules/paypal-sdk-constants/index.js");
        var _lightbox = __webpack_require__("./public/js/button/lightbox.js"), _util = __webpack_require__("./public/js/button/util.js"), _api = __webpack_require__("./public/js/button/api.js"), _user = __webpack_require__("./public/js/button/user.js"), _config = __webpack_require__("./public/js/button/config.js"), _constants = __webpack_require__("./public/js/button/constants.js");
        function buildPatchActions(data) {
            var handlePatchError = function() {
                throw new Error("Payment could not be patched, error occured in API call.");
            };
            return {
                paymentPatch: function(patch) {
                    if (!data.paymentID) throw new Error("Client side patch is only available for REST based transactions");
                    return (0, _api.patchPayment)(data.paymentID, patch).catch(handlePatchError);
                },
                orderPatch: function(patch) {
                    if (!data.orderID) throw new Error("Client side patch is only available for REST based transactions");
                    return (0, _api.patchOrder)(data.orderID, patch).catch(handlePatchError);
                }
            };
        }
        function buildCheckoutProps(props) {
            var memoizedPayment = (0, _util.memoize)(props.payment || window.xprops.payment), payment = function() {
                return memoizedPayment().then(_api.normalizeECToken);
            }, builtProps = _extends({
                payment: payment,
                locale: window.xprops.locale,
                commit: window.xprops.commit,
                onError: window.xprops.onError,
                onAuthorize: function(data, actions) {
                    actions = function(checkout, data, actions, fundingSource) {
                        var restartFlow = function() {
                            return checkout.close().then(function() {
                                (0, _lightbox.enableLightbox)();
                                renderCheckout({
                                    fundingSource: fundingSource,
                                    payment: function() {
                                        return window.paypal.Promise.resolve(data.paymentToken);
                                    }
                                });
                                return new window.paypal.Promise(_util.noop);
                            });
                        }, handleExecuteError = function(err) {
                            if (err && "CC_PROCESSOR_DECLINED" === err.message) return restartFlow();
                            if (err && "INSTRUMENT_DECLINED" === err.message) return restartFlow();
                            throw new Error("Payment could not be executed");
                        }, paymentGet = (0, _util.memoize)(function() {
                            if (!data.paymentID) throw new Error("Client side payment get is only available for REST based transactions");
                            return (0, _api.getPayment)(data.paymentID);
                        }), paymentExecute = (0, _util.memoize)(function() {
                            if (!data.paymentID) throw new Error("Client side payment execute is only available for REST based transactions");
                            checkout.closeComponent();
                            return (0, _api.executePayment)(data.paymentID, data.payerID).catch(handleExecuteError).finally(paymentGet.reset);
                        }), orderGet = (0, _util.memoize)(function() {
                            if (!data.orderID) throw new Error("Client side order get is only available for REST based transactions");
                            return (0, _api.getOrder)(data.orderID);
                        }), orderCapture = (0, _util.memoize)(function() {
                            if (!data.orderID) throw new Error("Client side order capture is only available for REST based transactions");
                            checkout.closeComponent();
                            return (0, _api.captureOrder)(data.orderID).catch(handleExecuteError).finally(orderGet.reset);
                        }), orderAuthorize = (0, _util.memoize)(function() {
                            if (!data.orderID) throw new Error("Client side order capture is only available for REST based transactions");
                            checkout.closeComponent();
                            return (0, _api.authorizeOrder)(data.orderID).catch(handleExecuteError).finally(orderGet.reset);
                        }), _buildPatchActions = buildPatchActions(data), paymentPatch = _buildPatchActions.paymentPatch, orderPatch = _buildPatchActions.orderPatch;
                        return _extends({
                            payment: {
                                execute: paymentExecute,
                                patch: paymentPatch,
                                get: paymentGet
                            },
                            order: {
                                capture: orderCapture,
                                authorize: orderAuthorize,
                                patch: orderPatch,
                                get: orderGet
                            },
                            redirect: function(win, url) {
                                return window.paypal.Promise.all([ (0, _util.redirect)(win || window.top, url || data.returnUrl), actions.close() ]);
                            },
                            restart: restartFlow
                        }, actions);
                    }(this, data, actions, props.fundingSource);
                    return window.xprops.onAuthorize(data, actions).catch(function(err) {
                        return window.xchild.error(err);
                    });
                },
                onCancel: function(data, actions) {
                    return window.paypal.Promise.try(function() {
                        return function(payment) {
                            return payment().then(function(paymentToken) {
                                return window.paypal.Promise.all([ (0, _api.getCheckoutAppData)(paymentToken), (0, 
                                _api.getCheckoutCart)(paymentToken) ]).then(function(_ref) {
                                    var appData = _ref[0], cart = _ref[1], paymentID = appData.payment_id, cancelUrl = appData.urls.cancel_url, intent = cart.payment_action, billingID = paymentToken, billingToken = cart.billing && cart.billing.ba_token;
                                    return {
                                        paymentToken: paymentToken,
                                        paymentID: paymentID,
                                        intent: intent,
                                        billingID: billingID,
                                        billingToken: billingToken,
                                        cancelUrl: cancelUrl
                                    };
                                });
                            });
                        }(payment);
                    }).then(function(cancelData) {
                        var cancelActions = function(checkout, data, actions) {
                            return _extends({}, actions, {
                                redirect: function(win, url) {
                                    return window.paypal.Promise.all([ (0, _util.redirect)(win || window.top, url || data.cancelUrl), actions.close() ]).then(_util.noop);
                                }
                            });
                        }(0, cancelData, actions);
                        return window.xprops.onCancel(cancelData, cancelActions);
                    }).catch(function(err) {
                        return window.xchild.error(err);
                    });
                },
                onAuth: function(_ref2) {
                    var accessToken = _ref2.accessToken;
                    (0, _user.persistAccessToken)(accessToken);
                    (0, _lightbox.detectLightboxEligibility)();
                },
                style: {
                    overlayColor: window.xprops.style.overlayColor
                }
            }, props);
            window.xprops.onShippingChange && (builtProps = _extends({}, builtProps, {
                onShippingChange: function(data, actions) {
                    var _buildPatchActions2 = buildPatchActions(data), paymentPatch = _buildPatchActions2.paymentPatch, orderPatch = _buildPatchActions2.orderPatch;
                    return window.xprops.onShippingChange(data, _extends({}, actions, {
                        order: {
                            patch: orderPatch
                        },
                        payment: {
                            patch: paymentPatch
                        }
                    }));
                }
            }));
            return builtProps;
        }
        function renderCheckout(props) {
            var checkoutProps = buildCheckoutProps(props);
            _config.UPDATE_CLIENT_CONFIGURATION && checkoutProps.payment().then(function(paymentToken) {
                (0, _api.updateClientConfig)({
                    paymentToken: paymentToken,
                    fundingSource: checkoutProps.fundingSource,
                    integrationArtifact: _constants.INTEGRATION_ARTIFACT.JS_V4,
                    userExperienceFlow: _constants.USER_EXPERIENCE_FLOW.INCONTEXT,
                    productFlow: _constants.PRODUCT_FLOW.SMART_PAYMENT_BUTTONS
                });
            });
            window.paypal.Checkout.renderTo(window.top, checkoutProps).catch(_util.noop);
        }
    },
    "./public/js/button/config.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.API_URI = {
            GRAPHQL: "/graphql"
        }, exports.UPDATE_CLIENT_CONFIGURATION = Boolean(window.xprops && window.xprops.updateClientConfiguration);
    },
    "./public/js/button/constants.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.ACCESS_TOKEN_HEADER = "x-paypal-internal-euat", exports.KEY_CODES = {
            ENTER: 13
        }, exports.INTEGRATION_ARTIFACT = {
            JS_V4: "JS_V4"
        }, exports.USER_EXPERIENCE_FLOW = {
            INCONTEXT: "INCONTEXT",
            INLINE: "INLINE"
        }, exports.PRODUCT_FLOW = {
            SMART_PAYMENT_BUTTONS: "SMART_PAYMENT_BUTTONS"
        };
    },
    "./public/js/button/hacks.js": function(module, exports, __webpack_require__) {
        "use strict";
        try {
            var props = window.paypal.Checkout.props;
            props.style = props.style || {
                type: "object",
                required: !1
            };
            props.fundingSource = props.fundingSource || {
                type: "string",
                required: !1
            };
        } catch (err) {}
    },
    "./public/js/button/index.js": function(module, exports, __webpack_require__) {
        "use strict";
        __webpack_require__("./public/js/button/hacks.js");
        var _button = __webpack_require__("./public/js/button/button.js");
        window.setup = _button.setup;
    },
    "./public/js/button/lightbox.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.isLightboxEligible = isLightboxEligible;
        exports.enableLightbox = function() {
            lightboxEligibilityTimeout && clearTimeout(lightboxEligibilityTimeout);
            lightboxEligibilityTimeout = setTimeout(function() {
                window.paypal.Checkout.contexts.lightbox = !1;
                window.paypal.Checkout.contexts.iframe = !1;
            }, 3e5);
            window.paypal.Checkout.contexts.lightbox = !0;
            window.paypal.Checkout.contexts.iframe = !0;
        };
        exports.detectLightboxEligibility = function() {
            return isLightboxEligible().then(function(eligible) {
                eligible && window.xprops.onAuth && window.xprops.onAuth();
            });
        };
        var _util = __webpack_require__("./bower_modules/squid-core/dist/util.js"), _user = __webpack_require__("./public/js/button/user.js"), lightboxEligibilityTimeout = void 0;
        function isLightboxEligible() {
            return window.paypal.Promise.resolve().then(function() {
                return !window.xprops.disableLightbox && (!!_util.$util.cookiesEnabled() && (0, 
                _user.isLoggedIn)());
            });
        }
    },
    "./public/js/button/locale.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.determineLocale = function() {
            return window.paypal.Promise.try(function() {
                var userLocale = window.xprops.locale;
                if (userLocale) {
                    var _userLocale$split = userLocale.split("_"), lang = _userLocale$split[0], country = _userLocale$split[1];
                    if (!window.paypal.config.locales[country]) throw new Error("Invalid country: " + country + " for locale " + userLocale);
                    if (-1 === window.paypal.config.locales[country].indexOf(lang)) throw new Error("Invalid language: " + lang + " for locale " + userLocale);
                    return {
                        lang: lang,
                        country: country
                    };
                }
                return (0, _api.getLocale)();
            });
        };
        var _api = __webpack_require__("./public/js/button/api.js");
    },
    "./public/js/button/logger.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.flush = exports.info = exports.error = exports.track = void 0;
        var _util = __webpack_require__("./public/js/button/util.js");
        exports.track = window.paypal && window.paypal.logger && window.paypal.logger.track || _util.noop, 
        exports.error = window.paypal && window.paypal.logger && window.paypal.logger.error || _util.noop, 
        exports.info = window.paypal && window.paypal.logger && window.paypal.logger.info || _util.noop, 
        exports.flush = window.paypal && window.paypal.logger && window.paypal.logger.flush || _util.noop;
    },
    "./public/js/button/paymentRequest.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.guestEligibilityCheck = exports.payment = void 0;
        __webpack_require__("./node_modules/whatwg-fetch/fetch.js");
        var networks = [ "amex", "diners", "discover", "jcb", "mastercard", "unionpay", "visa", "mir" ], supportedInstruments = [ {
            supportedMethods: networks
        }, {
            supportedMethods: [ "basic-card" ],
            data: {
                supportedNetworks: networks,
                supportedTypes: [ "debit", "credit", "prepaid" ]
            }
        } ], details = {
            total: {
                label: "Donation",
                amount: {
                    currency: "USD",
                    value: "55.00"
                }
            },
            displayItems: [ {
                label: "Original donation amount",
                amount: {
                    currency: "USD",
                    value: "65.00"
                }
            }, {
                label: "Friends and family discount",
                amount: {
                    currency: "USD",
                    value: "-10.00"
                }
            } ]
        };
        exports.payment = function() {
            return new PaymentRequest(supportedInstruments, details);
        }, exports.guestEligibilityCheck = function(_ref) {
            var params = {
                operation: "GuestFlowCheck",
                query: 'query GuestFlowCheck { checkoutSession( token: "' + _ref.token + '" ) { flags { isHostedFieldsAllowed isGuestEligible }}}',
                variables: null
            }, graphqlEndpoint = window.__GRAPHQL_ENDPOINT__ || "https://www.paypal.com/graphql";
            return fetch(graphqlEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            }).then(function(res) {
                return res.json();
            }).catch(function(err) {
                throw err;
            });
        };
    },
    "./public/js/button/promise.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.usePayPalPromise = function() {
            _promise.$promise.use(window.paypal.Promise);
        };
        var _promise = __webpack_require__("./bower_modules/squid-core/dist/promise.js");
        __webpack_require__("./bower_modules/squid-core/dist/util.js");
    },
    "./public/js/button/promiseRetry.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.default = function promiseRetry(promiseFactory) {
            var time = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 3;
            return promiseFactory().then(function(result) {
                return result;
            }, function(error) {
                if (0 === time) throw error;
                return promiseRetry(promiseFactory, time - 1);
            });
        };
    },
    "./public/js/button/user.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.isLoggedIn = isLoggedIn;
        exports.isCookied = isCookied;
        exports.isRemembered = function() {
            return window.paypal.Promise.resolve().then(function() {
                return !!isCookied() || isLoggedIn();
            });
        };
        exports.persistAccessToken = function(accessToken) {
            return window.paypal.Promise.try(function() {
                if (accessToken !== lastAccessToken) {
                    lastAccessToken = accessToken;
                    _api.$Api.addHeader(_constants.ACCESS_TOKEN_HEADER, accessToken);
                    return (0, _api2.getAuth)();
                }
            });
        };
        var _api = __webpack_require__("./bower_modules/squid-core/dist/api.js"), _config = __webpack_require__("./bower_modules/squid-core/dist/config.js"), _api2 = __webpack_require__("./public/js/button/api.js"), _constants = __webpack_require__("./public/js/button/constants.js");
        function isLoggedIn() {
            return (0, _api2.getAuth)().then(function(auth) {
                return !auth.guest && !!(auth.logged_in || auth.remembered || auth.refresh_token);
            });
        }
        function isCookied() {
            return Boolean(_config.$cookies.login_email);
        }
        var lastAccessToken = void 0;
    },
    "./public/js/button/util.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.memoize = function(method) {
            var called = !1, result = void 0;
            function memoizeWrapper() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                if (called) return result;
                called = !0;
                return result = method.apply(this, arguments);
            }
            memoizeWrapper.reset = function() {
                called = !1;
            };
            return memoizeWrapper;
        };
        exports.querySelectorAll = function(selector) {
            var doc = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : window.document;
            return Array.prototype.slice.call(doc.querySelectorAll(selector));
        };
        exports.noop = function() {};
        exports.urlWillRedirectPage = urlWillRedirectPage;
        exports.redirect = function() {
            var win = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : window, url = arguments[1];
            return new window.paypal.Promise(function(resolve) {
                setTimeout(function() {
                    win.location = url;
                    urlWillRedirectPage(url) || resolve();
                }, 1);
            });
        };
        function urlWillRedirectPage(url) {
            return -1 === url.indexOf("#") || 0 !== url.indexOf("#") && url.split("#")[0] !== window.location.href.split("#")[0];
        }
    },
    "./public/js/button/util/attachClickEvent.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.attachClickEventToElement = void 0;
        var _constants = __webpack_require__("./public/js/button/constants.js");
        exports.attachClickEventToElement = function(element, fn) {
            element.addEventListener("touchstart", function() {});
            element.addEventListener("click", fn);
            element.addEventListener("keypress", function(event) {
                if (event.keyCode === _constants.KEY_CODES.ENTER) return fn(event);
            });
        };
    },
    "./public/js/constants.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.PAYMENT_EXECUTION_ERROR = {
            CC_PROCESSOR_DECLINED: "CC_PROCESSOR_DECLINED",
            INSTRUMENT_DECLINED: "INSTRUMENT_DECLINED"
        };
    },
    "./public/js/inlineGuest/billing.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        };
        exports.renderBillingPage = function() {
            var props = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            return window.paypal.BillingPage.renderTo(window.top, _extends({
                locale: window.xprops.locale,
                commit: window.xprops.commit,
                on: function(action) {
                    window.xprops.on && window.xprops.on(action);
                },
                onError: window.xchild.error
            }, props), "body").then(_util.noop);
        };
        var _util = __webpack_require__("./public/js/button/util.js");
    },
    "./public/js/inlineGuest/constants.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.BUTTON_MARGINS = {
            large: 14,
            medium: 11,
            small: 5,
            responsive: 11,
            default: 11
        }, exports.BUTTON_HEIGHTS = {
            large: 45,
            medium: 35,
            small: 25,
            responsive: 35,
            default: 35
        }, exports.POWERED_BY_PAYPAL_HEIGHT = 20, exports.PADDING = 35, exports.ACTIONS = {
            ZIP_CODE_CHANGED: "ZIP_CODE_CHANGED",
            DISPLAY_GO_TO_XOON: "DISPLAY_GO_TO_XOON",
            OPEN_BILLING_ADDRESS: "@BILLING_PAGE/OPEN",
            SUBMIT_BILLING_ADDRESS: "@BILLING_PAGE/SUBMIT",
            SET_CONTENT_HEIGHT: "SET_CONTENT_HEIGHT",
            CARD_TYPE_CHANGED: "CARD_TYPE_CHANGED",
            CARD_FORM_COLLAPSE: "CARD_FORM_COLLAPSE",
            CARD_FORM_EXPAND: "CARD_FORM_EXPAND",
            CARD_FORM_CLEAR: "CARD_FORM_CLEAR",
            BUTTONS_RESET: "BUTTONS_RESET",
            CARD_FORM_RESPONDED_SUCCESS: "CARD_FORM_RESPONDED_SUCCESS",
            CREDIT_FORM_RESET: "@@redux-form/RESET"
        }, exports.clearFormAction = {
            type: "@@redux-form/RESET",
            meta: {
                form: "card_fields"
            }
        };
    },
    "./public/js/inlineGuest/creditCardForm.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.renderGoToXoon = void 0;
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        };
        exports.renderCardExperience = function() {
            var _ref = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, token = _ref.token, otherProps = function(obj, keys) {
                var target = {};
                for (var i in obj) keys.indexOf(i) >= 0 || Object.prototype.hasOwnProperty.call(obj, i) && (target[i] = obj[i]);
                return target;
            }(_ref, [ "token" ]), zomboEl = document.getElementById("cardExp");
            zomboEl.innerHTML = "";
            zomboEl.className = "cardExpOpened";
            _config.UPDATE_CLIENT_CONFIGURATION && (0, _api.updateClientConfig)({
                paymentToken: token,
                fundingSource: _paypalSdkConstants.FUNDING.CARD,
                integrationArtifact: _constants2.INTEGRATION_ARTIFACT.JS_V4,
                userExperienceFlow: _constants2.USER_EXPERIENCE_FLOW.INLINE,
                productFlow: _constants2.PRODUCT_FLOW.SMART_PAYMENT_BUTTONS
            });
            return window.paypal.Card.render(_extends({
                token: token,
                locale: window.xprops.locale,
                commit: window.xprops.commit,
                onAuthorize: function(data, actions) {
                    var newActions = function(checkout, data, actions) {
                        var handleExecuteError = function(err) {
                            var errorMessage = (0, _get.get)(err, "message"), wasCardDeclined = errorMessage === _constants.PAYMENT_EXECUTION_ERROR.CC_PROCESSOR_DECLINED || errorMessage === _constants.PAYMENT_EXECUTION_ERROR.INSTRUMENT_DECLINED;
                            (0, _onEvent.expand)();
                            return renderGoToXoon({
                                paymentToken: data.paymentID,
                                wasCardDeclined: wasCardDeclined
                            });
                        }, paymentGet = (0, _util.memoize)(function() {
                            if (!data.paymentID) throw new Error("Client side payment get is only available for REST based transactions");
                            return (0, _api.getPayment)(data.paymentID);
                        }), paymentExecute = (0, _util.memoize)(function() {
                            if (!data.paymentID) throw new Error("Client side payment execute is only available for REST based transactions");
                            return (0, _api.executePayment)(data.paymentID, data.payerID).catch(handleExecuteError).finally(paymentGet.reset);
                        }), orderGet = (0, _util.memoize)(function() {
                            if (!data.orderID) throw new Error("Client side order get is only available for REST based transactions");
                            return (0, _api.getOrder)(data.orderID);
                        }), orderCapture = (0, _util.memoize)(function() {
                            if (!data.orderID) throw new Error("Client side order capture is only available for REST based transactions");
                            checkout.closeComponent();
                            return (0, _api.captureOrder)(data.orderID).catch(handleExecuteError).finally(orderGet.reset);
                        });
                        return _extends({}, actions, {
                            payment: {
                                execute: paymentExecute,
                                get: paymentGet
                            },
                            order: {
                                capture: orderCapture,
                                get: orderGet
                            }
                        });
                    }(this, data, actions);
                    return window.xprops.onAuthorize(data, newActions).catch(function(err) {
                        return window.xchild.error(err);
                    });
                },
                onCancel: function(data) {
                    return window.xprops.onCancel(data, {});
                },
                onAuth: function(_ref2) {
                    var accessToken = _ref2.accessToken;
                    return (0, _user.persistAccessToken)(accessToken);
                },
                onError: window.xchild.error
            }, otherProps), zomboEl);
        };
        var _paypalSdkConstants = __webpack_require__("./node_modules/paypal-sdk-constants/index.js"), _get = __webpack_require__("./button/util/get.js"), _user = __webpack_require__("./public/js/button/user.js"), _api = __webpack_require__("./public/js/button/api.js"), _util = __webpack_require__("./public/js/button/util.js"), _checkout = __webpack_require__("./public/js/button/checkout.js"), _attachClickEvent = __webpack_require__("./public/js/button/util/attachClickEvent.js"), _constants = __webpack_require__("./public/js/constants.js"), _config = __webpack_require__("./public/js/button/config.js"), _constants2 = __webpack_require__("./public/js/button/constants.js"), _onEvent = __webpack_require__("./public/js/inlineGuest/onEvent.js");
        function renderGoToXoon(params) {
            var paymentToken = params.paymentToken, wasCardDeclined = params.wasCardDeclined, zomboEl = document.getElementById("cardExp");
            if (!zomboEl) throw new Error("Inline Guest div not found");
            zomboEl.innerHTML = "";
            var buttonContent = '\n    <div id="go-to-xoon-error-message"\n        style="\n          font-family: HelveticaNeue-Light,Helvetica Neue Light,helvetica,arial,sans-serif;\n          line-height: 24px;\n          font-size: 18px;\n          color: #000;\n          margin: 10px 0 24px 0;\n          text-align: center;\n        "\n    >' + (wasCardDeclined ? (0, 
            _get.get)(window, "localizationJSON.cardWasDeclined") : (0, _get.get)(window, "localizationJSON.somethingWentWrong")) + '</div>\n    <button id="go-to-xoon"\n      role="button"\n      style="\n          height: 48px;\n          line-height: 48px;\n          border-radius: 4px;\n          -moz-border-radius: 4px;\n          background-color: #0070BA;\n          border-color: #0070BA;\n          color: #fff;\n          font-size: 15px;\n          user-select: none;\n          text-align: center;\n          font-family: Helvetica Neue,HelveticaNeue,helvetica,arial,sans-serif;\n          cursor: pointer;\n          width: 100%;\n      "\n    >' + (0, 
            _get.get)(window, "localizationJSON.tryAgain", "Try Again") + "</button>\n    ";
            zomboEl.innerHTML = buttonContent;
            var buttons = document.querySelectorAll("#go-to-xoon");
            if (0 === buttons.length) throw new Error("Cannot find the go to guest checkout button");
            var goToXoonButton = buttons[0];
            (0, _attachClickEvent.attachClickEventToElement)(goToXoonButton, function(event) {
                event.preventDefault();
                event.stopPropagation();
                return (0, _checkout.renderCheckout)(_extends({
                    fundingSource: _paypalSdkConstants.FUNDING.CARD
                }, paymentToken ? {
                    payment: function() {
                        return window.paypal.Promise.resolve(paymentToken);
                    }
                } : {}));
            });
            return window.paypal.Promise.resolve();
        }
        exports.renderGoToXoon = renderGoToXoon;
    },
    "./public/js/inlineGuest/index.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        var _state = __webpack_require__("./public/js/inlineGuest/state.js");
        Object.keys(_state).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _state[key];
                }
            });
        });
        var _onEvent = __webpack_require__("./public/js/inlineGuest/onEvent.js");
        Object.keys(_onEvent).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _onEvent[key];
                }
            });
        });
        var _inlineGuestEligibility = __webpack_require__("./public/js/inlineGuest/inlineGuestEligibility.js");
        Object.keys(_inlineGuestEligibility).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _inlineGuestEligibility[key];
                }
            });
        });
        var _constants = __webpack_require__("./public/js/inlineGuest/constants.js");
        Object.keys(_constants).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _constants[key];
                }
            });
        });
        var _creditCardForm = __webpack_require__("./public/js/inlineGuest/creditCardForm.js");
        Object.keys(_creditCardForm).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _creditCardForm[key];
                }
            });
        });
        var _billing = __webpack_require__("./public/js/inlineGuest/billing.js");
        Object.keys(_billing).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _billing[key];
                }
            });
        });
    },
    "./public/js/inlineGuest/inlineGuestEligibility.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.shouldEnableInlineGuest = exports.inlineGuestPXPEnabled = exports.isZomboCookieEnabled = void 0;
        var _get = __webpack_require__("./button/util/get.js"), isZomboCookieEnabled = exports.isZomboCookieEnabled = function() {
            return document.cookie.indexOf("zombo=1") >= 0;
        }, inlineGuestPXPEnabled = exports.inlineGuestPXPEnabled = function() {
            var isEnable = !1;
            ((0, _get.get)(window.pre, "inlineGuest.res.data.treatments") || []).forEach(function(t) {
                "xo_hermesnodeweb_inline_guest_treatment" === t.treatment_name && (isEnable = !0);
            });
            return isEnable;
        };
        exports.shouldEnableInlineGuest = function(buttonEl, buttonsContainer) {
            var hasButtonElements = buttonEl && buttonsContainer, hasAttributes = !!buttonEl && buttonEl.getAttribute, hasCallbackAPI = window.xprops && window.xprops.onShippingChange;
            if (!hasButtonElements || !hasAttributes || hasCallbackAPI) return !1;
            var isSPBWideEnoughForInlineGuest = buttonsContainer && buttonsContainer.scrollWidth >= 250, buttonLayout = buttonEl ? buttonEl.getAttribute("data-layout") : "";
            return !(!isSPBWideEnoughForInlineGuest || "vertical" !== buttonLayout || !inlineGuestPXPEnabled() && !isZomboCookieEnabled());
        };
    },
    "./public/js/inlineGuest/onEvent.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.onEvent = exports.collapse = exports.expand = exports.changeCardTypeTo = exports.dispatch = void 0;
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        }, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, _util = __webpack_require__("./public/js/button/util.js"), _get = __webpack_require__("./button/util/get.js"), _utils = __webpack_require__("./public/js/inlineGuest/utils/index.js"), _constants = __webpack_require__("./public/js/inlineGuest/constants.js"), _billing = __webpack_require__("./public/js/inlineGuest/billing.js"), _creditCardForm = __webpack_require__("./public/js/inlineGuest/creditCardForm.js"), _index = __webpack_require__("./public/js/inlineGuest/index.js"), buttonsIframeHeight = window.innerHeight, buttonsIframeWidth = window.innerWidth, dispatch = exports.dispatch = function(action) {
            action && window.xprops.dispatch && window.xprops.dispatch(action);
        }, changeCardTypeTo = exports.changeCardTypeTo = function(cardType) {
            if ((0, _index.getState)().currentCardType !== cardType) {
                (0, _index.setState)({
                    currentCardType: cardType
                });
                (0, _utils.disableAllCardTypes)();
                var selectedCardEl = (0, _utils.getCardElementFromCardType)(cardType);
                (0, _utils.enableCard)(selectedCardEl);
            }
        }, zomboResizeActions = function() {
            var parent = window.xchild, BUTTON_HEIGHT = (0, _utils.getButtonHeight)(), collapse = function() {
                var width = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
                    width: buttonsIframeWidth
                }).width;
                (0, _index.setState)({
                    isExpanded: !1
                });
                parent.resize(width, buttonsIframeHeight);
            }, expand = function() {
                var width = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
                    width: buttonsIframeWidth
                }).width, state = (0, _index.getState)();
                (0, _index.setState)({
                    isExpanded: !0
                });
                var top = BUTTON_HEIGHT + _constants.PADDING + _constants.POWERED_BY_PAYPAL_HEIGHT;
                parent.resize(width, state.contentHeight + top);
            };
            return {
                collapse: collapse,
                expand: expand,
                toggle: function() {
                    var dimenssions = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
                        width: buttonsIframeWidth
                    }, _getState2$isExpanded = (0, _index.getState)().isExpanded;
                    void 0 !== _getState2$isExpanded && _getState2$isExpanded ? collapse(dimenssions) : expand(dimenssions);
                }
            };
        }, expand = exports.expand = function(dimenssions) {
            var resizeActions = zomboResizeActions(), container = document.getElementById("paypal-animation-container"), BUTTON_HEIGHT = (0, 
            _utils.getButtonHeight)(), content = document.getElementById("paypal-animation-content");
            if (content && container) {
                var transitionTop = BUTTON_HEIGHT * (container.querySelectorAll(".paypal-button").length - 1) - _constants.PADDING;
                resizeActions.expand(dimenssions);
                content.style.transform = "translateY(-" + transitionTop + "px)";
                (0, _utils.removeClass)(container, "paypal-animation-container-expanded");
                (0, _utils.addClass)(container, "paypal-animation-container-collapsed");
                (0, _util.querySelectorAll)(".paypal-button").forEach(function(button) {
                    "card" !== button.getAttribute("data-funding-source") && (button.style.opacity = 0);
                });
            }
        }, collapse = exports.collapse = function(dimenssions) {
            var resizeActions = zomboResizeActions(), container = document.getElementById("paypal-animation-container"), content = document.getElementById("paypal-animation-content");
            resizeActions.collapse(dimenssions);
            if (content) {
                content.style.transform = "translateY(0px)";
                (0, _utils.addClass)(container, "paypal-animation-container-expanded");
                (0, _utils.removeClass)(container, "paypal-animation-container-collapsed");
                (0, _util.querySelectorAll)(".paypal-button").forEach(function(button) {
                    "card" !== button.getAttribute("data-funding-source") && (button.style.opacity = 1);
                });
            }
        };
        exports.onEvent = function onEvent(event) {
            var _ref3 = event || {}, type = _ref3.type, _ref3$payload = _ref3.payload, payload = void 0 === _ref3$payload ? {} : _ref3$payload;
            if (type) {
                var _ref4 = (0, _index.getState)() || {}, currentCardType = _ref4.currentCardType, zipCode = _ref4.zipCode;
                if (type !== _constants.ACTIONS.ZIP_CODE_CHANGED) {
                    if (type === _constants.ACTIONS.DISPLAY_GO_TO_XOON) {
                        var paymentToken = (0, _get.get)(payload, "paymentToken");
                        return (0, _creditCardForm.renderGoToXoon)({
                            paymentToken: paymentToken
                        });
                    }
                    if (type === _constants.ACTIONS.OPEN_BILLING_ADDRESS) {
                        var newPayload = {};
                        null !== payload && "object" === (void 0 === payload ? "undefined" : _typeof(payload)) && !1 === Array.isArray(payload) && (newPayload = payload);
                        return (0, _billing.renderBillingPage)(_extends({}, newPayload, {
                            env: window.paypal.Button.xprops.env,
                            onEvent: onEvent,
                            prefilledZipCode: zipCode || "",
                            cardType: currentCardType
                        }));
                    }
                    if (type === _constants.ACTIONS.SUBMIT_BILLING_ADDRESS) {
                        (0, _index.setState)({
                            billingAddress: payload
                        });
                        return window.xprops.dispatch({
                            type: type,
                            payload: payload
                        });
                    }
                    if (type !== _constants.ACTIONS.SET_CONTENT_HEIGHT) if (type !== _constants.ACTIONS.CARD_TYPE_CHANGED) if (type !== _constants.ACTIONS.CARD_FORM_COLLAPSE) if (type !== _constants.ACTIONS.CARD_FORM_EXPAND) if (type !== _constants.ACTIONS.CARD_FORM_CLEAR) if (type !== _constants.ACTIONS.BUTTONS_RESET) {
                        if (type === _constants.ACTIONS.CARD_FORM_RESPONDED_SUCCESS) {
                            onEvent({
                                type: _constants.ACTIONS.CARD_FORM_COLLAPSE
                            });
                            onEvent({
                                type: _constants.ACTIONS.CARD_FORM_CLEAR
                            });
                            onEvent({
                                type: _constants.ACTIONS.BUTTONS_RESET
                            });
                        }
                    } else {
                        (0, _utils.enableAllCardTypes)();
                        (0, _index.setState)({
                            currentCardType: void 0
                        });
                    } else setTimeout(function() {
                        dispatch(_constants.clearFormAction);
                    }, 1e3); else expand(); else collapse(); else {
                        var newCardType = payload;
                        if ("string" != typeof newCardType && void 0 !== newCardType) return;
                        changeCardTypeTo(newCardType);
                    } else (0, _index.setState)({
                        contentHeight: payload
                    });
                } else (0, _index.setState)({
                    zipCode: payload
                });
            }
        };
    },
    "./public/js/inlineGuest/state.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.setState = exports.getState = exports.isSubmitting = void 0;
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        }, _get = __webpack_require__("./button/util/get.js"), state = {
            contentHeight: 300,
            isZomboRendered: !1,
            currentCardType: void 0,
            isExpanded: !1,
            zipCode: void 0
        };
        exports.isSubmitting = function() {
            if (window.xprops.zomboStore && window.xprops.zomboStore.getState) {
                var store = window.xprops.zomboStore.getState();
                return (0, _get.get)(store, "app.isLoading", !1);
            }
            return !1;
        }, exports.getState = function() {
            return state || {};
        }, exports.setState = function(newState) {
            state = _extends({}, state, newState);
        };
    },
    "./public/js/inlineGuest/utils/getButtonHeight.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.getButtonHeight = void 0;
        var _constants = __webpack_require__("./public/js/inlineGuest/constants.js"), _get = __webpack_require__("./button/util/get.js"), _util = __webpack_require__("./public/js/button/util.js");
        exports.getButtonHeight = function() {
            var buttons = (0, _util.querySelectorAll)(".paypal-button-number-0");
            if (!buttons || 0 === buttons.length) return _constants.BUTTON_HEIGHTS.default + _constants.BUTTON_MARGINS.default;
            var button = buttons[0], style = button.currentStyle || window.getComputedStyle(button), marginBottom = Number((0, 
            _get.get)(style, "marginBottom", "0").replace("px", ""));
            return button.clientHeight + marginBottom;
        };
    },
    "./public/js/inlineGuest/utils/index.js": function(module, exports, __webpack_require__) {
        "use strict";
        exports.__esModule = !0;
        exports.disableAllCardTypes = exports.enableAllCardTypes = exports.disableCard = exports.enableCard = exports.getCardElementFromCardType = exports.getCardClass = void 0;
        var _getButtonHeight = __webpack_require__("./public/js/inlineGuest/utils/getButtonHeight.js");
        Object.keys(_getButtonHeight).forEach(function(key) {
            "default" !== key && "__esModule" !== key && Object.defineProperty(exports, key, {
                enumerable: !0,
                get: function() {
                    return _getButtonHeight[key];
                }
            });
        });
        exports.addClass = function(element, className) {
            if (!element) return;
            var classes = element.className.split(" ");
            classes.indexOf(className) < 0 && "string" == typeof className && classes.push(className);
            element.className = classes.join(" ");
        };
        exports.removeClass = function(element, className) {
            if (!element) return;
            var classes = element.className.split(" "), i = classes.indexOf(className);
            i >= 0 && classes.splice(i, 1);
            element.className = classes.join(" ");
        };
        var _util = __webpack_require__("./public/js/button/util.js");
        var CARD_CLASSES = ((0, _util.querySelectorAll)(".paypal-button-card") || []).reduce(function(acc, el) {
            if (el) {
                var cardType = el.getAttribute("data-card");
                cardType && (acc[cardType.toUpperCase()] = cardType);
            }
            return acc;
        }, {}), getCardClass = exports.getCardClass = function(type) {
            return ".paypal-button-card-" + type;
        }, getCardElementFromCardType = exports.getCardElementFromCardType = function(type) {
            var cardClass = getCardClass(type), cardElements = (0, _util.querySelectorAll)(cardClass);
            if (cardElements && cardElements[0]) {
                return cardElements[0];
            }
            return null;
        }, enableCard = exports.enableCard = function(cardEl) {
            cardEl && cardEl.style && (cardEl.style.opacity = 1);
        }, disableCard = exports.disableCard = function(cardEl) {
            cardEl && cardEl.style && (cardEl.style.opacity = .1);
        };
        exports.enableAllCardTypes = function() {
            Object.keys(CARD_CLASSES).map(function(k) {
                return CARD_CLASSES[k];
            }).forEach(function(type) {
                var cardEl = getCardElementFromCardType(type);
                enableCard(cardEl);
            });
        }, exports.disableAllCardTypes = function() {
            Object.keys(CARD_CLASSES).map(function(k) {
                return CARD_CLASSES[k];
            }).forEach(function(type) {
                var cardEl = getCardElementFromCardType(type);
                disableCard(cardEl);
            });
        };
    }
});