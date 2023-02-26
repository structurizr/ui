<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>

<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-embed.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-content${structurizrConfiguration.versionSuffix}.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-ui${structurizrConfiguration.versionSuffix}.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/markdown-it-13.0.1.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/katex-0.16.4.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/asciidoctor-2.2.6.min.js"></script>

<link href="${structurizrConfiguration.cdnUrl}/css/katex-0.16.4.min.css" rel="stylesheet" media="screen" />
<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-asciidoctor.css" rel="stylesheet" media="screen" />
<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-decisions.css" rel="stylesheet" media="screen" />

<%@ include file="/WEB-INF/fragments/progress-message.jspf" %>
<%@ include file="/WEB-INF/fragments/quick-navigation.jspf" %>

<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/d3-7.8.2.min.js"></script>

<style id="brandingStyles"></style>

<div class="row" style="padding-top: 20px; padding-bottom: 0; margin-left: 0; margin-right: 0">

    <div class="col-sm-3" style="padding-left: 30px">
        <div id="documentationNavigationPanel" class="hidden-xs">

            <div id="documentationNavigation"></div>

            <div class="navigationItemSeparator"></div>

            <div id="documentationMetadata">
                <c:if test="${not empty param.version}">
                    <div style="margin-bottom: 10px">
                        <span class="label label-version" style="font-size: 11px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/clock-history.svg" class="icon-xs icon-white" /> ${workspace.internalVersion}</span>
                    </div>
                </c:if>
                <span id="lastModifiedDate"></span>
                <c:if test="${not empty workspace.version}">
                    <br />
                    Version: ${workspace.version}
                </c:if>
            </div>
        </div>
    </div>

    <div class="col-sm-9" style="margin-top: 0px; margin-bottom: 0px">
        <div class="centered visible-xs">
            <div class="form-inline" style="margin-top: 20px">
                <select id="decisionLogNavigationDropDown" class="form-control">
                </select>
            </div>
        </div>

        <div id="documentationPanel">
            <div id="decisionLogHeader" style="border-bottom: none">
                <h1 id="decisionTitle" class="centered"></h1>
                <div id="decisionDate" class="centered"></div>
                <div class="centered" style="margin-top: 10px">
                    <span id="decisionStatus" class="centered hidden" style="font-size: 30px"></span>
                    <button id="graphButton" type="button" class="btn btn-default hidden" style="height: 42px; margin-bottom: 8px;" onclick="openGraphModal()"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/diagram-2.svg" class="icon-btn" /> Decision explorer</button>
                </div>
            </div>

            <div id="decisionLogContent"></div>
        </div>
    </div>
</div>

