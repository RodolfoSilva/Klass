/*!
 * Klass.js v1.1.0 (http://github.com/RodolfoSilva/Klass)
 * Copyright 2014 Rodolfo Silva <contato@rodolfosilva.com>
 * Licensed under MIT (http://github.com/RodolfoSilva/Klass/LICENSE)
 */

/* Based on Alex Arnell's inheritance implementation. */
(function (global, factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory(global);
        });
    } else {
        global.Klass = factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window) {
    "use strict";

    // ECMA-262 5th edition Function
    if (typeof Object.defineProperty !== 'function') {
        Object.defineProperty = function(obj, prop, desc) {
            if ('value' in desc) {
                obj[prop] = desc.value;
            }
            if ('get' in desc) {
                obj.__defineGetter__(prop, desc.get);
            }
            if ('set' in desc) {
                obj.__defineSetter__(prop, desc.set);
            }
            return obj;
        };
    }

    var __extending = {};

    // Klass
    // --------------

    // Define Klass como um alias para `Klass.create`
    var Klass = function () {
        return Klass.create.apply(this, arguments);
    };

    // Versão atual.
    Klass.VERSION = '1.1.0';

    Klass.create    = function (superclass, definition) {
        if (superclass == null && definition) {
            throw new Error("superclass is undefined (Klass.create)");
        } else if (superclass == null) {
            throw new Error("definition is undefined (Klass.create)");
        }

        // Verifica se é uma class extendida
        if (arguments.length === 0) {
            return Klass.create(__extending, definition);
        } else if (arguments.length === 1 && typeof arguments[0] !== 'function') {
            return Klass.create(__extending, arguments[0]);
        }

        var Constructor = function () {
            if (arguments[0] ==  __extending) return;
            this.initialize.apply(this, arguments);
            // Constructor.prototype.initialize.apply(this, arguments);
        };

        if (typeof(superclass) == 'function') {
            // Constructor.prototype = new superclass(__extending);
            Constructor.prototype = superclass.prototype;
        }

        // Constructor.prototype.constructor = Constructor;
        if (Constructor.prototype.initialize == null) {
            Constructor.prototype.initialize = function() {
                if (typeof superclass == 'function')
                    superclass.apply(this, arguments);
            };
        }

        Constructor.constant = function(name, value) {
            name = name.toUpperCase();
            if (typeof value != 'undefined') {
                Object.defineProperty(Constructor, name, { value: value });
            } else {
                return Constructor[name];
            }
        };

        var mixin, mixins = [];
        if (definition && definition.include) {
            if (definition.include.reverse) {
                // methods defined in later mixins should override prior
                mixins = mixins.concat(definition.include.reverse());
            } else {
                mixins.push(definition.include);
            }
            delete definition.include; // clean syntax sugar
        }

        if (definition)
            Klass.inherit(Constructor.prototype, definition);

        for (var i = 0; (mixin = mixins[i]); i++) {
            Klass.mixin(Constructor.prototype, mixin);
        }

        return Constructor;
    };

    Klass.mixin     = function (dest, src, clobber) {
        clobber = clobber || false;
        if (typeof(src) != 'undefined' && src !== null) {
            for (var prop in src) {
                if (clobber || (!dest[prop] && typeof(src[prop]) == 'function')) {
                    dest[prop] = src[prop];
                }
            }
        }
        return dest;
    };

    Klass.inherit   = function (dest, src, fname) {
        if (arguments.length == 3) {
            var ancestor   = dest[fname],
                descendent = src[fname],
                method     = descendent;

            descendent = function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments, 0);

                var fnArgsNames = /\(([\s\S]*?)\)/.exec(method)[1].replace(/\s+/g, '').split(/[ ,\n\r\t]+/);
                    fnArgsNames =  fnArgsNames.length == 1 && !fnArgsNames[0] ? [] : fnArgsNames;;

                if (fnArgsNames[0] == "$super" || fnArgsNames[0] == "$parent") {
                    args.splice(0, 0, function() { return ancestor.apply(that, arguments); });
                }

                return method.apply(that, args);
            };

            descendent.valueOf = (function(method) {
                return function() { return method.valueOf.call(method); };
            })(method);
            descendent.toString = (function(method) {
                return function() { return method.toString.call(method); };
            })(method);

            dest[fname] = descendent;
        } else {
            for (var prop in src) {
                if (dest[prop] && typeof(src[prop]) == 'function') {
                    Klass.inherit(dest, src, prop);
                } else {
                    dest[prop] = src[prop];
                }
            }
        }
        return dest;
    };

    return Klass;
}));
