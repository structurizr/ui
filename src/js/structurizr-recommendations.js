structurizr.Recommendations = class Recommendations {

    #workspace;
    #recommendations = [];

    constructor(workspace) {
        this.#workspace = workspace;
        this.#generateRecommendations();
    }

    #isRecommendationEnabled(name, ...propertyHolders) {
        var result = 'true';

        propertyHolders.forEach(function(propertyHolder) {
            if (propertyHolder) {
                if (propertyHolder.getProperty) {
                    if (propertyHolder.getProperty(name)) {
                        result = propertyHolder.getProperty(name);
                    }
                }
                if (propertyHolder.properties) {
                    if (propertyHolder.properties[name]) {
                        result = propertyHolder.properties[name];
                    }
                }
            }
        });

        return result.toLowerCase() !== 'false';
    }

    #addLow(recommendation) {
        recommendation.priority = structurizr.constants.RECOMMENDATION_LOW_PRIORITY;
        recommendation.id = this.#recommendations.length + 1;
        this.#recommendations.push(recommendation);
    }

    #addMedium(recommendation) {
        recommendation.priority = structurizr.constants.RECOMMENDATION_MEDIUM_PRIORITY;
        recommendation.id = this.#recommendations.length + 1;
        this.#recommendations.push(recommendation);
    }

    #addHigh(recommendation) {
        recommendation.priority = structurizr.constants.RECOMMENDATION_HIGH_PRIORITY;
        recommendation.id = this.#recommendations.length + 1;
        this.#recommendations.push(recommendation);
    }

    getRecommendations() {
        return this.#recommendations;
    }

    #generateRecommendations() {
        if (!this.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS, this.#workspace)) {
            return;
        }

        if (!this.#workspace.hasElements() && !this.#workspace.hasViews() && !this.#workspace.hasDocumentation() && !this.#workspace.hasDecisions()) {
            this.#addHigh(
                {
                    message: 'This workspace is empty. The browser-based DSL editor is the easiest way to get started without installing any tooling, but it does not provide access to the full feature set of the Structurizr DSL. It is recommended to use the Structurizr DSL in conjunction with the Structurizr CLI.',
                    link: '/dsl'
                }
            );
        } else {
            this.#generateWorkspaceScopeRecommendations();
            this.#generateModelRecommendations();
            this.#generateViewRecommendations();
        }
    }

    #generateWorkspaceScopeRecommendations() {
        const self = this;

        if (this.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE, this.#workspace)) {
            if (this.#workspace.getScope() === undefined) {
                self.#addHigh(
                    {
                        message: 'This workspace has no defined scope. It is recommended that the workspace scope is set to "Landscape" or "SoftwareSystem".',
                        type: structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE,
                        link: 'https://docs.structurizr.com/workspaces'
                    }
                );
            }
        }

        if (this.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE, this.#workspace, this.#workspace.model)) {
            var softwareSystemsWithDetails = 0;
            this.#workspace.getElements().forEach(function (element) {
                if (element.type === structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE) {
                    if (
                        (element.containers && element.containers.length > 0) ||
                        (element.documentation && element.documentation.sections && element.documentation.sections.length > 0) ||
                        (element.documentation && element.documentation.decisions && element.documentation.decisions.length > 0)
                    ) {
                        softwareSystemsWithDetails++;
                    }
                }
            });

            if (softwareSystemsWithDetails > 1) {
                self.#addHigh(
                    {
                        message: 'This workspace describes the internal details of ' + softwareSystemsWithDetails + ' software systems. It is recommended that a workspace contains the model, views, and documentation for a single software system only.',
                        type: structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE,
                        link: 'https://docs.structurizr.com/workspaces'
                    }
                );
            }
        }

        if (this.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE, this.#workspace, this.#workspace.views.configuration)) {
            const softwareSystemsWithSystemContextViews = [];
            const softwareSystemsWithContainerViews = [];
            this.#workspace.getViews().forEach(function(view) {
                if (view.type === structurizr.constants.SYSTEM_CONTEXT_VIEW_TYPE) {
                    if (softwareSystemsWithSystemContextViews.indexOf(view.softwareSystemId) === -1) {
                        softwareSystemsWithSystemContextViews.push(view.softwareSystemId);
                    }
                } else if (view.type === structurizr.constants.CONTAINER_VIEW_TYPE) {
                    if (softwareSystemsWithContainerViews.indexOf(view.softwareSystemId) === -1) {
                        softwareSystemsWithContainerViews.push(view.softwareSystemId);
                    }
                }
            });

            if (softwareSystemsWithSystemContextViews.length > 1) {
                self.#addHigh(
                    {
                        message: 'System context views exist for ' + softwareSystemsWithSystemContextViews.length + ' software systems. It is recommended that a workspace includes system context views for a single software system only.',
                        type: structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE,
                        link: 'https://docs.structurizr.com/workspaces'
                    }
                );
            }

            if (softwareSystemsWithContainerViews.length > 1) {
                self.#addHigh(
                    {
                        message: 'Container views exist for ' + softwareSystemsWithSystemContextViews.length + ' software systems. It is recommended that a workspace includes container views for a single software system only.',
                        type: structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE,
                        link: 'https://docs.structurizr.com/workspaces'
                    }
                );
            }
        }
    }

    #generateModelRecommendations() {
        const self = this;

        if (this.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS, this.#workspace, this.#workspace.model)) {
            if (!this.#workspace.hasElements()) {
                self.#addHigh(
                    {
                        message: 'Add some elements to the model.'
                    }
                );
            }

            const elementsWithRelationships = [];
            this.#workspace.getRelationships().forEach(function(relationship) {
                if (elementsWithRelationships.indexOf(relationship.sourceId) === -1) {
                    elementsWithRelationships.push(relationship.sourceId);
                }
                if (elementsWithRelationships.indexOf(relationship.destinationId) === -1) {
                    elementsWithRelationships.push(relationship.destinationId);
                }
            });

            const elementsInViews = [];
            this.#workspace.getViews().forEach(function(view) {
                if (view.elements) {
                    view.elements.forEach(function(elementView) {
                        if (elementsInViews.indexOf(elementView.id) === -1) {
                            elementsInViews.push(elementView.id);
                        }
                    });
                }
            });

            this.#workspace.getElements().forEach(function(element) {
                var parentElement = undefined;
                if (element.parentId !== undefined) {
                    parentElement = self.#workspace.findElementById(element.parentId);
                }

                if (self.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.description', self.#workspace, self.#workspace.model, parentElement, element)) {
                    if (element.description === undefined || element.description.trim() === '') {
                        if (element.type === structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE) {
                            self.#addLow(
                                {
                                    message: 'Add a description to the ' + self.#workspace.getTerminologyFor(element).toLowerCase() + ' named "' + element.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.description'
                                }
                            );
                        } else {
                            self.#addMedium(
                                {
                                    message: 'Add a description to the ' + self.#workspace.getTerminologyFor(element).toLowerCase() + ' named "' + element.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.description'
                                }
                            );
                        }
                    }
                }

                if (self.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.technology', self.#workspace, self.#workspace.model, parentElement, element)) {
                    if (element.technology === undefined || element.technology.trim() === '') {
                        if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
                            self.#addMedium(
                                {
                                    message: 'Add a technology to the ' + self.#workspace.getTerminologyFor(element).toLowerCase() + ' named "' + element.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.technology'
                                }
                            );
                        } else if (element.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) {
                            self.#addLow(
                                {
                                    message: 'Add a technology to the ' + self.#workspace.getTerminologyFor(element).toLowerCase() + ' named "' + element.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.technology'
                                }
                            );

                        }
                    }
                }

                if (self.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_MODEL_ORPHANED_ELEMENTS, self.#workspace, self.#workspace.model, parentElement, element)) {
                    if (element.type !== structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE) {
                        if (elementsWithRelationships.indexOf(element.id) === -1) {
                            self.#addMedium(
                                {
                                    message: 'The ' + self.#workspace.getTerminologyFor(element).toLowerCase() + ' named "' + element.name + '" is orphaned - add a relationship to/from it.',
                                    type: structurizr.constants.RECOMMENDATIONS_MODEL_ORPHANED_ELEMENTS
                                }
                            );
                        }
                    }
                }

                if (self.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_MODEL_ELEMENTS_NOT_INCLUDED_ON_VIEW, self.#workspace, self.#workspace.model, parentElement, element)) {
                    if (element.type !== structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE) {
                        if (elementsInViews.indexOf(element.id) === -1) {
                            self.#addLow(
                                {
                                    message: 'The ' + self.#workspace.getTerminologyFor(element).toLowerCase() + ' named "' + element.name + '" is not included on any views - add it to a view.',
                                    type: structurizr.constants.RECOMMENDATIONS_MODEL_ELEMENTS_NOT_INCLUDED_ON_VIEW
                                }
                            );
                        }
                    }
                }
            });

            this.#workspace.getRelationships().forEach(function(relationship) {
                const source = self.#workspace.findElementById(relationship.sourceId);
                var sourceParent;
                if (source.parentId !== undefined) {
                    sourceParent = self.#workspace.findElementById(source.parentId);
                }

                const destination = self.#workspace.findElementById(relationship.destinationId);
                var linkedRelationship = undefined;
                if (relationship.linkedRelationshipId !== undefined) {
                    linkedRelationship = self.#workspace.findRelationshipById(relationship.linkedRelationshipId);
                }

                if (self.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_DESCRIPTION, self.#workspace, self.#workspace.model, sourceParent, source, linkedRelationship, relationship)) {
                    if (relationship.description === undefined || relationship.description.trim() === '') {
                        if ((source.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) && destination.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) {
                            self.#addLow(
                                {
                                    message: 'Add a description to the relationship between the ' + self.#workspace.getTerminologyFor(source).toLowerCase() + ' named "' + source.name + '" and the ' + self.#workspace.getTerminologyFor(destination).toLowerCase() + ' named "' + destination.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_DESCRIPTION
                                }
                            );
                        } else {
                            self.#addMedium(
                                {
                                    message: 'Add a description to the relationship between the ' + self.#workspace.getTerminologyFor(source).toLowerCase() + ' named "' + source.name + '" and the ' + self.#workspace.getTerminologyFor(destination).toLowerCase() + ' named "' + destination.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_DESCRIPTION
                                }
                            );
                        }
                    }
                }

                if (self.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_TECHNOLOGY, self.#workspace, self.#workspace.model, sourceParent, source, linkedRelationship, relationship)) {
                    if (relationship.technology === undefined || relationship.technology.trim() === '') {
                        if ((source.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) && destination.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) {
                            self.#addLow(
                                {
                                    message: 'Add a technology to the relationship between the ' + self.#workspace.getTerminologyFor(source).toLowerCase() + ' named "' + source.name + '" and the ' + self.#workspace.getTerminologyFor(destination).toLowerCase() + ' named "' + destination.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_TECHNOLOGY
                                }
                            );
                        } else if (
                            (source.type === structurizr.constants.CONTAINER_ELEMENT_TYPE || source.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) &&
                            (destination.type === structurizr.constants.CONTAINER_ELEMENT_TYPE || destination.type === structurizr.constants.COMPONENT_ELEMENT_TYPE)) {
                            self.#addMedium(
                                {
                                    message: 'Add a technology to the relationship between the ' + self.#workspace.getTerminologyFor(source).toLowerCase() + ' named "' + source.name + '" and the ' + self.#workspace.getTerminologyFor(destination).toLowerCase() + ' named "' + destination.name + '".',
                                    type: structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_TECHNOLOGY
                                }
                            );
                        }
                    }
                }
            });
        }
    }

    #generateViewRecommendations() {
        const self = this;

        if (this.#isRecommendationEnabled(structurizr.constants.RECOMMENDATIONS, this.#workspace, this.#workspace.views.configuration)) {
            if (!this.#workspace.hasViews()) {
                this.#addHigh(
                    {
                        message: 'Add some views to the workspace.'
                    }
                );
            }

            // // check for containers that are external to the scoped software system
            // this.#workspace.views.containerViews.forEach(function (view) {
            //     if (self.#isRecommendationEnabled(view, structurizr.constants.RECOMMENDATIONS)) {
            //         const scopedSoftwareSystem = self.#workspace.findElementById(view.softwareSystemId);
            //         var hasContainersExternalToTheScopedSoftwareSystem = false;
            //
            //         view.elements.forEach(function (elementView) {
            //             const element = self.#workspace.findElementById(elementView.id);
            //             if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
            //                 if (element.parentId !== scopedSoftwareSystem.id) {
            //                     hasContainersExternalToTheScopedSoftwareSystem = true;
            //                 }
            //             }
            //         });
            //
            //         if (hasContainersExternalToTheScopedSoftwareSystem) {
            //             self.#addLow(
            //                 {
            //                     message: 'The container view "' + view.key + '" for the ' + self.#workspace.getTerminologyFor(scopedSoftwareSystem).toLowerCase() + ' named "' + scopedSoftwareSystem.name + '" includes containers that are external to the software system - the recommendation is to show external software systems rather than containers to reduce coupling of implementation details on your diagram.',
            //                     link: '/diagrams#' + view.key
            //                 }
            //             );
            //         }
            //     }
            // });
            //
            // // check for containers/components that are external to the scoped software system
            // this.#workspace.views.componentViews.forEach(function (view) {
            //     if (self.#isRecommendationEnabled(view, structurizr.constants.RECOMMENDATIONS)) {
            //         const scopedContainer = self.#workspace.findElementById(view.containerId);
            //         var hasElementsExternalToTheScopedSoftwareSystem = false;
            //
            //         view.elements.forEach(function (elementView) {
            //             var softwareSystemId;
            //
            //             const element = self.#workspace.findElementById(elementView.id);
            //             if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
            //                 softwareSystemId = element.parentId;
            //             } else if (element.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) {
            //                 const container = self.#workspace.findElementById(element.parentId);
            //                 softwareSystemId = container.parentId;
            //             }
            //
            //             if (softwareSystemId && softwareSystemId !== scopedContainer.parentId) {
            //                 hasElementsExternalToTheScopedSoftwareSystem = true;
            //             }
            //         });
            //
            //         if (hasElementsExternalToTheScopedSoftwareSystem) {
            //             self.#addLow(
            //                 {
            //                     priority: 3,
            //                     message: 'The component view "' + view.key + '" for the ' + self.#workspace.getTerminologyFor(scopedContainer).toLowerCase() + ' named "' + scopedContainer.name + '" includes elements that are external to the software system the container belongs to - the recommendation is to show external software systems rather than containers/components to reduce coupling of implementation details on your diagrams.',
            //                     link: '/diagrams#' + view.key
            //                 }
            //             );
            //         }
            //     }
            // });
        }
    }
}