<script nonce="${scriptNonce}">
    const requestedScope = '${scope}';
    structurizr.ui.DEFAULT_FONT_NAME = "Open Sans";

    const elementsWithDecisions = [];
    var decisions = [];
    const anchors = [];

    var contentRenderer;
    var graph;
    const documentationNavigation = $('#documentationNavigation');
    const decisionLogNavigationDropDown = $('#decisionLogNavigationDropDown');
    const documentationNavigationPanel = $('#documentationNavigationPanel');

    const defaultDecisionBackgrounds = {
        'Proposed': '#5bc0de',
        'Accepted': '#5cb85c',
        'Superseded': '#f0ad4e',
        'Deprecated': '#f0ad4e',
        'Rejected': '#d9534f'
    };

    progressMessage.show('<p>Loading workspace...</p>');

    function workspaceLoaded() {
        if (structurizr.workspace.hasDecisions()) {
            contentRenderer = new structurizr.ui.ContentRenderer(
                structurizr.workspace,
                '${structurizrConfiguration.cdnUrl}',
                '${urlPrefix}',
                '${urlSuffix}');

            init();
            renderNavigation();
            show();

            window.onhashchange = show;

            const timezone = structurizr.workspace.views.configuration.properties['structurizr.timezone'];
            const locale = structurizr.workspace.views.configuration.properties['structurizr.locale'];

            $('#lastModifiedDate').html(new Date(structurizr.workspace.lastModifiedDate).toLocaleString(locale,
                {
                    weekday: 'long',
                    year:'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZone: timezone,
                    timeZoneName : 'long'
                }
            ));
        } else {
            showNoDecisionsPage();
        }

        structurizr.ui.applyBranding();
        $('#brandingLogoAnchor').attr('href', '${urlPrefix}');
        progressMessage.hide();
    }

    function init() {
        if (structurizr.workspace.documentation.decisions.length > 0) {
            const elementId = '*';
            if (elementsWithDecisions.indexOf(elementId) === -1) {
                elementsWithDecisions.push(elementId);
            }

            if (requestedScope === '*') {
                decisions = structurizr.workspace.documentation.decisions;
            }
        }

        structurizr.workspace.model.softwareSystems.forEach(function(softwareSystem) {
            if (softwareSystem.documentation.decisions.length > 0) {
                const elementId = softwareSystem.id;
                if (elementsWithDecisions.indexOf(elementId) === -1) {
                    elementsWithDecisions.push(elementId);
                }

                var scope = toScope(softwareSystem);
                if (requestedScope === scope) {
                    decisions = softwareSystem.documentation.decisions;
                    contentRenderer.setScope(softwareSystem);
                }
            }

            if (softwareSystem.containers) {
                softwareSystem.containers.forEach(function(container) {
                    if (container.documentation.decisions.length > 0) {
                        const elementId = container.id;
                        if (elementsWithDecisions.indexOf(elementId) === -1) {
                            elementsWithDecisions.push(elementId);
                        }

                        const scope = toScope(container);
                        if (requestedScope === scope) {
                            decisions = container.documentation.decisions;
                            contentRenderer.setScope(container);
                        }
                    }
                });
            }
        });

        if (decisions && decisions.length > 0) {
            decisions.sort(function(a,b) {
                if (a.date !== undefined && b.date !== undefined) {
                    const result = b.date.localeCompare(a.date);

                    if (result === 0) {
                        return b.id - a.id;
                    } else {
                        return result;
                    }
                } else {
                    return b.id - a.id;
                }
            });
        }
    }

    function toScope(element) {
        if (element.type === structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE) {
            return structurizr.util.escapeHtml(element.name);
        } else if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
            const softwareSystem = structurizr.workspace.findElementById(element.parentId);
            return structurizr.util.escapeHtml(softwareSystem.name) + '/' + structurizr.util.escapeHtml(element.name);
        }

        return undefined;
    }

    function createDecisionAnchor(decision) {
        return '#' + decision.id;
    }

    function renderNavigation() {
        elementsWithDecisions.forEach(function(elementId) {
            var scope;

            if (elementId === '*') {
                scope = '*';
                const uri = '${urlPrefix}/decisions${urlSuffix}';
                documentationNavigation.append('<div class="decisionNavigationLink decisionNavigationHeading"><a href="' + uri + '">' + structurizr.util.escapeHtml(structurizr.workspace.name) + '</a></div>');
                decisionLogNavigationDropDown.append(
                    $('<option></option>').val(uri).html('Workspace] ' + structurizr.util.escapeHtml(structurizr.workspace.name))
                );
                quickNavigation.addItem(structurizr.util.escapeHtml('Workspace] ' + structurizr.workspace.name), uri);
            } else {
                var element = structurizr.workspace.findElementById(elementId);
                scope = toScope(element);
                const uri = '${urlPrefix}/decisions/' + scope + '${urlSuffix}';

                documentationNavigation.append('<div class="decisionNavigationLink decisionNavigationHeading"><a href="' + uri + '">' + structurizr.util.escapeHtml(element.name) + '</a></div>');
                decisionLogNavigationDropDown.append(
                    $('<option></option>').val(uri).html("[" + structurizr.util.escapeHtml(structurizr.workspace.getTerminologyFor(element)) + "] " + structurizr.util.escapeHtml(element.name))
                );
                quickNavigation.addItem("[" + structurizr.util.escapeHtml(structurizr.workspace.getTerminologyFor(element)) + "] " + structurizr.util.escapeHtml(element.name), uri);
            }

            if (scope === requestedScope) {
                // render decision navigation
                decisions.forEach(function(decision) {
                    const decisionAnchor = createDecisionAnchor(decision);
                    anchors.push(decisionAnchor);

                    documentationNavigation.append('<div id="decisionNavigationLink' + (anchors.length-1) + '" class="decisionNavigationLink decisionNavigationItem"><a href="' + decisionAnchor + '">' + decision.id + '. ' + structurizr.util.escapeHtml(decision.title) + '</a></div>');
                    decisionLogNavigationDropDown.append(
                        $('<option>').val(decisionAnchor).html('&nbsp;&nbsp;' + decision.id + '. ' + structurizr.util.escapeHtml(decision.title))
                    );
                    quickNavigation.addItem(createStatusLabel(decision, true) + ' ' + decision.id + '. ' + structurizr.util.escapeHtml(decision.title), decisionAnchor);
                });
            }
        });

        decisionLogNavigationDropDown.change(function() {
            window.location.href = decisionLogNavigationDropDown.val();
        });
    }

    function highlightNavigation() {
        $('.decisionNavigationLink').removeClass('documentationNavigationLinkActive');
        const hash = window.location.hash;

        if (hash && hash.length > 0) {
            const index = anchors.indexOf(hash);
            var navigationLink = $('#decisionNavigationLink' + index);
            navigationLink.addClass('documentationNavigationLinkActive');
            decisionLogNavigationDropDown.val(hash);

            try {
                // scroll the navigation link into view if needed
                if (navigationLink.offset().top < documentationNavigationPanel.offset().top) {
                    navigationLink[0].scrollIntoView(true);
                } else if ((navigationLink.offset().top + navigationLink.height()) > (documentationNavigationPanel.offset().top + documentationNavigationPanel.height())) {
                    navigationLink[0].scrollIntoView(false);
                }
            } catch (err) {
                console.log(err);
            }
        } else {
            decisionLogNavigationDropDown.val(decodeURIComponent(window.location.pathname));
        }
    }

    function showNoDecisionsPage() {
        const decisionLogContent = $('#decisionLogContent');
        $('#decisionTitle').addClass('hidden');
        $('#decisionDate').addClass('hidden');
        $('#decisionStatus').addClass('hidden');

        decisionLogContent.addClass('centered');
        decisionLogContent.css('margin-top', '100px');
        decisionLogContent.css('margin-bottom', '100px');

        decisionLogContent.append('<p>There are no architecture decision records in this workspace.</p>');
    }

    function show() {
        $('#decisionLogContent').empty();
        document.getElementById('documentationPanel').scrollTo(0, 0);

        const hash = window.location.hash;
        var decisionId;
        if (hash && hash.length > 0) {
            decisionId = hash.substring(1); // remove the # symbol
        }

        if (graph === undefined && window.createGraph) {
            try {
                graph = createGraph(requestedScope);
                setWidthAndHeight();
                if (graph) {
                    renderGraph();
                }
            } catch (err) {
                console.log(err);
            }
        }

        if (decisionId === undefined) {
            showDecisionSummary();
        } else {
            showDecision(decisionId);
        }
    }

    function showDecisionSummary() {
        const decisionLogContent = $('#decisionLogContent');
        $('#decisionDate').addClass('hidden');
        $('#decisionStatus').addClass('hidden');

        var html = '';
        html += '<div class="section">';
        html += '<div class="decisionLogSummary">';

        if (requestedScope === '*') {
            if (decisions && decisions.length > 0) {
                $('#decisionTitle').html('Summary');
            } else if (elementsWithDecisions.length > 0) {
                // workspace level decisions has been requested, but none exist,
                // so show decisions for the first element instead
                const elementId = elementsWithDecisions[0];
                const element = structurizr.workspace.findElementById(elementId);
                const scope = toScope(element);
                window.location.href = '${urlPrefix}/decisions/' + scope + '${urlSuffix}';
                return;
            } else {
                showNoDecisionsPage();
            }
        } else {
            $('#decisionTitle').html('Summary');
        }

        const years = [];
        var currentYear = undefined;
        decisions.forEach(function(decision) {
            var date = new Date(decision.date);

            if (currentYear !== date.getFullYear()) {
                if (currentYear !== undefined) {
                    html += '</table></div>';
                }

                currentYear = date.getFullYear();
                years.push(currentYear);

                html += '<div class="decisionTimelineYear">';
                html += currentYear;
                html += '</div>';

                html += '<div><table class="table table-striped" width="100%">';
            }

            html += '<tr>';
            html += '<td width="80%"><a href="' + createDecisionAnchor(decision) + '">' + decision.id + '. ' + structurizr.util.escapeHtml(decision.title) + '</a><div class="decisionSummaryMetadata">' + formatDate(decision.date) + '</div></td>';
            html += '<td style="text-align: right">' + createStatusLabel(decision, true) + '</td>';
            html += '</tr>';
        });

        html += '</table></div>';

        decisionLogContent.append(html);

        $('.decisionLogStatus').addClass('otherStatus');
        highlightNavigation();
    }

    function formatDate(dateAsString) {
        return new Date(dateAsString).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function createStatusLabel(decision, includeText) {
        const style = getDecisionStyle(decision);

        return '<span class="label" style="background: ' + style.background + '; color: ' + style.color + '">' + (includeText ? ' ' + structurizr.util.escapeHtml(decision.status) : '') + '</span>';
    }

    function showDecision(decisionId) {
        const decision = decisions.filter(function(d) { return d.id === decisionId; })[0];
        if (decision) {
            $('#decisionTitle').html(decision.id + ". " + structurizr.util.escapeHtml(decision.title));
            $('#decisionDate').html(formatDate(decision.date));
            $('#decisionDate').removeClass('hidden');
            $('#decisionStatus').html(createStatusLabel(decision, true));
            $('#decisionStatus').removeClass('hidden');

            const decisionLogContent = $('#decisionLogContent');
            const result = contentRenderer.render(decision);
            const html = '<div>' + result + '</div>';
            decisionLogContent.append(html);

            $('#decisionLogContent h1').each(function () {
                $(this).remove();
            });

            if (graph) {
                highlightDecisionInGraph(decision);
            }

            rewriteInternalWorkspaceLinks();
            highlightNavigation();
        }
    }

    function rewriteInternalWorkspaceLinks() {
        $('#decisionLogContent a').each(function () {
            var href = $(this).attr('href');
            href = decodeURIComponent(href);
            if (href.indexOf(structurizr.constants.WORKSPACE_URL_PREFIX) === 0) {
                // convert {workspace}/doc... to /workspace/1234/doc...
                href = '${urlPrefix}' + href.substring(structurizr.constants.WORKSPACE_URL_PREFIX.length) + '${urlSuffix}';
                $(this).attr('href', href)
            }
        });
    }

    function changeDecision(evt) {
        const hash = window.location.hash;
        const index = anchors.indexOf(hash);

        if (evt.key === 'ArrowRight') {
            if (index < anchors.length - 1) {
                window.location.hash = anchors[index+1];
            }
        } else if (evt.key === 'ArrowLeft') {
            if (index > 0) {
                window.location.hash = anchors[index-1];
            }
        }
    }

    function getDecisionStyle(decision) {
        const status = decision.status;

        var background = defaultDecisionBackgrounds[status];
        if (background === undefined) {
            background = '#777777';
        }
        var color = '#ffffff';

        const style = structurizr.workspace.findElementStyleByTag("Decision:" + status);
        if (style) {
            if (style.background) {
                background = style.background;
            }
            if (style.color) {
                color = style.color;
            }
        }

        return {
            background: background,
            color: color
        };
    }

    var topNavigationHeight = $('#topNavigation').outerHeight(true);
    var padding = 20;
    $('#documentationPanel').css('height', (window.innerHeight - topNavigationHeight - padding) + 'px');
    documentationNavigationPanel.css('height', (window.innerHeight - topNavigationHeight - padding) + 'px');

    document.addEventListener("keydown", changeDecision);

    window.addEventListener("resize", function() {
        const topNavigationHeight = $('#topNavigation').outerHeight(true);
        const padding = 20;
        $('#documentationPanel').css('height', (window.innerHeight - topNavigationHeight - padding) + 'px');
        documentationNavigationPanel.css('height', (window.innerHeight - topNavigationHeight - padding) + 'px');

        if (graph !== undefined && $('#graphContent').is(':visible')) {
            resizeGraph();
        }
    }, false);
</script>

<%@ include file="/WEB-INF/fragments/decisions/graph.jspf" %>

<c:choose>
    <c:when test="${not empty workspaceAsJson}">
<%@ include file="/WEB-INF/fragments/workspace/load-via-inline.jspf" %>
    </c:when>
    <c:otherwise>
<%@ include file="/WEB-INF/fragments/workspace/load-via-api.jspf" %>
    </c:otherwise>
</c:choose>

<c:if test="${structurizrConfiguration.type eq 'lite'}">
<%@ include file="/WEB-INF/fragments/workspace/auto-refresh.jspf" %>
</c:if>