QUnit.test("Empty workspace", function(assert) {
    const workspace = new structurizr.Workspace({});
    const recommendations = new structurizr.Recommendations(workspace).getRecommendations();

    assert.deepEqual(recommendations,
        [
            {
                "id": 1,
                "link": "https://docs.structurizr.com/workspaces",
                "message": "This workspace has no defined scope. It is recommended that the workspace scope is set to \"Landscape\" or \"SoftwareSystem\".",
                "priority": 1,
                "type": "structurizr.recommendations.workspace.scope"
            },
            {
                "id": 2,
                "message": "Add some elements to the model.",
                "priority": 1
            },
            {
                "id": 3,
                "message": "Add some views to the workspace.",
                "priority": 1
            }
        ]
    );
});

QUnit.test("Workspace recommendations can be disabled via a workspace property", function(assert) {
    const workspace = new structurizr.Workspace({
        properties: {
            'structurizr.recommendations': 'false'
        }
    });
    const recommendations = new structurizr.Recommendations(workspace).getRecommendations();

    assert.deepEqual(recommendations,
        [
        ]
    );
});

QUnit.test("Workspace scope recommendations can be disabled via a workspace property", function(assert) {
    const workspace = new structurizr.Workspace({
        model: {
            properties: {
                'structurizr.recommendations.model.element.noview': 'false'
            },
            softwareSystems: [
                {
                    id: 1,
                    name: 'A',
                    description: 'Description',
                    relationships: [
                        {
                            id: 3,
                            sourceId: 1,
                            destinationId: 2,
                            description: 'Uses'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'B',
                    description: 'Description'
                }
            ]
        },
        views: {
            systemLandscapeViews: [
                {
                    key: 'key'
                }
            ]
        },
        properties: {
            'structurizr.recommendations.workspace.scope': 'false'
        }
    });
    const recommendations = new structurizr.Recommendations(workspace).getRecommendations();

    assert.deepEqual(recommendations,
        [
        ]
    );
});

QUnit.test("Elements with no description or technology", function(assert) {
    const workspace = new structurizr.Workspace({
        model: {
            properties: {
                'structurizr.recommendations.model.element.noview': 'false'
            },
            people: [
                {
                    id: 1,
                    name: 'Name',
                    relationships: [
                        {
                            id: 101,
                            sourceId: 1,
                            destinationId: 2
                        }
                    ]
                }
            ],
            softwareSystems: [
                {
                    id: 2,
                    name: 'Software System',
                    containers: [
                        {
                            id: 3,
                            name: 'Container 1',
                            components: [
                                {
                                    id: 4,
                                    name: 'Component 1',
                                    relationships: [
                                        {
                                            id: 102,
                                            sourceId: 4,
                                            destinationId: 5
                                        }
                                    ]
                                },
                                {
                                    id: 5,
                                    name: 'Component 2'
                                }
                            ],
                            relationships: [
                                {
                                    id: 103,
                                    sourceId: 3,
                                    destinationId: 6
                                }
                            ]
                        },
                        {
                            id: 6,
                            name: 'Container 2',
                            components: []
                        }
                    ]
                }
            ]
        },
        views: {
            configuration: {
                properties: {
                    'structurizr.recommendations': 'false'
                }
            }
        },
        configuration: {
            scope: 'SoftwareSystem'
        }
    });
    const recommendations = new structurizr.Recommendations(workspace, false).getRecommendations();

    assert.deepEqual(recommendations,
        [
            {
                "id": 1,
                "message": "Add a description to the person named \"Name\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.person.description"
            },
            {
                "id": 2,
                "message": "Add a description to the software system named \"Software System\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.softwaresystem.description"
            },
            {
                "id": 3,
                "message": "Add a description to the container named \"Container 1\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.description"
            },
            {
                "id": 4,
                "message": "Add a technology to the container named \"Container 1\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.technology"
            },
            {
                "id": 5,
                "message": "Add a description to the component named \"Component 1\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.component.description"
            },
            {
                "id": 6,
                "message": "Add a technology to the component named \"Component 1\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.component.technology"
            },
            {
                "id": 7,
                "message": "Add a description to the component named \"Component 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.component.description"
            },
            {
                "id": 8,
                "message": "Add a technology to the component named \"Component 2\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.component.technology"
            },
            {
                "id": 9,
                "message": "Add a description to the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.description"
            },
            {
                "id": 10,
                "message": "Add a technology to the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.technology"
            },
            {
                "id": 11,
                "message": "Add a description to the relationship between the person named \"Name\" and the software system named \"Software System\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.relationship.description"
            },
            {
                "id": 12,
                "message": "Add a description to the relationship between the component named \"Component 1\" and the component named \"Component 2\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.relationship.description"
            },
            {
                "id": 13,
                "message": "Add a technology to the relationship between the component named \"Component 1\" and the component named \"Component 2\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.relationship.technology"
            },
            {
                "id": 14,
                "message": "Add a description to the relationship between the container named \"Container 1\" and the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.relationship.description"
            },
            {
                "id": 15,
                "message": "Add a technology to the relationship between the container named \"Container 1\" and the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.relationship.technology"
            }
        ]
    );
});

QUnit.test("Orphaned elements", function(assert) {
    const workspace = new structurizr.Workspace({
        model: {
            properties: {
                'structurizr.recommendations.model.element.noview': 'false'
            },
            people: [
                {
                    id: 1,
                    name: 'User',
                    description: 'Description'
                }
            ]
        },
        views: {
            systemLandscapeViews: [
                {
                    key: 'landscape'
                }
            ]
        },
        configuration: {
            scope: 'SoftwareSystem'
        }
    });
    const recommendations = new structurizr.Recommendations(workspace).getRecommendations();

    assert.deepEqual(recommendations,
        [
            {
                "id": 1,
                "message": "The person named \"User\" is orphaned - add a relationship to/from it, or consider removing it from the model.",
                "priority": 2,
                "type": "structurizr.recommendations.model.element.orphaned"
            }
        ]
    );
});

