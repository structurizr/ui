QUnit.test("new StructurizrEncryptionStrategy() throws an exception when no properties are specified", function(assert) {
    assert.throws(
        function() {
            new StructurizrEncryptionStrategy();
        },
        function(err) {
            return err.toString() === "Missing encryption properties";
        }
    );
});

QUnit.test("new StructurizrEncryptionStrategy() sets iv, salt, and location when not specified", function(assert) {
    const properties = {
        type: "aes",
        iterationCount: 1000,
        keySize: 128,
        location: "Client",
        passphrase: "password"
    };

    const strategy = new StructurizrEncryptionStrategy(properties);

    assert.equal(properties.location, "Client");
    assert.equal(properties.iv.length, 32);
    assert.equal(properties.salt.length, 32);
    assert.notEqual(properties.iv, properties.salt);
});

QUnit.test("StructurizrEncryptionStrategy.encrypt()", function(assert) {
    const strategy = new StructurizrEncryptionStrategy({
        type: "aes",
        iterationCount: 1000,
        keySize: 128,
        iv: "12345678901234567890123456789012",
        salt: "12345678901234567890123456789012",
        location: "Client",
        passphrase: "password"
    });

    const decryptedWorkspace = {
        id: 1,
        name: "Name",
        description: "Description"
    };

    const encryptedWorkspace = strategy.encrypt(decryptedWorkspace);
    
    assert.deepEqual(encryptedWorkspace, 
        {
            "id": 1,
            "name": "Name",
            "description": "Description",
            "ciphertext": "22DDjqvNjmqVYazSlLd9pAfEELgcu55lshL2pouvYROmhgdJmy+Y/BlXSO/lHMLMnL1lPwGLpSiWJ7ttrmse7g==",
            "encryptionStrategy": {
              "iterationCount": 1000,
              "iv": "12345678901234567890123456789012",
              "keySize": 128,
              "salt": "12345678901234567890123456789012",
              "type": "aes",
              "location": "Client"
            }
        }
    );
});

QUnit.test("StructurizrEncryptionStrategy.decrypt()", function(assert) {
    const strategy = new StructurizrEncryptionStrategy({
        type: "aes",
        iterationCount: 1000,
        keySize: 128,
        iv: "12345678901234567890123456789012",
        salt: "12345678901234567890123456789012",
        location: "Client",
        passphrase: "password"
    });

    const encryptedWorkspace = {
        "id": 1,
        "name": "Name",
        "description": "Description",
        "ciphertext": "22DDjqvNjmqVYazSlLd9pAfEELgcu55lshL2pouvYROmhgdJmy+Y/BlXSO/lHMLMnL1lPwGLpSiWJ7ttrmse7g==",
        "encryptionStrategy": {
          "iterationCount": 1000,
          "iv": "12345678901234567890123456789012",
          "keySize": 128,
          "salt": "12345678901234567890123456789012",
          "type": "aes",
          "location": "Client"
        }
    };
    
    const decryptedWorkspace = strategy.decrypt(encryptedWorkspace);

    assert.deepEqual(decryptedWorkspace,
        {
            id: 1,
            name: "Name",
            description: "Description"
        }
    );
});