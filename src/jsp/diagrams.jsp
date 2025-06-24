<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>

<%-- JointJS --%>
<link href="${structurizrConfiguration.cdnUrl}/css/joint-3.6.5.css" rel="stylesheet" media="screen" />
<script src="${structurizrConfiguration.cdnUrl}/js/lodash-4.17.21.js"></script>
<script src="${structurizrConfiguration.cdnUrl}/js/backbone-1.4.1.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/joint-3.6.5.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/dagre-0.7.3.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/graphlib-2.1.3.min.js"></script>

<%-- PNG export --%>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/rgbcolor.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/canvg-1.5.4.js"></script>

<%-- creating animated GIFs --%>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/gifshot-0.4.4.js"></script>

<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-diagram${structurizrConfiguration.versionSuffix}.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-healthcheck${structurizrConfiguration.versionSuffix}.js"></script>

<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-diagram.css" rel="stylesheet" media="screen" />

<c:if test="${structurizrConfiguration.type ne 'lite'}">
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-lock${structurizrConfiguration.versionSuffix}.js"></script>
</c:if>

<c:choose>
    <c:when test="${workspace.editable eq false && embed eq true && showDiagramSelector eq true}">
        <%-- embedded mode, with the diagram selector --%>
        <div id="diagramControls" class="form-group centered" style="margin-bottom: 0px;">
            <div class="btn-group">
                <select id="viewType" class="form-control" style="font-size: 12px;"></select>
            </div>
        </div>
    </c:when>
    <c:when test="${workspace.editable eq false && embed eq true && showDiagramSelector eq false}">
        <%-- embedded mode, without the diagram selector --%>
    </c:when>
    <c:otherwise>
        <div id="diagramControls">
            <c:choose>
                <c:when test="${embed eq true}">
                    <div class="centered">
                        <%@ include file="/WEB-INF/fragments/diagrams/controls.jspf" %>
                    </div>
                </c:when>
                <c:otherwise>
                    <div id="banner"></div>
                    <div class="row">
                        <div class="col-sm-2" style="padding: 18px 20px 10px 20px">
                            <a href="<c:out value="${urlPrefix}" /><c:out value="${urlSuffix}" escapeXml="false" />"><img src="${structurizrConfiguration.cdnUrl}/img/structurizr-banner.png" alt="Structurizr" class="structurizrBannerLight img-responsive brandingLogo" /><img src="${structurizrConfiguration.cdnUrl}/img/structurizr-banner-dark.png" alt="Structurizr" class="structurizrBannerDark img-responsive brandingLogo" /></a>
                        </div>
                        <div class="col-sm-10 centered" style="padding: 20px 30px 0px 30px">
                            <div class="centered">
                                <%@ include file="/WEB-INF/fragments/diagrams/controls.jspf" %>
                            </div>
                        </div>
                    </div>
                </c:otherwise>
            </c:choose>
        </div>
    </c:otherwise>
</c:choose>

<div class="row" style="padding: 0; margin: 0">
    <div id="diagramNavigationPanel" class="col-sm-2 hidden-xs hidden-sm <c:if test="${embed eq true}">hidden</c:if>">
        <c:if test="${not empty workspace.branch || not empty param.version}">
        <div style="margin-top: 20px">
            <c:if test="${not empty workspace.branch}">
            <div class="centered" style="margin-bottom: 10px;">
                <span class="label label-branch"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/bezier2.svg" class="icon-sm icon-white" /> ${workspace.branch}</span>
            </div>
            </c:if>
            <c:if test="${not empty param.version}">
            <div class="centered" style="margin-bottom: 10px;">
                <span class="label label-version"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/clock-history.svg" class="icon-sm icon-white" /> ${workspace.internalVersion}</span>
            </div>
            </c:if>
        </div>
        </c:if>

        <div id="diagramNavigation" style="padding-top: 15px"></div>

        <div class="centered" style="margin-bottom: 20px">
            <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/moon.svg" class="icon-sm" />
            <a id="renderingModeLightLink" href="">Light</a> |
            <a id="renderingModeDarkLink" href="">Dark</a> |
            <a id="renderingModeSystemLink" href="">System</a>
        </div>
    </div>

    <div class="col-sm-10" style="padding: 0">
        <div id="diagram" tabindex="1" style="position: relative; <c:if test="${embed}">background: transparent;</c:if>">
            <%@ include file="/WEB-INF/fragments/progress-message.jspf" %>
            <%@ include file="/WEB-INF/fragments/diagrams/key.jspf" %>
            <%@ include file="/WEB-INF/fragments/quick-navigation.jspf" %>
            <%@ include file="/WEB-INF/fragments/tooltip.jspf" %>
            <%@ include file="/WEB-INF/fragments/diagrams/navigation.jspf" %>
        </div>
    </div>
</div>

<div id="embeddedControls" style="text-align: right; position: absolute; bottom: 10px; right: 10px; opacity: 0.1; z-index: 100;">
    <div class="btn-group">
        <button id="zoomOutButton" class="btn btn-default" title="Zoom out [-]"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/zoom-out.svg" class="icon-btn" /></button>
        <button id="enterPresentationModeButton" class="btn btn-default hidden" title="Enter Presentation Mode [p]"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/easel.svg" class="icon-btn" /></button>
        <button id="zoomInButton" class="btn btn-default" title="Zoom in [+]"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/zoom-in.svg" class="icon-btn" /></button>
    </div>
    <script nonce="${scriptNonce}">
        $('#zoomOutButton').click(function() { structurizr.diagram.zoomOut(); });
        $('#enterPresentationModeButton').click(function() { enterPresentationMode(); });
        $('#zoomInButton').click(function() { structurizr.diagram.zoomIn(); });
    </script>

    <div class="btn-group">
        <button id="stepBackwardInAnimationButton" class="btn btn-default hidden dynamicDiagramButton stepBackwardAnimationButton" title="Step backward [,]"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/skip-backward.svg" class="icon-btn" /></button>
        <button id="startAnimationButton" class="btn btn-default hidden dynamicDiagramButton startAnimationButton" title="Play animation"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/play.svg" class="icon-btn" /></button>
        <button id="stopAnimationButton" class="btn btn-default hidden dynamicDiagramButton stopAnimationButton" title="Stop animation"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/stop.svg" class="icon-btn" /></button>
        <button id="stepForwardInAnimationButton" class="btn btn-default hidden dynamicDiagramButton stepForwardAnimationButton" title="Step forward [.]"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/skip-forward.svg" class="icon-btn" /></button>
    </div>
    <script nonce="${scriptNonce}">
        $('#stepBackwardInAnimationButton').click(function() { stepBackwardInAnimation(); });
        $('#startAnimationButton').click(function() { startAnimation(true); });
        $('#stopAnimationButton').click(function() { stopAnimation(true); });
        $('#stepForwardInAnimationButton').click(function() { stepForwardInAnimation(); });
    </script>

    <c:if test="${embed eq true}">
    <div class="modelViewButtons btn-group">
        <button id="embeddedShowKeyButton" class="btn btn-default" title="Diagram key [i]"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/info-circle.svg" class="icon-btn" /></button>
    </div>
    <script nonce="${scriptNonce}">
        $('#embeddedShowKeyButton').click(function() { showKey(); });
    </script>

    <div class="btn-group">
        <button id="backEmbeddedButton" class="btn btn-default backButton" title="Go back to previous diagram"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/arrow-90deg-left.svg" class="icon-btn" /></button>

        <c:if test="${workspace.id > 0 && (embed eq true && workspace.editable eq false)}">
        <button id="openCurrentDiagramInNewWindowEmbeddedButton" class="btn btn-default" title="Link to this diagram"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/link.svg" class="icon-btn" /></button>
        </c:if>
        <button id="exportToPNGEmbeddedButton" class="btn btn-default" title="Export diagram and key/legend to PNG"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/filetype-png.svg" class="icon-btn" /></button>
    </div>
    <script nonce="${scriptNonce}">
        $('#backEmbeddedButton').click(function() { back(); });
        $('#openCurrentDiagramInNewWindowEmbeddedButton').click(function() { openCurrentDiagramInNewWindow(); });
        $('#exportToPNGEmbeddedButton').click(function() { exportToPNG(); });
    </script>
    </c:if>
