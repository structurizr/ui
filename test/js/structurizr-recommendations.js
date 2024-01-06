QUnit.test("Empty workspace", function(assert) {
    const workspace = new structurizr.Workspace({});
    const recommendations = new structurizr.Recommendations(workspace, false).getRecommendations();

    assert.deepEqual(recommendations,
        [
            {
                "link": "https://docs.structurizr.com/workspaces",
                "message": "This workspace has no defined scope - the recommendation is to set the workspace scope to one of \"Landscape\" or \"SoftwareSystem\".",
                "priority": 1,
                "type": "structurizr.recommendations.workspace.scope"
            },
            {
                "message": "Add some elements to the model.",
                "priority": 1
            },
            {
                "message": "Add some views to the workspace.",
                "priority": 1
            }
        ]
    );
});

QUnit.test("Elements with no description or technology", function(assert) {
    const workspace = new structurizr.Workspace({
        model: {
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
        configuration: {
            scope: 'SoftwareSystem'
        }
    });
    const recommendations = new structurizr.Recommendations(workspace, false).getRecommendations();

    assert.deepEqual(recommendations,
        [
            {
                "message": "Add some views to the workspace.",
                "priority": 1
            },
            {
                "message": "Add a description to the person named \"Name\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.person.description"
            },
            {
                "message": "Add a description to the software system named \"Software System\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.softwaresystem.description"
            },
            {
                "message": "Add a description to the container named \"Container 1\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.description"
            },
            {
                "message": "Add a technology to the container named \"Container 1\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.technology"
            },
            {
                "message": "Add a description to the component named \"Component 1\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.component.description"
            },
            {
                "message": "Add a description to the component named \"Component 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.component.description"
            },
            {
                "message": "Add a description to the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.description"
            },
            {
                "message": "Add a technology to the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.container.technology"
            },
            {
                "message": "Add a description to the relationship between the person named \"Name\" and the software system named \"Software System\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.relationship.description"
            },
            {
                "message": "Add a description to the relationship between the container named \"Container 1\" and the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.relationship.description"
            },
            {
                "message": "Add a technology to the relationship between the container named \"Container 1\" and the container named \"Container 2\".",
                "priority": 2,
                "type": "structurizr.recommendations.model.relationship.technology"
            },
            {
                "message": "Add a technology to the component named \"Component 1\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.component.technology"
            },
            {
                "message": "Add a technology to the component named \"Component 2\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.component.technology"
            },
            {
                "message": "Add a description to the relationship between the component named \"Component 1\" and the component named \"Component 2\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.relationship.description"
            },
            {
                "message": "Add a technology to the relationship between the component named \"Component 1\" and the component named \"Component 2\".",
                "priority": 3,
                "type": "structurizr.recommendations.model.relationship.technology"
            }
        ]
    );
});

