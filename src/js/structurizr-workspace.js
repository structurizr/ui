// This is a read-only wrapper around a Structurizr workspace, providing some functions to assist with finding model elements and views.
structurizr.Workspace = class Workspace {

    #json;
    #workspace;
    #elementsById = {};
    #relationshipsById = {};
    #views = [];

    constructor(json) {
        this.#json = json;
        this.#workspace = JSON.parse(JSON.stringify(json));

        this.#initWorkspace();
        this.#initDocumentation(this.#workspace);
        this.#initModel();
        this.#initViews();
    }

    getJson() {
        return JSON.parse(JSON.stringify(this.#json));
    }

    getId() {
        return this.#workspace.id !== undefined ? this.#workspace.id : -1;
    }

    getName() {
        return this.#workspace.name ? this.#workspace.name : "";
    };

    getDescription() {
        return this.#workspace.description ? this.#workspace.description : "";
    };

    getLastModifiedDate() {
        return this.#workspace.lastModifiedDate;
    };

    getProperty(name) {
        return this.#workspace.properties[name];
    }

    getDocumentation() {
        return this.#workspace.documentation;
    }

    getModel() {
        return this.#workspace.model;
    }

    getViews() {
        return this.#workspace.views;
    }

    #initWorkspace() {
        if (this.#workspace.properties === undefined) {
            this.#workspace.properties = {};
        }
    }

    #initDocumentation(workspaceOrElement) {
        if (workspaceOrElement.documentation === undefined) {
            workspaceOrElement.documentation = {};
        }

        if (workspaceOrElement.documentation.sections === undefined) {
            workspaceOrElement.documentation.sections = [];
        }

        if (workspaceOrElement.documentation.decisions === undefined) {
            workspaceOrElement.documentation.decisions = [];
        }

        if (workspaceOrElement.documentation.images === undefined) {
            workspaceOrElement.documentation.images = [];
        }
    }

    hasDocumentation() {
        // check for workspace level sections
        if (this.#workspace.documentation.sections.length > 0) {
            return true;
        }

        var result = false;
        this.#workspace.model.softwareSystems.forEach(function(softwareSystem) {
            if (softwareSystem.documentation.sections.length > 0) {
                result = true;
            }

            if (result === false) {
                if (softwareSystem.containers) {
                    softwareSystem.containers.forEach(function (container) {
                        if (container.documentation.sections.length > 0) {
                            result = true;
                        }
                    });
                }
            }
        });

        return result;
    }

    hasDecisions() {
        // check for workspace level decisions
        if (this.#workspace.documentation.decisions.length > 0) {
            return true;
        }

        var result = false;
        this.#workspace.model.softwareSystems.forEach(function(softwareSystem) {
            if (softwareSystem.documentation.decisions.length > 0) {
                result = true;
            }

            if (result === false) {
                if (softwareSystem.containers) {
                    softwareSystem.containers.forEach(function (container) {
                        if (container.documentation.decisions.length > 0) {
                            result = true;
                        }
                    });
                }
            }
        });

        return result;
    }

    #initModel() {
        if (this.#workspace.model === undefined) {
            this.#workspace.model = {};
        }

        var model = this.#workspace.model;

        if (model.customElements) {
            this.#sortArrayByNameAscending(model.customElements);
            for (i = 0; i < model.customElements.length; i++) {
                var customElement = model.customElements[i];
                customElement.parentId = undefined;
                this.#registerElement(customElement, structurizr.constants.CUSTOM_ELEMENT_TYPE);
            }
        } else {
            model.customElements = [];
        }

        if (model.people) {
            this.#sortArrayByNameAscending(model.people);
            for (i = 0; i < model.people.length; i++) {
                var person = model.people[i];
                person.parentId = undefined;
                this.#registerElement(person, structurizr.constants.PERSON_ELEMENT_TYPE);
            }
        } else {
            model.people = [];
        }

        if (model.softwareSystems) {
            this.#sortArrayByNameAscending(model.softwareSystems);
            for (i = 0; i < model.softwareSystems.length; i++) {
                var softwareSystem = model.softwareSystems[i];
                softwareSystem.parentId = undefined;
                this.#registerElement(softwareSystem, structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE);

                if (softwareSystem.containers) {
                    this.#sortArrayByNameAscending(softwareSystem.containers);
                    for (var j = 0; j < softwareSystem.containers.length; j++) {
                        var container = softwareSystem.containers[j];
                        container.parentId = softwareSystem.id;
                        this.#registerElement(container, structurizr.constants.CONTAINER_ELEMENT_TYPE);

                        if (container.components) {
                            this.#sortArrayByNameAscending(container.components);
                            for (var k = 0; k < container.components.length; k++) {
                                var component = container.components[k];
                                component.parentId = container.id;
                                this.#registerElement(component, structurizr.constants.COMPONENT_ELEMENT_TYPE);
                            }
                        }

                        this.#initDocumentation(container);
                    }
                }

                this.#initDocumentation(softwareSystem);
            }
        } else {
            model.softwareSystems = [];
        }

        if (model.deploymentNodes) {
            this.#sortArrayByNameAscending(model.deploymentNodes);
            for (var i = 0; i < model.deploymentNodes.length; i++) {
                const deploymentNode = model.deploymentNodes[i];
                this.#registerDeploymentNode(deploymentNode, undefined);
            }
        } else {
            model.deploymentNodes = [];
        }
    }

    #registerDeploymentNode(deploymentNode, parent) {
        if (parent === undefined) {
            deploymentNode.parentId = undefined;
        } else {
            deploymentNode.parentId = parent.id;
        }

        if (deploymentNode.environment === undefined) {
            deploymentNode.environment = structurizr.constants.DEFAULT_DEPLOYMENT_ENVIRONMENT_NAME;
        }

        this.#registerElement(deploymentNode, structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE);

        if (deploymentNode.children) {
            this.#sortArrayByNameAscending(deploymentNode.children);
            for (var i = 0; i < deploymentNode.children; i++) {
                const child = deploymentNode.children[i];
                this.#registerDeploymentNode(child, deploymentNode);
            }
        } else {
            deploymentNode.children = [];
        }

        if (deploymentNode.softwareSystemInstances) {
            for (var i = 0; i < deploymentNode.softwareSystemInstances.length; i++) {
                const softwareSystemInstance = deploymentNode.softwareSystemInstances[i];
                const softwareSystem = this.findElementById(softwareSystemInstance.softwareSystemId);
                softwareSystemInstance.name = softwareSystem.name;
                softwareSystemInstance.description = softwareSystem.description;

                if (softwareSystemInstance.environment === undefined) {
                    softwareSystemInstance.environment = deploymentNode.environment;
                }

                this.#registerElement(softwareSystemInstance, structurizr.constants.SOFTWARE_SYSTEM_INSTANCE_ELEMENT_TYPE);
            }
        } else {
            deploymentNode.softwareSystemInstances = [];
        }

        if (deploymentNode.containerInstances) {
            for (var i = 0; i < deploymentNode.containerInstances.length; i++) {
                const containerInstance = deploymentNode.containerInstances[i];
                const container = this.findElementById(containerInstance.containerId);
                containerInstance.name = container.name;
                containerInstance.description = container.description;
                containerInstance.technology = container.technology;
                containerInstance.parentId = deploymentNode.id;

                if (containerInstance.environment === undefined) {
                    containerInstance.environment = deploymentNode.environment;
                }

                this.#registerElement(containerInstance, "ContainerInstance");
            }
        } else {
            deploymentNode.containerInstances = [];
        }

        if (deploymentNode.infrastructureNodes) {
            for (var i = 0; i < deploymentNode.infrastructureNodes.length; i++) {
                const infrastructureNode = deploymentNode.infrastructureNodes[i];
                infrastructureNode.parentId = deploymentNode.id;
                if (infrastructureNode.environment === undefined) {
                    infrastructureNode.environment = deploymentNode.environment;
                }
                this.#registerElement(infrastructureNode, structurizr.constants.INFRASTRUCTURE_NODE_ELEMENT_TYPE);
            }
        } else {
            deploymentNode.infrastructureNodes = [];
        }
    }

    #registerElement(element, type) {
        if (element) {
            element.type = type;

            this.#elementsById[element.id] = element;
            this.#sortProperties(element);

            if (element.relationships) {
                for (var i = 0; i < element.relationships.length; i++) {
                    this.#registerRelationship(element.relationships[i]);
                }
            }
        }
    }

    hasElements() {
        return Object.keys(this.#elementsById).length > 0;
    }

    findElementById(id) {
        return this.#elementsById[id];
    }

    getAllTagsForElement(element) {
        var tags = (element.tags ? element.tags : '');

        if (element.type === structurizr.constants.SOFTWARE_SYSTEM_INSTANCE_ELEMENT_TYPE) {
            // we also need to prepend the set of tags of the software system
            const softwareSystem = Structurizr.workspace.findElement(element.softwareSystemId);
            if (softwareSystem && softwareSystem.tags) {
                tags = (softwareSystem.tags + ',' + tags);
            }
        } else if (element.type === structurizr.constants.CONTAINER_INSTANCE_ELEMENT_TYPE) {
            // we also need to prepend the set of tags of the container
            const container = Structurizr.workspace.findElement(element.containerId);
            if (container && container.tags) {
                tags = (container.tags + ',' + tags);
            }
        }

        return tags;
    }

    getAllTagsForRelationship(relationship) {
        var tags = '';
        if (relationship.tags) {
            tags = relationship.tags;
        }

        var linkedRelationshipId = relationship.linkedRelationshipId;
        while (linkedRelationshipId !== undefined) {
            // we also need to prepend the set of tags of the linked relationship
            var linkedRelationship = this.findRelationship(linkedRelationshipId);
            if (linkedRelationship && linkedRelationship.tags) {
                tags = linkedRelationship.tags + ',' + tags;
            }

            linkedRelationshipId = linkedRelationship.linkedRelationshipId;
        }

        return tags;
    }

    #registerRelationship(relationship) {
        this.#relationshipsById[relationship.id] = relationship;
        this.#sortProperties(relationship);
    }

    findRelationshipById(id) {
        return this.#relationshipsById[id];
    }

    #initViews() {
        const self = this;

        if (this.#workspace.views === undefined) {
            this.#workspace.views = {};
        }

        if (this.#workspace.views.customViews === undefined) {
            this.#workspace.views.customViews = [];
        }

        this.#workspace.views.customViews.forEach(function(view) {
            view.type = structurizr.constants.CUSTOM_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.systemLandscapeViews === undefined) {
            this.#workspace.views.systemLandscapeViews = [];
        }

        this.#workspace.views.systemLandscapeViews.forEach(function(view) {
            view.type = structurizr.constants.SYSTEM_LANDSCAPE_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.systemContextViews === undefined) {
            this.#workspace.views.systemContextViews = [];
        }

        this.#workspace.views.systemContextViews.forEach(function(view) {
            view.type = structurizr.constants.SYSTEM_CONTEXT_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.containerViews === undefined) {
            this.#workspace.views.containerViews = [];
        }

        this.#workspace.views.containerViews.forEach(function(view) {
            view.type = structurizr.constants.CONTAINER_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.componentViews === undefined) {
            this.#workspace.views.componentViews = [];
        }

        this.#workspace.views.componentViews.forEach(function(view) {
            view.type = structurizr.constants.COMPONENT_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.dynamicViews === undefined) {
            this.#workspace.views.dynamicViews = [];
        }

        this.#workspace.views.dynamicViews.forEach(function(view) {
            view.type = structurizr.constants.DYNAMIC_VIEW_TYPE;
            self.#registerView(view);

            // and sort the relationships
            view.relationships.sort(function(a, b) {
                if (a.order === b.order) {
                    return a.id - b.id;
                } else {
                    return a.order - b.order
                }
            });
        });

        if (this.#workspace.views.deploymentViews === undefined) {
            this.#workspace.views.deploymentViews = [];
        }

        this.#workspace.views.deploymentViews.forEach(function(view) {
            if (view.environment === undefined || view.environment.trim().length === 0) {
                view.environment = structurizr.constants.DEFAULT_DEPLOYMENT_ENVIRONMENT_NAME;
            }

            view.type = structurizr.constants.DEPLOYMENT_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.filteredViews === undefined) {
            this.#workspace.views.filteredViews = [];
        }

        this.#workspace.views.filteredViews.forEach(function(view) {
            view.type = structurizr.constants.FILTERED_VIEW_TYPE;
            self.#registerView(view);
        });

        if (this.#workspace.views.configuration === undefined) {
            this.#workspace.views.configuration = {};
        }

        if (this.#workspace.views.configuration.styles === undefined) {
            this.#workspace.views.configuration.styles = {};
        }

        if (this.#workspace.views.configuration.styles.elements === undefined) {
            this.#workspace.views.configuration.styles.elements = [];
        }

        if (this.#workspace.views.configuration.styles.relationships === undefined) {
            this.#workspace.views.configuration.styles.relationships = [];
        }

        if (this.#workspace.views.configuration.branding === undefined) {
            this.#workspace.views.configuration.branding = {};
        }

        if (this.#workspace.views.configuration.branding.font === undefined) {
            this.#workspace.views.configuration.branding.font = {
                name: 'Open Sans',
                url: undefined
            }
        }

        if (this.#workspace.views.configuration.terminology === undefined) {
            this.#workspace.views.configuration.terminology = {};
        }

        if (this.#workspace.views.configuration.themes === undefined) {
            this.#workspace.views.configuration.themes = [];
        }
    }

    #registerView(view) {
        this.#views.push(view);

        if (view.type !== structurizr.constants.FILTERED_VIEW_TYPE) {
            if (view.elements === undefined) {
                view.elements = [];
            }

            if (view.relationships === undefined) {
                view.relationships = [];
            }
        }

        if (view.type !== structurizr.constants.FILTERED_VIEW_TYPE && view.type !== structurizr.constants.DYNAMIC_VIEW_TYPE) {
            if (view.animations === undefined) {
                view.animations = [];
            }

            view.animations.forEach(function(animationStep) {
                if (animationStep.elements === undefined) {
                    animationStep.elements = [];
                }
                if (animationStep.relationships === undefined) {
                    animationStep.relationships = [];
                }
            });
        }
    }

    hasViews() {
        return this.#views.length > 0;
    }

    hasStyles() {
        return this.#workspace.views.configuration.styles.elements.length > 0 || this.#workspace.views.configuration.styles.relationships.length > 0;
    }

    findElementStyleByTag(tag) {
        var style = undefined;

        this.#workspace.views.configuration.styles.elements.forEach(function(elementStyle) {
            if (elementStyle.tag === tag) {
                style = elementStyle;
            }
        })

        return style;
    }

    getBranding() {
        return this.#workspace.views.configuration.branding;
    }

    findViewByKey(key) {
        var view = undefined;
        this.#views.forEach(function(v) {
            if (v.key === key) {
                view = v;
            }
        });

        return view;
    };

    #getTerminology(key, defaultValue) {
        if (this.#workspace.views.configuration.terminology.hasOwnProperty(key)) {
            return this.#workspace.views.configuration.terminology[key];
        } else {
            return defaultValue;
        }
    }

    getTerminologyFor(item) {
        if (item.type === 'Person') {
            return this.#getTerminology('person', 'Person');
        } else if (item.type === 'SoftwareSystem' || item.type === "SoftwareSystemInstance") {
            return this.#getTerminology('softwareSystem', 'Software System');
        } else if (item.type === 'Container' || item.type === "ContainerInstance") {
            return this.#getTerminology('container', 'Container');
        } else if (item.type === 'Component') {
            return this.#getTerminology('component', 'Component');
        } else if (item.type === 'DeploymentNode') {
            return this.#getTerminology('deploymentNode', 'Deployment Node');
        } else if (item.type === 'InfrastructureNode') {
            return this.#getTerminology('infrastructureNode', 'Infrastructure Node');
        } else if (item.type === "Enterprise") {
            return this.#getTerminology('enterprise', 'Enterprise');
        } else if (item.sourceId && item.destinationId) {
            return this.#getTerminology('relationship', 'Relationship');
        }

        return '';
    }

    #sortArrayByNameAscending(array) {
        array.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        })
    }

    #sortProperties(modelItem) {
        if (modelItem.properties) {
            var orderedProperties = {};
            Object.keys(modelItem.properties).sort().forEach(function(key) {
                orderedProperties[key] = modelItem.properties[key];
            });

            modelItem.properties = orderedProperties;
        }
    }

}