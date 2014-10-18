test("Validação de tipo de dados", function(assert) {
    assert.equal(typeof Klass, 'function', 'Verifica se Klass é um função');
});

test("Testa exceções", function(assert) {
    assert.throws(Klass, new Error("definition is undefined (Klass.create)"), "Valida exceção por falta de parametro");
    assert.throws(function() { Klass(null, {}); }, new Error("superclass is undefined (Klass.create)"), "Valida exceção por falta da superclass");
});


test("Testa detalhes de herança", function(assert) {
    var Foo = Klass({
        getName: function() {
            return 'Nome: ' + this.name;
        }
    });

    var Bar = Klass(Foo, {
        initialize: function (name) {
            this.name = name;
        },
        getName: function() {
            return 'Meu ' + this.parent();
        }
    });

    var foobar = new Bar('Optimus Prime');
    assert.equal(foobar.getName('Cor', 'Verde'), 'Meu Nome: Optimus Prime', 'Verifica se o parent está funcionando corretamente.');

});
