QUnit.test("structurizr.util.btoa()", function(assert) {
    assert.equal("SGVsbG8gV29ybGQ=", structurizr.util.btoa("Hello World"));
});

QUnit.test("structurizr.util.atob()", function(assert) {
    assert.equal("Hello World", structurizr.util.atob("SGVsbG8gV29ybGQ="));
});