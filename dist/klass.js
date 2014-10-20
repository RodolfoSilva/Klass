/*!
 * Klass.js v1.1.0 (http://github.com/RodolfoSilva/Klass)
 * Copyright 2014 Rodolfo Silva <contato@rodolfosilva.com>
 * Licensed under MIT (http://github.com/RodolfoSilva/Klass/LICENSE)
 */

(function (global, factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory(global);
        });
    } else {
        global.Class = factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window) {
    "use strict";
    var IS_DONTENUM_BUGGY = (function () {
        for (var p in { toString: 1 }) {
            // check actual property name, so that it works with augmented Object.prototype
            if (p === 'toString') {
                return false;
            }
        }
        return true;
    }());

    var SubClass = function () {};

    var getPropertis = function (iterable) {
        if (!iterable) {
            return [];
        }
        // Safari <2.0.4 crashes when accessing property of a node list with property accessor.
        // It nevertheless works fine with `in` operator, which is why we use it here
        if ('toArray' in Object(iterable)) {
            return iterable.toArray();
        }
        var length = iterable.length || 0, results = new Array(length);
        while (length--) {
            results[length] = iterable[length];
        }
        return results;
    };


    // Klass
    // --------------

    // Define Klass como um alias para `Klass.create`
    var Klass = function () {
        return Klass.create.apply(Klass, arguments);
    };

    // Versão atual.
    Klass.VERSION = '1.1.0';

    Klass.create = function () {
        var parent = null,
            properties = getPropertis(arguments);

        if (Object.isFunction(properties[0])) {
            parent = properties.shift();
        }

        function Constructor() {
            this.initialize.apply(this, arguments);
        }

        Object.extend(Constructor, {addMethods: Klass.addMethods});
        Constructor.superclass = parent;
        Constructor.subclasses = [];

        if (parent) {
            SubClass.prototype = parent.prototype;
            Constructor.prototype = new SubClass;
            parent.subclasses.push(Constructor);
        }

        for (var i = 0, length = properties.length; i < length; i++)
            Constructor.addMethods(properties[i]);

        if (!Constructor.prototype.initialize)
            Constructor.prototype.initialize = Prototype.emptyFunction;

        Constructor.prototype.constructor = Constructor;
        return Constructor;
    }

    Klass.addMethods = function (source) {
        var ancestor   = this.superclass && this.superclass.prototype,
            properties = Object.keys(source);

        if (IS_DONTENUM_BUGGY) {
            if (source.toString != Object.prototype.toString) {
                properties.push('toString');
            }
            if (source.valueOf != Object.prototype.valueOf) {
                properties.push('valueOf');
            }
        }

        for (var i = 0, length = properties.length; i < length; i++) {
            var property = properties[i], value = source[property];
            var argumentsNames = value.argumentNames();
            if (ancestor && Object.isFunction(value) &&
            (argumentsNames[0] == "$super" || argumentsNames[0] == "$parent")) {
                var method = value;
                value = (function (m) {
                    return function () {
                        return ancestor[m].apply(this, arguments);
                    };
                })(property).wrap(method);

                value.valueOf = (function (method) {
                    return function () {
                        return method.valueOf.call(method);
                    };
                })(method);

                value.toString = (function (method) {
                    return function () { return method.toString.call(method); };
                })(method);
            }
            this.prototype[property] = value;
        }
        return this;
    }

    return Klass;
}));

// ECMA5 & ECMA6
if (typeof Function.prototype.bind !== 'function') {
    Function.prototype.bind = function (thisObject) {
        var func = this;
        var args = Array.prototype.slice.call(arguments, 1);
        var Nop = function () {
        };
        var bound = function () {
            var a = args.concat(Array.prototype.slice.call(arguments));
            return func.apply(
                this instanceof Nop ? this : thisObject || window, a);
        };
        Nop.prototype = func.prototype;
        bound.prototype = new Nop();
        return bound;
    };
}

if (typeof Object.extend !== 'function') {
    Object.extend = function (destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    };
}

if (typeof Object.isFunction !== 'function') {
    Object.isFunction = function (object) {
        return Object.prototype.toString.call(object) === '[object Function]';
    };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

if (typeof Function.prototype.argumentNames !== 'function') {
    Object.prototype.argumentNames = function () {
        var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
                    .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
                    .replace(/\s+/g, '').split(',');
        return names.length == 1 && !names[0] ? [] : names;
    };
}

if (typeof Function.prototype.wrap !== 'function') {
    Object.prototype.wrap = function (wrapper) {
        var __method = this;
        return function () {
            var a = (function (array, args) {
                var arrayLength = array.length, length = args.length;
                while (length--) {
                    array[arrayLength + length] = args[length];
                }
                return array;
            }([__method.bind(this)], arguments));
            return wrapper.apply(this, a);
        }
    };
}
