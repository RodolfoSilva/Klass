//     Klass.js 1.0.0
//     http://rodolfosilva.com
//     (c) 2014 Rodolfo Silva
//     Distribuído sob a licença MIT.

/* Based on Alex Arnell's inheritance implementation. */

(function () {
    // "use strict";
    // Game Start
    // --------------

    // ECMA-262 5th edition Functions
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

    // Estabelece o objeto raiz (root), `window` no navegador, ou `exports` no servidor.
    var root = this;

    var __extending = {};

    // Klass
    // --------------

    // Define Klass como um alias para `Klass.create`
    var Klass = function () {
        return Klass.create.apply(this, arguments);
    };

    // Versão atual.
    Klass.VERSION = '1.0.0';

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

        var mixins = [];
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
            var ancestor = dest[fname], descendent = src[fname], method = descendent;
            descendent = function () {
                var ref = this.parent; this.parent = ancestor;
                var result = method.apply(this, arguments);
                ref ? this.parent = ref : delete this.parent;
                return result;
            };
            // mask the underlying method
            descendent.valueOf = function () { return method; };
            descendent.toString = function () { return method.toString(); };
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

    // Deprecated
    // Klass.singleton = function () {
    //     var args = arguments;
    //     if (args.length == 2 && args[0].getInstance) {
    //         var Constructor = args[0].getInstance(__extending);
    //         // we're extending a singleton swap it out for it's class
    //         if (Constructor) { args[0] = Constructor; }
    //     }
    //     return (function (args){
    //         // store instance and class in private variables
    //         var instance = false;
    //         var Constructor = Klass.extend.apply(args.callee, args);
    //         return {
    //             getInstance: function () {
    //                 if (arguments[0] == __extending) return Constructor;
    //                 if (instance) return instance;
    //                 return (instance = new Constructor());
    //             }
    //         };
    //     })(args);
    // };

    root.Klass = Klass;
}());
