# Klass.js

Baseado parcialmente no (https://code.google.com/p/inheritance/)

```javascript
Person = Class.extend({
  // adding a mixin
  include: Sortable,

  // initializer function
  initialize: function(name) {
    this.name = name;
  },

  // ... methods ...

  toString: function() {
    return this.name;
  }
});

Employee = Class.extend(Person, {
  // adding mixins
  include: [Sortable, OtherModule],

  // initializer function
  initialize: function(name, dept) {
    // call parent function
    this.parent(name);

    // more initialization
    this.dept = dept;
  },

  // ... methods ...

  toString: function() {
    // call parent function
    return this.parent() + ' works in ' + this.dept;
  }
});
```
