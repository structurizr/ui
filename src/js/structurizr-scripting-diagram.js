structurizr.scripting.DiagramScripting = function(diagram) {

    this.isDiagramRendered = function() {
        return diagram.isRendered();
    };

    this.exportCurrentDiagramToPNG = function(options, callback) {
        if (options === undefined) {
            options = {};
        }

        if (options.includeMetadata === undefined) {
            options.includeMetadata = true;
        }

        if (options.crop === undefined) {
            options.crop = false;
        }

        return diagram.exportCurrentDiagramToPNG(options.includeMetadata, options.crop, callback);
    };

    this.exportCurrentDiagramKeyToPNG = function(callback) {
        return diagram.exportCurrentDiagramKeyToPNG(callback);
    };

    this.exportCurrentDiagramToSVG = function(options) {
        if (options === undefined) {
            options = {};
        }

        if (options.includeMetadata === undefined) {
            options.includeMetadata = true;
        }

        if (options.interactive === undefined) {
            options.interactive = false;
        }

        return diagram.exportCurrentDiagramToSVG(options.includeMetadata, options.interactive);
    };

    this.exportCurrentDiagramKeyToSVG = function() {
        return diagram.exportCurrentDiagramKeyToSVG();
    };

    this.exportDiagramsToOfflineHTMLPage = function(callback) {
        exportDiagramsToOfflineHtmlPage(callback);
    };

    this.getViews = function() {
        const views = [];

        structurizr.workspace.getViews().forEach(function(view) {
            views.push(
                {
                    key: view.key,
                    name: structurizr.ui.getViewName(view),
                    description: view.description ? view.description : '',
                    type: view.type
                }
            )
        });

        return views;
    };

    this.getViewKey = function() {
        return diagram.getCurrentViewOrFilter().key;
    };

    this.changeView = function(viewKey) {
        var view = structurizr.workspace.findViewByKey(viewKey);
        if (view) {
            diagram.changeView(viewKey);
        } else {
            throw 'A view with the key "' + viewKey + '" could not be found.';
        }
    };

    var workspaceSavedCallback = undefined;

    this.onWorkspaceSaved = function(callback) {
        workspaceSavedCallback = callback;
    };

    this.workspaceSaved = function() {
        if (workspaceSavedCallback) {
            workspaceSavedCallback();
        }
    };

};