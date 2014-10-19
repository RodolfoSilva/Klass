//     Klass.singleton.js 1.0.0
//     http://rodolfosilva.com
//     (c) 2014 Rodolfo Silva
//     Distribuído sob a licença MIT.

(function(Klass) {
    var root = this;
    // Plugin para criação de classes singleton
    Klass.singleton = function () {

        var instance;

        var Constructor = Klass.create(Klass.create.apply(root, arguments), {
            initialize: function ($super) {
                if (instance) return instance;
                instance = Constructor.instance = this;
                return $super.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        });

        Constructor.getInstance = function () {
            if (instance) return instance;
            return new Constructor();
        };

        return Constructor;
    };
}(Klass));
