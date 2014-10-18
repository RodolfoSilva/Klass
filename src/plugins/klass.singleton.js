//     Klass.singleton.js 1.0.0
//     http://rodolfosilva.com
//     (c) 2014 Rodolfo Silva
//     Distribuído sob a licença MIT.

(function(Klass) {
    // Plugin para criação de classes singleton
    Klass.singleton = function () {
        var args = arguments;
        if (args.length == 2 && args[0].getInstance) {
            var Constructor = args[0].getInstance(__extending);
            // we're extending a singleton swap it out for it's class
            if (Constructor) { args[0] = Constructor; }
        }
        return (function (args){
            // store instance and class in private variables
            var instance = false;
            var Constructor = Klass.extend.apply(args.callee, args);
            return {
                getInstance: function () {
                    if (arguments[0] == __extending) return Constructor;
                    if (instance) return instance;
                    return (instance = new Constructor());
                }
            };
        })(args);
    };
}(Klass));