</div>

<%@ include file="/WEB-INF/fragments/graphviz.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/embed.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/export.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/publish.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/perspectives.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/tags.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/autolayout.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/no-views-model.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/lasso.jspf" %>
<%@ include file="/WEB-INF/fragments/diagrams/review.jspf" %>

<script nonce="${scriptNonce}">

    progressMessage.show('<p>Loading workspace...</p>');

    const DARK_MODE_COOKIE_NAME = 'structurizr.darkMode';
    structurizr.ui.DEFAULT_FONT_NAME = "Open Sans";
    structurizr.ui.DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css?family=Open+Sans:400,700';

    $('#renderingModeLightLink').click(function(event) {
        event.preventDefault();
        structurizr.ui.setRenderingMode(structurizr.ui.RENDERING_MODE_LIGHT);
        structurizr.diagram.setDarkMode(structurizr.ui.isDarkMode());
    });

    $('#renderingModeDarkLink').click(function(event) {
        event.preventDefault();
        structurizr.ui.setRenderingMode(structurizr.ui.RENDERING_MODE_DARK);
        structurizr.diagram.setDarkMode(structurizr.ui.isDarkMode());
    });

    $('#renderingModeSystemLink').click(function(event) {
        event.preventDefault();
        structurizr.ui.setRenderingMode(structurizr.ui.RENDERING_MODE_SYSTEM);
        structurizr.diagram.setDarkMode(structurizr.ui.isDarkMode());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (structurizr.ui.getRenderingMode() === structurizr.ui.RENDERING_MODE_SYSTEM) {
            structurizr.diagram.setDarkMode(structurizr.ui.isDarkMode());
        }
    });

    var embed = ${embed};
    var diagramSelector = ${showDiagramSelector eq true};
    var views;
    const viewKeys = [];
    var viewsVisited = new structurizr.util.Stack();
    var unsavedChanges = false;
    var publishThumbnails = ${publishThumbnails};
    var presentationMode = false;
    var healthCheck;

    function workspaceLoaded() {
        if (!structurizr.workspace.hasViews()) {
            openNoViewsModal();

            structurizr.scripting = new function() {
                this.isDiagramRendered = function() {
                    return true;
                };

                this.getViews = function() {
                    return [];
                };
            };

            return;
        } else {
            views = structurizr.workspace.getViews();
        }

        structurizr.ui.loadThemes('${structurizrConfiguration.themesUrl}', function() {
            init();
        });
    }

    function init() {
        structurizr.ui.applyBranding();

        structurizr.diagram = new structurizr.ui.Diagram('diagram', ${workspace.editable}, diagramCreated);
        structurizr.diagram.setEmbedded(${embed});
        structurizr.diagram.setDarkMode(structurizr.ui.isDarkMode());

        structurizr.diagram.setTooltip(tooltip);
        structurizr.diagram.setLasso(lasso);
        structurizr.diagram.setNavigationEnabled(true);
        structurizr.diagram.onWorkspaceChanged(workspaceChanged);
        structurizr.diagram.onElementDoubleClicked(elementDoubleClicked);
        structurizr.diagram.onRelationshipDoubleClicked(relationshipDoubleClicked);
        structurizr.diagram.onElementsSelected(toggleMultiSelectButtons);
        structurizr.diagram.onViewChanged(viewChanged);
        structurizr.diagram.onAnimationStarted(animationStarted);
        structurizr.diagram.onAnimationStopped(animationStopped);
        structurizr.scripting = new function() {

            this.isDiagramRendered = function() {
                return structurizr.diagram.isRendered();
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

                return structurizr.diagram.exportCurrentDiagramToPNG(options.includeMetadata, options.crop, callback);
            };

            this.exportCurrentDiagramKeyToPNG = function(callback) {
                return structurizr.diagram.exportCurrentDiagramKeyToPNG(callback);
            };

            this.exportCurrentDiagramToSVG = function(options) {
                if (options === undefined) {
                    options = {};
                }

                if (options.includeMetadata === undefined) {
                    options.includeMetadata = true;
                }

                var svg = structurizr.diagram.exportCurrentDiagramToSVG(options.includeMetadata, true);
                svg = replaceLocalThemes(svg);

                return svg;
            };

            this.exportCurrentDiagramKeyToSVG = function() {
                var svg = structurizr.diagram.exportCurrentDiagramKeyToSVG(true);
                svg = replaceLocalThemes(svg);

                return svg;
            };

            this.getViews = function() {
                const views = [];

                structurizr.workspace.getViews().forEach(function(view) {
                    views.push(
                        {
                            key: view.key,
                            name: structurizr.ui.getTitleForView(view),
                            description: view.description ? view.description : '',
                            type: view.type
                        }
                    )
                });

                return views;
            };

            this.getViewKey = function() {
                return structurizr.diagram.getCurrentViewOrFilter().key;
            };

            this.getView = function() {
                return structurizr.diagram.getCurrentViewOrFilter();
            }

            this.changeView = function(viewKey) {
                const view = structurizr.workspace.findViewByKey(viewKey);
                if (view) {
                    changeView(view);
                } else {
                    throw 'A view with the key "' + viewKey + '" could not be found.';
                }
            };

        };

        initEmbed();
        initPerspectives();
        initTags();
        initAutoLayout();
        initReview();
        healthCheck = new structurizr.HealthCheck(updateHealth);

        <c:if test="${not empty perspective}">
        structurizr.diagram.changePerspective('<c:out value="${perspective}" />');
        tooltip.disable();
        toggleTooltip();
        </c:if>

        <c:if test="${showDiagramSelector eq true}">
        initDiagramSelector();
        </c:if>

        initQuickNavigation();
        initExports();
        initSizing();
        initControls();
        initKeyboardShortcuts();

        <c:if test="${structurizrConfiguration.type ne 'lite'}">
        <c:if test="${workspace.editable && workspace.ownerUserType.allowedToLockWorkspaces && not empty workspace.apiKey}">
        new structurizr.Lock(${workspace.id}, '${userAgent}');
        </c:if>
        </c:if>

        progressMessage.hide();
    }

    function viewChanged(key) {
        $('#keyModal').modal('hide');

        // set the view key in the embed code modal
        $('.diagramEmbedDiagramId').text(key);

        const view = structurizr.workspace.findViewByKey(key);

        $('#diagramControls').removeClass('hidden');
        $('#undoButton').prop('disabled', true);

        if (viewsVisited.peek() !== key) {
            viewsVisited.push(key);
        }
        $('.backButton').attr("disabled", viewsVisited.count() === 1);

        selectDiagramByView(view);
        const editable = structurizr.diagram.isEditable();

        healthCheck.stop();

        if (view.type === structurizr.constants.IMAGE_VIEW_TYPE) {
            if (embed) {
                $('#diagramControls').addClass('hidden');
            }
            $('#diagramEditButtons').addClass('hidden');
            $('#diagramNotEditableMessage').addClass('hidden');
            $('#editDiagramButton').addClass('hidden');
            $('.modelViewButtons').addClass('hidden');

            structurizr.diagram.resize();
            structurizr.diagram.zoomToWidthOrHeight();

            return;
        }

         $('.modelViewButtons').removeClass('hidden');

        if (editable) {
            $('#diagramEditButtons').removeClass('hidden');
        } else {
            $('#diagramEditButtons').addClass('hidden');

            if (embed && !diagramSelector) {
                $('#diagramControls').addClass('hidden');
            }
        }

        // disable some UI elements based upon whether the diagram is editable
        $('#autoLayoutButton').prop('disabled', !editable);
        getPageSizeDropDown().prop('disabled', !editable);

        $('.multipleElementsSelectedButton').prop('disabled', true);

        if (
            view.type === structurizr.constants.SYSTEM_CONTEXT_VIEW_TYPE ||
            view.type === structurizr.constants.CONTAINER_VIEW_TYPE ||
            view.type === structurizr.constants.COMPONENT_VIEW_TYPE ||
            (view.type === structurizr.constants.DYNAMIC_VIEW_TYPE && view.elementId !== undefined) ||
            (view.type === structurizr.constants.DEPLOYMENT_VIEW_TYPE && view.softwareSystemId !== undefined)
        ) {
            $('#showDiagramScopeOnButton').removeClass('hidden');
            $('#showDiagramScopeOffButton').addClass('hidden');
        } else {
            $('#showDiagramScopeOnButton').addClass('hidden');
            $('#showDiagramScopeOffButton').addClass('hidden');
        }

        if (view.type === "Dynamic" || (view.animations && view.animations.length > 1)) {
            $('.dynamicDiagramButton').removeClass("hidden");

            $('.stepBackwardAnimationButton').attr("disabled", true);
            $('.startAnimationButton').attr("disabled", false);
            $('.stopAnimationButton').attr("disabled", true);
            $('.stepForwardAnimationButton').attr("disabled", false);
        } else {
            $('.dynamicDiagramButton').addClass("hidden");
        }

        var elementsHaveHealthChecks = false;
        if (view.type === structurizr.constants.DEPLOYMENT_VIEW_TYPE) {
            view.elements.forEach(function(ev) {
                const element = structurizr.workspace.findElementById(ev.id);
                if (element && element.healthChecks && element.healthChecks.length > 0) {
                    elementsHaveHealthChecks = true;
                }
            })
        }

        if (elementsHaveHealthChecks) {
            $('#healthOnButton').removeClass('hidden');
            $('#healthOffButton').addClass('hidden');
        } else {
            $('#healthOnButton').addClass('hidden');
            $('#healthOffButton').addClass('hidden');
        }

        const explorationsButton = document.getElementById('explorationsButton');
        if (explorationsButton) {
            if (view.type === structurizr.constants.CUSTOM_VIEW_TYPE || view.type === structurizr.constants.SYSTEM_LANDSCAPE_VIEW_TYPE || view.type === structurizr.constants.SYSTEM_CONTEXT_VIEW_TYPE || view.type === structurizr.constants.CONTAINER_VIEW_TYPE || view.type === structurizr.constants.COMPONENT_VIEW_TYPE) {
                explorationsButton.onclick = function () {
                    const urlPrefix = '<c:out value="${urlPrefix}" />';
                    const urlSuffix = '<c:out value="${urlSuffix}" escapeXml="false" />';
                    window.open(urlPrefix + '/explore/graph' + urlSuffix + '#' + encodeURIComponent(view.key));
                };

                $('#explorationsButton').removeClass('hidden');
            } else if (view.type === structurizr.constants.DEPLOYMENT_VIEW_TYPE) {
                explorationsButton.onclick = function () {
                    const urlPrefix = '<c:out value="${urlPrefix}" />';
                    const urlSuffix = '<c:out value="${urlSuffix}" escapeXml="false" />';
                    window.open(urlPrefix + '/explore/tree' + urlSuffix + '#' + encodeURIComponent(view.key));
                };

                $('#explorationsButton').removeClass('hidden');
            } else {
                $('#explorationsButton').addClass('hidden');
            }
        }

        configureTooltip(view);

        if (structurizr.diagram.getCurrentView().automaticLayout !== undefined) {
            $('#editDiagramButton').addClass('hidden');
            $('#diagramNotEditableMessage').removeClass('hidden');
        } else {
            $('#editDiagramButton').removeClass('hidden');
            $('#diagramNotEditableMessage').addClass('hidden');
        }

        structurizr.diagram.resize();
        structurizr.diagram.zoomToWidthOrHeight();
        refreshThumbnail();
    }

    function configureTooltip(view) {
        const STRUCTURIZR_TOOLTIPS_PROPERTY_NAME = 'structurizr.tooltips';
        if (view.properties) {
            if (view.properties[STRUCTURIZR_TOOLTIPS_PROPERTY_NAME] === 'true') {
                tooltip.disable();
                toggleTooltip();
                return;
            } else if (view.properties[STRUCTURIZR_TOOLTIPS_PROPERTY_NAME] === 'false') {
                tooltip.enable();
                toggleTooltip();
                return;
            }
        }

        if (structurizr.workspace.views.configuration.properties) {
            if (structurizr.workspace.views.configuration.properties[STRUCTURIZR_TOOLTIPS_PROPERTY_NAME] === 'true') {
                tooltip.disable();
                toggleTooltip();
                return;
            } else if (structurizr.workspace.views.configuration.properties[STRUCTURIZR_TOOLTIPS_PROPERTY_NAME] === 'false') {
                tooltip.enable();
                toggleTooltip();
                return;
            }
        }
    }

    function refreshThumbnail() {
        const view = structurizr.diagram.getCurrentViewOrFilter();
        const viewKey = view.key;

        if (structurizr.workspace.id < 1 || structurizr.diagram.isDarkMode() === true || structurizr.diagram.hasPerspective() || structurizr.diagram.hasTags()) {
            if (view.type !== structurizr.constants.IMAGE_VIEW_TYPE) {
                structurizr.diagram.exportCurrentThumbnailToPNG(function (thumbnail) {
                    const domId = '#diagram' + (viewKeys.indexOf(viewKey) + 1) + 'Thumbnail';
                    $(domId + ' img').attr('src', thumbnail);

                    if (publishThumbnails) {
                        putImage(viewKey, viewKey + '-thumbnail.png', thumbnail);

                        // and if this is the first view, make this the workspace thumbnail
                        if (viewKey === views[0].key) {
                            putImage(viewKey, 'thumbnail.png', thumbnail);
                        }
                    }
                });
            }
        }
    }

    function workspaceChanged() {
        $('#undoButton').prop('disabled', structurizr.diagram.undoStackIsEmpty());
        $('#saveButton').prop('disabled', false);
        $('#saveButton').addClass('btn-danger');
        unsavedChanges = true;
    }

    function selectDiagramByView(view)
    {
        $('#viewType option[value="' + view.key + '"]').prop('selected', true);

        if (structurizr.workspace.id > 0) {
            $('.diagramThumbnail').removeClass('diagramThumbnailActive');
            var index = 1;
            views.forEach(function (v) {
                if (view.key === v.key) {
                    const thumbnail = $('#diagram' + index + 'Thumbnail');
                    thumbnail.addClass('diagramThumbnailActive');
                }
                index++;
            });

            scrollActiveThumbnailIntoView();
        }
    }

    function scrollActiveThumbnailIntoView() {
        // scroll the thumbnail into view
        var diagramNavigation = $('#diagramNavigationPanel');
        var thumbnail = $('.diagramThumbnailActive');
        if (diagramNavigation.length > 0 && thumbnail.length > 0) {
            if (thumbnail.offset().top < diagramNavigation.offset().top) {
                thumbnail[0].scrollIntoView(true);
            } else if ((thumbnail.offset().top + thumbnail.height()) > (diagramNavigation.offset().top + diagramNavigation.height())) {
                thumbnail[0].scrollIntoView(false);
            }
        }
    }

    function back() {
        if (viewsVisited.count() > 1) {
            viewsVisited.pop();
            const key = viewsVisited.peek();
            window.location.hash = encodeURIComponent(key);
        }
    }

    function initThumbnails() {
        var html = '';
        var index = 1;
        views.forEach(function(view) {
            viewKeys.push(view.key);
            var id = 'diagram' + index;
            var title = structurizr.util.escapeHtml(structurizr.ui.getTitleForView(view));

            html += '<div id="' + id + 'Thumbnail" class="diagramThumbnail centered small">';

            if (view.type === structurizr.constants.IMAGE_VIEW_TYPE) {
                html += '  <img src="' + view.content + '" class="img-thumbnail viewThumbnail" style="margin-bottom: 10px;" /><br />';
            } else {
            <c:choose>
            <c:when test="${not empty workspace.branch or not empty param.version or embed eq true}">
            html += '  <img src="/static/img/thumbnail-not-available.png" class="img-thumbnail" style="margin-bottom: 10px" /></a>';
            </c:when>
            <c:otherwise>
            html += '  <img src="${thumbnailUrl}' + structurizr.util.escapeHtml(view.key) + '-thumbnail.png" class="img-thumbnail viewThumbnail" style="margin-bottom: 10px;" /><br />';
            </c:otherwise>
            </c:choose>
            }

            html += '<div>';
            html += title;
            html += '<br /><span class="small">#' + structurizr.util.escapeHtml(view.key) + '</span>';
            html += '</div></div>';

            index++;
        });

        $('#diagramNavigation').append(html);

        $('.viewThumbnail').on('error', function() {
            $(this).on('error', undefined);
            $(this).attr('src', '/static/img/thumbnail-not-available.png');
        });

        index = 1;
        views.forEach(function(view) {
            document.getElementById('diagram' + index + 'Thumbnail').onclick = function() {
                window.location.hash = encodeURIComponent(view.key);
            };

            index++;
        });
    }

    function initDiagramSelector() {
        const viewsDropDown = $('#viewType');
        viewsDropDown.empty();

        views.forEach(function(view) {
            viewsDropDown.append(
                $('<option></option>').val(structurizr.util.escapeHtml(view.key)).html(structurizr.util.escapeHtml(structurizr.ui.getTitleForView(view)))
            );
        });
    }

    function openCurrentDiagramInNewWindow() {
        const hash = window.location.hash;
        var url = '<c:out value="${urlPrefix}" />/diagrams<c:out value="${urlSuffix}" escapeXml="false" />';
        var diagramIdentifier = '';
        const perspective = '<c:out value="${perspective}" />';

        if (hash === undefined || hash.trim().length === 0) {
            diagramIdentifier = '<c:out value="${diagramIdentifier}" />';
        } else {
            diagramIdentifier = window.location.hash.substring(1);
        }

        if (perspective.length > 0) {
            if (url.indexOf('?') === -1) {
                url = url + '?perspective=' + perspective;
            } else {
                url = url + '&perspective=' + perspective;
            }
        }

        window.open(url + '#' + diagramIdentifier);
    }

    function initSizing() {
        structurizr.diagram.getPossibleViewportWidth = function() {
            const diagramNavigation = $('#diagramNavigationPanel');
            var diagramNavigationWidth = 0;
            if (diagramNavigation && diagramNavigation.is(':visible')) {
                diagramNavigationWidth = diagramNavigation.outerWidth();
            }

            if (structurizr.ui.isFullScreen()) {
                return screen.width - diagramNavigationWidth;
            } else {
                if (${embed}) {
                    return window.innerWidth - diagramNavigationWidth;
                } else {
                    return $('#diagram').innerWidth();
                }
            }
        };

        structurizr.diagram.getPossibleViewportHeight = function() {
            var diagramControlsHeight = $('#diagramControls').outerHeight(true);
            if (diagramControlsHeight === undefined) {
                diagramControlsHeight = 0;
            }

            if (structurizr.ui.isFullScreen()) {
                if (presentationMode) {
                    return screen.availHeight;
                } else {
                    return screen.availHeight - diagramControlsHeight;
                }
            } else {
                return window.innerHeight - diagramControlsHeight;
            }
        };
    }

    function initControls() {
        $('#editorButton').prop('disabled', !${workspace.editable});
        if (!structurizr.workspace.hasDocumentation()) {
            $('#documentationButton').addClass('hidden');
        }
        if (!structurizr.workspace.hasDecisions()) {
            $('#decisionLogButton').addClass('hidden');
        }

        if (structurizr.ui.isFullScreenEnabled()) {
            $('#enterPresentationModeButton').removeClass('hidden');
        }
    }

    function initKeyboardShortcuts() {
        structurizr.diagram.onkeydown(function(e) {
            const leftArrow = 37;
            const pageUp = 33;
            const rightArrow = 39;
            const pageDown = 34;
            const upArrow = 38;
            const downArrow = 40;

            if (structurizr.diagram.isNavigationEnabled()) {
                if (e.which === leftArrow || e.which === upArrow || e.which === pageUp) {
                    navigateToPreviousDiagram();
                    e.preventDefault();
                    return;
                } else if (e.which === rightArrow || e.which === downArrow || e.which === pageDown) {
                    navigateToNextDiagram();
                    e.preventDefault();
                    return;
                }
            }
        });

        structurizr.diagram.onkeypress(function(e) {
            const plus = 43;
            const equals = 61;
            const minus = 45;
            const comma = 44;
            const dot = 46;
            const a = 97;
            const b = 98;
            const c = 99;
            const d = 100;
            const f = 102;
            const h = 104;
            const i = 105;
            const l = 108;
            const m = 109;
            const n = 110;
            const p = 112;
            const r = 114;
            const t = 116;
            const u = 117;
            const v = 118;
            const w = 119;

            if (e.which === comma) {
                if (structurizr.diagram.currentViewIsDynamic() || structurizr.diagram.currentViewHasAnimation()) {
                    stepBackwardInAnimation();
                    e.preventDefault();
                    return;
                }
            } else if (e.which === dot) {
                if (structurizr.diagram.currentViewIsDynamic() || structurizr.diagram.currentViewHasAnimation()) {
                    stepForwardInAnimation();
                    e.preventDefault();
                    return;
                }
            } else if (e.which === a) {
                if (structurizr.diagram.isEditable()) {
                    structurizr.diagram.selectAllElements();
                    e.preventDefault();
                    return;
                }
            } else if (e.which === d) {
                if (structurizr.diagram.isEditable() && structurizr.diagram.hasElementsSelected()) {
                    structurizr.diagram.deselectAllElements();
                    e.preventDefault();
                    return;
                } else {
                    structurizr.diagram.toggleDescription();
                    e.preventDefault();
                    return;
                }
            } else if (e.which === m) {
                structurizr.diagram.toggleMetadata();
                e.preventDefault();
                return;
            } else if (e.which === plus || e.which === equals) {
                structurizr.diagram.zoomIn();
                e.preventDefault();
                return;
            } else if (e.which === minus) {
                structurizr.diagram.zoomOut();
                e.preventDefault();
                return;
            } else if (e.which === w) {
                structurizr.diagram.zoomFitWidth();
                e.preventDefault();
                return;
            } else if (e.which === h) {
                structurizr.diagram.zoomFitHeight();
                e.preventDefault();
                return;
            } else if (e.which === c) {
                structurizr.diagram.zoomFitContent();
                e.preventDefault();
                return;
            } else if (e.which === u) {
                structurizr.diagram.undo();
                e.preventDefault();
                return;
            } else if (e.which === n && structurizr.diagram.isEditable()) {
                var regex = prompt("Please enter a regex.", "");
                if (regex !== undefined) {
                    structurizr.diagram.selectElementsWithName(regex);
                }
                e.preventDefault();
                return;
            } else if (e.which === r) {
                if (structurizr.diagram.hasLinkHighlighted() && structurizr.diagram.isEditable()) {
                    structurizr.diagram.toggleRoutingOfHighlightedLink();
                    e.preventDefault();
                    return;
                }
            } else if (e.which === v) {
                if (structurizr.diagram.hasLinkHighlighted() && structurizr.diagram.isEditable()) {
                    structurizr.diagram.addVertex();
                    e.preventDefault();
                    return;
                }
            } else if (e.which === i) {
                if (structurizr.diagram.getCurrentView().type !== structurizr.constants.IMAGE_VIEW_TYPE) {
                    showKey();
                    return;
                }
            } else if (e.which === p && !e.metaKey) {
                enterPresentationMode();
                return;
            } else if (e.which === t) {
                toggleTooltip();
                return;
            } else if (e.which === b) {
                back();
                return;
            } else if (e.which === l && structurizr.diagram.isEditable()) {
                openAutoLayoutModal();
                e.preventDefault();
                return;
            }
        });
    }

    function navigateToPreviousDiagram() {
        const currentView = structurizr.diagram.getCurrentViewOrFilter();

        var index = views.indexOf(currentView);
        if (index > 0) {
            window.location.hash = '#' + views[index-1].key;
        }
    }

    function navigateToNextDiagram() {
        const currentView = structurizr.diagram.getCurrentViewOrFilter();

        var index = views.indexOf(currentView);
        if (index < views.length -1) {
            window.location.hash = '#' + views[index+1].key;
        }
    }

    function diagramCreated() {
        if (structurizr.workspace.id > 0) { // i.e. not a demo page
            initThumbnails();
        }

        var diagramIdentifier = '<c:out value="${diagramIdentifier}" />';

        if (window.location.hash) {
            const hash = window.location.hash;
            if (hash && hash.length > 1) {
                diagramIdentifier = decodeURIComponent(hash.substring(1)); // remove the # symbol
            }
        }

        if (!diagramIdentifier) {
            if (structurizr.diagram.isEditable()) {
                diagramIdentifier = structurizr.workspace.views.configuration.lastSavedView;
            } else {
                diagramIdentifier = structurizr.workspace.views.configuration.defaultView;
            }
            if (!diagramIdentifier) {
                diagramIdentifier = '';
            }
        }

        var view = structurizr.workspace.findViewByKey(diagramIdentifier);
        if (!view) {
            view = views[0];
        }

        if (view) {
            changeView(view);
        }

        window.onhashchange = function () {
            if (window.location.hash) {
                var diagramIdentifier = window.location.hash;
                if (diagramIdentifier && diagramIdentifier.length > 1) {
                    diagramIdentifier = decodeURIComponent(diagramIdentifier.substring(1)); // remove the # symbol
                }

                var view = structurizr.workspace.findViewByKey(diagramIdentifier);
                if (view) {
                    progressMessage.show('<p>Rendering ' + structurizr.util.escapeHtml(structurizr.ui.getTitleForView(view)) + '</p><p style="font-size: 66%">(#' + structurizr.util.escapeHtml(view.key) + ')</p>');

                    setTimeout(function() {
                        changeView(view, function() {
                            progressMessage.hide();

                            <c:if test="${not empty iframe}">
                            postDiagramAspectRatioToParentWindow();
                            </c:if>

                            <c:if test="${embed eq true && empty iframe}">
                            postDiagramAspectRatioToParentWindow();
                            </c:if>
                        });
                    }, 10);
                }
            }
        };

        $(window).on("beforeunload", function() {
            if (structurizr.diagram.isEditable()) {
                if (unsavedChanges) {
                    return "There are unsaved changes to one or more diagrams in this workspace - diagram layout will be lost.";
                }
            }
        });

        <c:if test="${workspace.locked}">
        $(window).on("unload", function() {
            navigator.sendBeacon('/workspace/${workspace.id}/unlock?agent=${userAgent}');
        });
        </c:if>

        document.getElementById('diagram-viewport').addEventListener('wheel', function(event) {
                if (event.ctrlKey === true) {
                    if (event.wheelDelta > 0) {
                        structurizr.diagram.zoomIn(event);
                    } else {
                        structurizr.diagram.zoomOut(event);
                    }

                    event.preventDefault();
                    event.stopPropagation();
                }
            },
            {
                passive: false
            });
    }

    function changeView(view, callback) {
        structurizr.diagram.reset();
        var actualView = view;
        if (view.type === structurizr.constants.FILTERED_VIEW_TYPE) {
            actualView = structurizr.workspace.findViewByKey(view.baseViewKey);
        }

        if (actualView.automaticLayout) {
            if (actualView.automaticLayout.implementation === 'Graphviz' && ${structurizrConfiguration.graphvizEnabled}) {
                runGraphvizForView(
                    actualView,
                    function () {
                        structurizr.diagram.changeView(view.key, function() {
                            if (structurizr.diagram.getCurrentViewOrFilter().type !== structurizr.constants.FILTERED_VIEW_TYPE) {
                                structurizr.diagram.autoPageSize();
                            }

                            if (callback) {
                                callback();
                            }
                        });
                    }
                );
            } else if (
                (actualView.automaticLayout.implementation === 'Graphviz' && ${not structurizrConfiguration.graphvizEnabled}) ||
                actualView.automaticLayout.implementation === 'Dagre' ||
                actualView.automaticLayout.implementation === undefined
            ) {
                structurizr.diagram.changeView(view.key, function () {
                    structurizr.diagram.runDagre(
                        actualView.automaticLayout.rankDirection,
                        actualView.automaticLayout.rankSeparation,
                        actualView.automaticLayout.nodeSeparation,
                        actualView.automaticLayout.edgeSeparation,
                        actualView.automaticLayout.vertices,
                        true
                    );

                    if (structurizr.diagram.getCurrentViewOrFilter().type !== structurizr.constants.FILTERED_VIEW_TYPE) {
                        structurizr.diagram.autoPageSize();
                    }

                    if (callback) {
                        callback();
                    }
                });
            }
        } else {
            structurizr.diagram.changeView(view.key, callback);
        }
    }

    function initQuickNavigation() {
        views.forEach(function(view) {
            const title = structurizr.util.escapeHtml(structurizr.ui.getTitleForView(view));
            quickNavigation.addItem(title + ' (#' + structurizr.util.escapeHtml(view.key) + ')', '<c:out value="${urlPrefix}" />/${quickNavigationPath}<c:out value="${urlSuffix}" escapeXml="false" />#' + structurizr.util.escapeHtml(view.key));
        });

        quickNavigation.onOpen(function() {
            structurizr.diagram.setKeyboardShortcutsEnabled(false);
        });
        quickNavigation.onClose(function() {
            structurizr.diagram.setKeyboardShortcutsEnabled(true);
        });
    }

    function createReview() {
        $('#reviewSelectedViewsButton').prop('disabled', false);
        $('#reviewViewList').val(structurizr.diagram.getCurrentViewOrFilter().key);
        $('#reviewModal').modal();
    }

    function processWorkspaceLink(url) {
        if (url !== undefined) {
            if (url.indexOf(structurizr.constants.INTRA_WORKSPACE_URL_PREFIX + '/diagrams#') === 0) {
                // convert {workspace}/diagrams#key to #key
                url = url.substring((structurizr.constants.INTRA_WORKSPACE_URL_PREFIX + '/diagrams').length);
            } else if (url.indexOf(structurizr.constants.INTRA_WORKSPACE_URL_PREFIX) === 0) {
                // convert {workspace}/doc... to /workspace/1234/doc... (where 1234 is the current workspace ID)
                url = '<c:out value="${urlPrefix}" />' + url.substring(structurizr.constants.INTRA_WORKSPACE_URL_PREFIX.length) + '<c:out value="${urlSuffix}" escapeXml="false" />';
            } else if (url.indexOf(structurizr.constants.INTER_WORKSPACE_URL_PREFIX) === 0) {
                // convert {workspace:123456}/doc... to /workspace/123456/doc...
                const targetWorkspaceId = url.substring(url.indexOf(structurizr.constants.INTER_WORKSPACE_URL_SEPARATOR) + 1, url.indexOf(structurizr.constants.INTER_WORKSPACE_URL_SUFFIX));
                url = '<c:out value="${urlPrefix}" />' + url.substring(url.indexOf(structurizr.constants.INTER_WORKSPACE_URL_SUFFIX) + 1);
                url = url.replace('${workspace.id}', targetWorkspaceId);
            }
        }

        return url;
    }

    function elementDoubleClicked(evt, elementId) {
        const element = structurizr.workspace.findElementById(elementId);
        if (element) {
            const elementUrl = processWorkspaceLink(element.url);

            if (evt.altKey === true && elementUrl !== undefined) {
                navigateTo(elementUrl);
                return;
            }

            const options = [];
            var views = [];
            if (element.type === structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE) {
                if (structurizr.diagram.getCurrentView().type === structurizr.constants.SYSTEM_LANDSCAPE_VIEW_TYPE || structurizr.diagram.getCurrentView().softwareSystemId !== element.id) {
                    views = structurizr.workspace.findSystemContextViewsForSoftwareSystem(element.id);
                    if (views.length === 0) {
                        views = structurizr.workspace.findContainerViewsForSoftwareSystem(element.id);
                    }
                } else if (structurizr.diagram.getCurrentView().type === structurizr.constants.SYSTEM_CONTEXT_VIEW_TYPE) {
                    views = structurizr.workspace.findContainerViewsForSoftwareSystem(element.id);
                }
            } else if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
                views = structurizr.workspace.findComponentViewsForContainer(element.id);
            } else if (element.type === structurizr.constants.SOFTWARE_SYSTEM_INSTANCE_ELEMENT_TYPE) {
                views = structurizr.workspace.findSystemContextViewsForSoftwareSystem(element.softwareSystemId);
            } else if (element.type === structurizr.constants.CONTAINER_INSTANCE_ELEMENT_TYPE) {
                views = structurizr.workspace.findComponentViewsForContainer(element.containerId);
            }

            views = views.concat(structurizr.workspace.findImageViewsForElement(element.id));

            views.forEach(function(view) {
                options.push({
                    url: '#' + view.key,
                    label: structurizr.ui.getTitleForView(view) + ' (#' + view.key + ')'
                });
            });

            if (element.documentation && element.documentation.sections && element.documentation.sections.length > 0) {
                const documentationUrl = '<c:out value="${urlPrefix}" />/documentation/' + encodeURI(toScope(element)) + '<c:out value="${urlSuffix}" escapeXml="false" />';
                options.push({
                    url: documentationUrl,
                    label: 'Documentation'
                });
            }

            if (element.documentation && element.documentation.decisions && element.documentation.decisions.length > 0) {
                const decisionsUrl = '<c:out value="${urlPrefix}" />/decisions/' + encodeURI(toScope(element)) + '<c:out value="${urlSuffix}" escapeXml="false" />';
                options.push({
                    url: decisionsUrl,
                    label: 'Decisions'
                });
            }

            if (elementUrl !== undefined) {
                var label = elementUrl;
                if (elementUrl.indexOf('#') === 0) {
                    const key = elementUrl.substring(1);
                    const view = structurizr.workspace.findViewByKey(key);
                    if (view) {
                        label = structurizr.ui.getTitleForView(view) + ' (#' + view.key + ')'
                    }
                }
                options.push({
                    url: elementUrl,
                    label: label
                });
            }

            if (element.properties) {
                Object.keys(element.properties).forEach(function(name) {
                    const value = element.properties[name];
                    if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) {
                        options.push({
                            url: value,
                            label: name
                        })
                    }
                });
            }

            if (options.length === 1) {
                navigateTo(options[0].url);
            } else {
                openNavigationModal(options);
            }
        }
    }

    function toScope(element) {
        if (element.type === structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE) {
            return element.name;
        } else if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
            const softwareSystem = structurizr.workspace.findElementById(element.parentId);
            return toScope(softwareSystem) + '/' + element.name;
        } else if (element.type === structurizr.constants.COMPONENT_ELEMENT_TYPE) {
            const container = structurizr.workspace.findElementById(element.parentId);
            return toScope(container) + '/' + element.name;
        }

        return undefined;
    }

    function relationshipDoubleClicked(evt, relationshipId) {
        const relationship = structurizr.workspace.findRelationshipById(relationshipId);
        if (relationship) {
            const options = [];
            const relationshipUrl = relationship.url;

            if (relationshipUrl !== undefined) {
                options.push({
                    url: processWorkspaceLink(relationshipUrl),
                    label: relationshipUrl
                });
            }

            if (relationship.properties) {
                Object.keys(relationship.properties).forEach(function(name) {
                    const value = relationship.properties[name];
                    if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) {
                        options.push({
                            url: value,
                            label: name
                        })
                    }
                });
            }

            if (options.length === 1) {
                navigateTo(options[0].url);
            } else {
                openNavigationModal(options);
            }
        }
    }

    function isRendered() {
        return structurizr.diagram && structurizr.diagram.isRendered();
    }

    function isExportable() {
        return structurizr.diagram && structurizr.diagram.isExportable();
    }

    function saveWorkspace() {
        $('#saveButton').prop('disabled', true);

        if (structurizr.autoSave === false) {
            progressMessage.show('<p>Saving workspace...</p>');
        }

        structurizr.workspace.views.configuration.lastSavedView = structurizr.diagram.getCurrentViewOrFilter().key;
        structurizr.saveWorkspace(function(response) {
            if (response.success === true) {
                progressMessage.hide();

                $('#saveButton').prop('disabled', true);
                $('#saveButton').removeClass('btn-danger');
                unsavedChanges = false;

                refreshThumbnail();
            } else {
                $('#saveButton').prop('disabled', false);
                if (response.message) {
                    console.log(response.message);
                    if (progressMessage) {
                        progressMessage.show(response.message);
                    }
                }
            }
        });
    }

    function putImage(viewKey, filename, imageAsBase64EncodedDataUri, callback) {
        $.ajax({
            url: '/workspace/${workspace.id}/images/' + encodeURIComponent(filename),
            type: 'PUT',
            contentType: 'text/plain',
            cache: false,
            headers: {
                'Content-Type': 'text/plain'
            },
            dataType: 'json',
            data: imageAsBase64EncodedDataUri
        })
        .done(function(data, textStatus, jqXHR) {
            if (callback) {
                callback(viewKey);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            // status[viewKey] = true;
            console.log(jqXHR);
            console.log(jqXHR.status);
            console.log("Text status: " + textStatus);
            console.log("Error thrown: " + errorThrown);

            if (callback) {
                callback(viewKey);
            }
        });
    }

    function openDocumentation() {
        openDocumentationOrDecisions('documentation', hasDocumentation);
    }

    function openDecisions() {
        openDocumentationOrDecisions('decisions', hasDecisions);
    }

    function openDocumentationOrDecisions(path, fn) {
        var view = structurizr.diagram.getCurrentView();
        var elementId;

        if (view.type === 'SystemContext' || view.type === 'Container') {
            elementId = view.softwareSystemId;
        } else if (view.type === 'Component') {
            elementId = view.containerId;
        } else if (view.type === 'Dynamic') {
            elementId = view.elementId;
        } else if (view.type === 'Deployment') {
            elementId = view.softwareSystemId;
        }

        if (elementId) {
            var element = structurizr.workspace.findElementById(elementId);
            if (element) {
                if (element.type === 'SoftwareSystem') {
                    var softwareSystem = element;

                    if (fn(softwareSystem)) {
                        window.location.href='<c:out value="${urlPrefix}" />/' + path + '/' + structurizr.util.escapeHtml(softwareSystem.name) + '<c:out value="${urlSuffix}" escapeXml="false" />';
                    } else {
                        window.location.href='<c:out value="${urlPrefix}" />/' + path + '<c:out value="${urlSuffix}" escapeXml="false" />';
                    }

                    return;
                } else if (element.type === 'Container') {
                    var container = element;
                    var softwareSystem = structurizr.workspace.findElementById(container.parentId);

                    if (fn(container)) {
                        window.location.href='<c:out value="${urlPrefix}" />/' + path + '/' + structurizr.util.escapeHtml(softwareSystem.name) + '/' + structurizr.util.escapeHtml(container.name) + '<c:out value="${urlSuffix}" escapeXml="false" />';
                    } else if (fn(softwareSystem)) {
                        window.location.href='<c:out value="${urlPrefix}" />/' + path + '/' + structurizr.util.escapeHtml(softwareSystem.name) + '<c:out value="${urlSuffix}" escapeXml="false" />';
                    } else {
                        window.location.href='<c:out value="${urlPrefix}" />/' + path + '<c:out value="${urlSuffix}" escapeXml="false" />';
                    }

                    return;
                }
            }
        }

        window.location.href='<c:out value="${urlPrefix}" />/' + path + '<c:out value="${urlSuffix}" escapeXml="false" />';
    }

    function hasDocumentation(element) {
        return element.documentation && element.documentation.sections && element.documentation.sections.length > 0;
    }

    function hasDecisions(element) {
        return element.documentation && element.documentation.decisions && element.documentation.decisions.length > 0;
    }

    <c:if test="${not empty iframe}">
    function postDiagramAspectRatioToParentWindow() {
        const diagramAspectRatio = (structurizr.diagram.getWidth() / structurizr.diagram.getHeight());
        const diagramControls = document.getElementById("diagramControls");
        var controlsHeight = 0;
        if (diagramControls) {
            controlsHeight = diagramControls.offsetHeight;
        }

        parent.postMessage({
            iframe: '<c:out value="${iframe}" />',
            aspectRatio: diagramAspectRatio,
            controlsHeight: controlsHeight,
            type: 'diagram',
            view: structurizr.diagram.getCurrentViewOrFilter().key
        }, '*');
    }
    </c:if>

    <c:if test="${embed eq true && empty iframe}">
    function postDiagramAspectRatioToParentWindow() {
        var canvasHeight = document.getElementById("diagram-canvas").offsetHeight;

        window.parent.postMessage(JSON.stringify({
            src: window.location.toString(),
            context: 'iframe.resize',
            height: canvasHeight // pixels
        }), '*');
    }
    </c:if>

    $('#embeddedControls').hover(
        function() {
            $('#embeddedControls').css('opacity', '1.0');
        },
        function() {
            $('#embeddedControls').css('opacity', '0.1');
        }
    );

    $(window).resize(function() {
        if (structurizr.diagram) {
            structurizr.diagram.resize();
            structurizr.diagram.zoomToWidthOrHeight();

            <c:if test="${not empty iframe}">
            postDiagramAspectRatioToParentWindow();
            </c:if>

            <c:if test="${embed eq true && empty iframe}">
            postDiagramAspectRatioToParentWindow();
            </c:if>
        }
    });

    window.onorientationchange = function() {
        if (structurizr.diagram) {
            structurizr.diagram.resize();
            structurizr.diagram.zoomToWidthOrHeight();
        }
    };

    function enterPresentationMode() {
        presentationMode = true;

        if (!structurizr.ui.isFullScreen()) {
            structurizr.ui.enterFullScreen('diagram');
        }

        $('#enterPresentationModeButton').addClass('hidden');
        $('.structurizrDiagramViewport').css('background', '#000000');
        structurizr.diagram.resize();
        structurizr.diagram.zoomToWidthOrHeight();
    }

    function exitPresentationMode() {
        $('#enterPresentationModeButton').removeClass('hidden');
        $('.structurizrDiagramViewport').css('background', '');

        if (!structurizr.diagram.isEmbedded()) {
            $('#diagramNavigationPanel').removeClass('hidden');
        }

        presentationMode = false;
    }

    function toggleTooltip() {
        if (tooltip.isEnabled()) {
            tooltip.disable();
            $('.diagramTooltipOnButton').removeClass('hidden');
            $('.diagramTooltipOffButton').addClass('hidden');
        } else {
            tooltip.enable();
            $('.diagramTooltipOnButton').addClass('hidden');
            $('.diagramTooltipOffButton').removeClass('hidden');
        }
    }

    function getViewDropDown() {
        return $("#viewType");
    }

    function getPageSizeDropDown() {
        return $("#pageSize");
    }

    getViewDropDown().change(function() {
        var key = getViewDropDown().val();
        setTimeout(function() {
            window.location.hash = encodeURIComponent(key);
        }, 10);
    });

    getPageSizeDropDown().change(function() {
        var pageSize = getPageSizeDropDown().val();
        if (pageSize === 'none') {
            structurizr.diagram.getCurrentView().paperSize = undefined;
        } else {
            var dimensions = pageSize.split("x");
            structurizr.diagram.setPageSize(parseInt(dimensions[0]), parseInt(dimensions[1]));
            structurizr.diagram.getCurrentView().paperSize = $('#pageSize option:selected').attr('id');
        }
    });

    function animationStarted() {
        $('.stepBackwardAnimationButton').prop("disabled", false);
        $('.startAnimationButton').prop("disabled", true);
        $('.stopAnimationButton').prop("disabled", false);
    }

    function animationStopped() {
        $('.stepBackwardAnimationButton').prop("disabled", true);
        $('.startAnimationButton').prop("disabled", false);
        $('.stopAnimationButton').attr("disabled", true);
    }

    function startAnimation(autoPlay) {
        structurizr.diagram.startAnimation(autoPlay);
    }

    function stepBackwardInAnimation() {
        structurizr.diagram.stepBackwardInAnimation();
    }

    function stepForwardInAnimation() {
        structurizr.diagram.stepForwardInAnimation();
    }

    function stopAnimation() {
        structurizr.diagram.stopAnimation();
    }

    $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange fullscreenChange MSFullscreenChange',function(){
        if (structurizr.ui.isFullScreen()) {
            structurizr.diagram.resize();

            if (presentationMode) {
                structurizr.diagram.zoomToWidthOrHeight();
            }
        } else {
            if (presentationMode) {
                exitPresentationMode();
            }

            structurizr.diagram.resize();
            structurizr.diagram.zoomToWidthOrHeight();
        }
    });

    function toggleMultiSelectButtons(elements) {
        $('.multipleElementsSelectedButton').prop('disabled', elements.length < 2);
    }

    function showDiagramScope(bool) {
        if (bool) {
            $('#showDiagramScopeOnButton').addClass('hidden');
            $('#showDiagramScopeOffButton').removeClass('hidden');
            structurizr.diagram.showDiagramScope(true);
        } else {
            $('#showDiagramScopeOnButton').removeClass('hidden');
            $('#showDiagramScopeOffButton').addClass('hidden');
            structurizr.diagram.showDiagramScope(false);
        }
    }

    function showHealth(bool) {
        if (bool) {
            $('#healthOnButton').addClass('hidden');
            $('#healthOffButton').removeClass('hidden');

            healthCheck.start();
        } else {
            $('#healthOnButton').removeClass('hidden');
            $('#healthOffButton').addClass('hidden');

            healthCheck.stop();
        }
    }

    function updateHealth(allHealthChecks, currentHealthCheck) {
        var elementId = currentHealthCheck.elementId;
        var numberOfHealthChecks = 0;
        var numberOfSuccessfulHealthChecks = 0 ;
        var numberOfHealthChecksForElement = 0;
        var numberOfSuccessfulHealthChecksForElement = 0;

        allHealthChecks.forEach(function(healthCheck) {
            numberOfHealthChecks++;
            if (healthCheck.status === true) {
                numberOfSuccessfulHealthChecks++;
            }

            if (healthCheck.elementId === elementId) {
                numberOfHealthChecksForElement++;
                if (healthCheck.status === true) {
                    numberOfSuccessfulHealthChecksForElement++;
                }
            }
        });

        var percentageOfSuccessfulHealthChecksForElement = (numberOfSuccessfulHealthChecksForElement / numberOfHealthChecksForElement);

        var green = "#5cb85c";
        var amber = "#f0ad4e";
        var red =   "#d9534f";

        var background;

        if (percentageOfSuccessfulHealthChecksForElement === 1) {
            background = green;
        } else if (percentageOfSuccessfulHealthChecksForElement === 0) {
            background = red;
        } else {
            background = amber;
        }

        structurizr.diagram.changeColorOfElement(elementId, background);
    }
</script>

<c:if test="${embed eq true}">
<script nonce="${scriptNonce}">
    quickNavigation.disable();
</script>
</c:if>

<c:choose>
    <c:when test="${loadWorkspaceFromParent eq true}">
<script nonce="${scriptNonce}">
    loadWorkspaceFromParent();
</script>
    </c:when>
    <c:when test="${not empty workspaceAsJson}">
<%@ include file="/WEB-INF/fragments/workspace/load-via-inline.jspf" %>
    </c:when>
    <c:otherwise>
<%@ include file="/WEB-INF/fragments/workspace/load-via-api.jspf" %>
    </c:otherwise>
</c:choose>

<c:if test="${structurizrConfiguration.type eq 'lite'}">
<%@ include file="/WEB-INF/fragments/workspace/auto-save.jspf" %>
<%@ include file="/WEB-INF/fragments/workspace/auto-refresh.jspf" %>
</c:if>