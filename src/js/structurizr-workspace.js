// This is a read-only wrapper around a Structurizr workspace, providing some functions to assist with finding model elements and views.
structurizr.Workspace = class Workspace {

    #json;
    #workspace;
    #views = [];

    constructor(json) {
        this.#json = json;
        this.#workspace = JSON.parse(JSON.stringify(json));

        this.#initDocumentation();
        this.#initViews();
    }

    getId() {
        return this.#workspace.id !== undefined ? this.#workspace.id : -1;
    }

    #initDocumentation() {
        if (this.#workspace.documentation === undefined) {
            this.#workspace.documentation = {};
        }

        if (this.#workspace.documentation.sections === undefined) {
            this.#workspace.documentation.sections = [];
        }

        if (this.#workspace.documentation.decisions === undefined) {
            this.#workspace.documentation.decisions = [];
        }

        if (this.#workspace.documentation.images === undefined) {
            this.#workspace.documentation.images = [];
        }
    }

    getDocumentation() {
        return this.#workspace.documentation;
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

        if (this.#workspace.views.configuration.terminology === undefined) {
            this.#workspace.views.configuration.terminology = {};
        }

        if (this.#workspace.views.configuration.themes === undefined) {
            this.#workspace.views.configuration.themes = [];
        }

        if (this.#workspace.views.configuration.theme !== undefined) {
            if (this.#workspace.views.configuration.themes.indexOf(this.#workspace.views.configuration.theme) === -1) {
                this.#workspace.views.configuration.themes.push(this.#workspace.views.configuration.theme);
                delete this.#workspace.views.configuration.theme;
            }
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

    findViewByKey(key) {
        var view = undefined;
        this.#views.forEach(function(v) {
            if (v.key === key) {
                view = v;
            }
        });

        return view;
    };

}