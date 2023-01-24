QUnit.test("Workspace.getId() returns -1 when there is no workspace ID", function( assert ) {
    var workspace = new structurizr.Workspace({});
    assert.equal(workspace.getId(), -1);
});

QUnit.test("Workspace.getId() returns the workspace ID", function( assert ) {
    var workspace = new structurizr.Workspace({ id: 123 });
    assert.equal(workspace.getId(), 123);
});

QUnit.test("Workspace.findViewByKey() returns undefined when the view does not exist", function( assert ) {
    var workspace = new structurizr.Workspace({ id: 1 });
    assert.equal(workspace.findViewByKey('key'), undefined);
});

QUnit.test("Workspace.findViewByKey() returns the specified custom view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                customViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "Custom",
            "elements": [],
            "relationships": [],
            "animations": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified system landscape view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                systemLandscapeViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "SystemLandscape",
            "elements": [],
            "relationships": [],
            "animations": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified system context view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                systemContextViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "SystemContext",
            "elements": [],
            "relationships": [],
            "animations": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified container view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                containerViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "Container",
            "elements": [],
            "relationships": [],
            "animations": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified component view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                componentViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "Component",
            "elements": [],
            "relationships": [],
            "animations": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified dynamic view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                dynamicViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "Dynamic",
            "elements": [],
            "relationships": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified deployment view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                deploymentViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "Deployment",
            "environment": "Default",
            "elements": [],
            "relationships": [],
            "animations": []
          }
    );
});

QUnit.test("Workspace.findViewByKey() returns the specified filtered view", function( assert ) {
    var workspace = new structurizr.Workspace(
        {
             views: {
                filteredViews: [
                    {
                        key: 'key'
                    }
                ]
             } 
        }
    );
    assert.deepEqual(workspace.findViewByKey('key'),
        {
            "key": "key",
            "type": "Filtered"
        }
    );
});