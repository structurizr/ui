structurizr.Recommendations = class Recommendations {

    #workspace;
    #mandatory;

    #lowPriorityRecommendations = [];
    #mediumPriorityRecommendations = [];
    #highPriorityRecommendations = [];
    
    constructor(workspace, mandatory) {
        this.#workspace = workspace;
        this.#mandatory = mandatory;
        this.#generateRecommendations();
    }

    #isWorkspaceRecommendationEnabled(name) {
        if (this.#mandatory) {
            return true;
        } else {
            return this.#workspace.getProperty(structurizr.constants.RECOMMENDATIONS) !== 'false';
        }
    }

    #isModelRecommendationEnabled(name) {
        if (this.#mandatory) {
            return true;
        } else {
            return this.#workspace.getModelProperty(name) !== 'false';
        }
    }

    #isViewSetRecommendationEnabled(name) {
        if (this.#mandatory) {
            return true;
        } else {
            return this.#workspace.getViewSetProperty(name) !== 'false';
        }
    }

    #isViewRecommendationEnabled(view, name) {
        if (this.#mandatory) {
            return true;
        } else {
            var result = this.#isViewSetRecommendationEnabled(name);

            if (view.properties && view.properties[name]) {
                result = view.properties[name] !== 'false';
            }

            return result;
        }
    }

    #addLow(recommendation) {
        recommendation.priority = structurizr.constants.RECOMMENDATION_LOW_PRIORITY;
        this.#lowPriorityRecommendations.push(recommendation);
    }

    #addMedium(recommendation) {
        recommendation.priority = structurizr.constants.RECOMMENDATION_MEDIUM_PRIORITY;
        this.#mediumPriorityRecommendations.push(recommendation);
    }

    #addHigh(recommendation) {
        recommendation.priority = structurizr.constants.RECOMMENDATION_HIGH_PRIORITY;
        this.#highPriorityRecommendations.push(recommendation);
    }

    getRecommendations() {
        return this.#highPriorityRecommendations.concat(this.#mediumPriorityRecommendations.concat(this.#lowPriorityRecommendations));
    }

    #generateRecommendations() {
        if (!this.#isWorkspaceRecommendationEnabled(structurizr.constants.RECOMMENDATIONS)) {
            return;
        }

        this.#generateWorkspaceRecommendations();
        this.#generateModelRecommendations();
        this.#generateViewRecommendations();
    }

    #generateWorkspaceRecommendations() {
        const self = this;
        if (this.#isWorkspaceRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE)) {
            if (this.#workspace.getScope() === undefined) {
                self.#addHigh(
                    {
                        message: 'This workspace has no defined scope - the recommendation is to set the workspace scope to one of "Landscape" or "SoftwareSystem".',
                        type: structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE,
                        link: 'https://docs.structurizr.com/workspaces'
                    }
                );
            }

            var softwareSystemsWithDetails = 0;
            this.#workspace.getElements().forEach(function(element) {
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
                        message: 'This workspace describes the internal details of ' + softwareSystemsWithDetails + ' software systems - the recommendation is that a workspace contains the model, views, and documentation for a single software system only.',
                        type: structurizr.constants.RECOMMENDATIONS_WORKSPACE_SCOPE,
                        link: 'https://docs.structurizr.com/workspaces'
                    }
                );
            }
        }
    }

    #generateModelRecommendations() {
        const self = this;

        if (this.#isModelRecommendationEnabled(structurizr.constants.RECOMMENDATIONS)) {
            if (!this.#workspace.hasElements()) {
                self.#addHigh(
                    {
                        message: 'Add some elements to the model.'
                    }
                );
            }

            console.log(this.#workspace.getElements().length);
            this.#workspace.getElements().forEach(function(element) {
                console.log(element.name);
                if (self.#isModelRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.description')) {
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

                if (self.#isModelRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_MODEL_PREFIX + element.type.toLowerCase() + '.technology')) {
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
            });

            this.#workspace.getRelationships().forEach(function (relationship) {
                const source = self.#workspace.findElementById(relationship.sourceId);
                const destination = self.#workspace.findElementById(relationship.destinationId);

                if (self.#isModelRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_DESCRIPTION)) {
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

                if (self.#isModelRecommendationEnabled(structurizr.constants.RECOMMENDATIONS_RELATIONSHIP_TECHNOLOGY)) {
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

        if (self.#isViewSetRecommendationEnabled(structurizr.constants.RECOMMENDATIONS)) {
            if (!this.#workspace.hasViews()) {
                self.#addHigh(
                    {
                        message: 'Add some views to the workspace.'
                    }
                );
            }

            // // check for containers that are external to the scoped software system
            // this.#workspace.views.containerViews.forEach(function (view) {
            //     if (self.#isViewRecommendationEnabled(view, structurizr.constants.RECOMMENDATIONS)) {
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
            //     if (self.#isViewRecommendationEnabled(view, structurizr.constants.RECOMMENDATIONS)) {
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