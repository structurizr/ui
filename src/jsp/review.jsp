<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-review.css" rel="stylesheet" media="screen" />
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-review${structurizrConfiguration.versionSuffix}.js"></script>

<c:forEach var="message" items="${messages.unreadMessages}">
    <div class="alert alert-${message.type} alert-dismissible" role="alert" style="margin-bottom: 0">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            ${message.text}
    </div>
</c:forEach>

<div id="diagramControls" class="centered">
    <div class="row">
        <div class="col-sm-2" style="padding: 18px 30px 10px 30px">
            <a href="/"><img src="${structurizrConfiguration.cdnUrl}/img/structurizr-banner.png" alt="Structurizr" class="structurizrBannerLight img-responsive brandingLogo" /><img src="${structurizrConfiguration.cdnUrl}/img/structurizr-banner-dark.png" alt="Structurizr" class="structurizrBannerDark img-responsive brandingLogo" /></a>
        </div>
        <div class="col-sm-10" style="padding: 18px 30px 10px 30px">
            <div class="form-inline">
                <div id="commentTypeButtons"></div>

                <form id="submitReviewForm" class="hidden" method="post" action="/review/${review.id}">
                    <input type="hidden" id="reviewSessionJson" name="json" />
                </form>

                <div class="btn-group">
                    <c:if test="${review.locked eq true && admin eq true}">
                    <button id="unlockButton" class="btn btn-default" title="Unlock review" ><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/unlock.svg" class="icon-btn" /></button>
                    </c:if>
                    <c:if test="${review.locked eq false && admin eq true}">
                    <button id="lockButton" class="btn btn-default" title="Lock review"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/lock.svg" class="icon-btn" /></button>
                    </c:if>
                    <c:if test="${review.locked eq false or admin eq true}">
                    <button id="helpButton" class="btn btn-default" title="Help"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/question-circle.svg" class="icon-btn" /></button>
                    </c:if>
                </div>
                <script nonce="${scriptNonce}">
                    $('#unlockButton').click(function() { window.location.href='/review/${review.id}/unlock'; });
                    $('#lockButton').click(function() { window.location.href='/review/${review.id}/lock'; });
                    $('#helpButton').click(function() { window.open('https://docs.structurizr.com/${structurizrConfiguration.product}/diagram-review'); });
                </script>

                <div class="btn-group">
                    <c:choose>
                        <c:when test="${review.locked eq true}">
                            <span style="margin-left: 10px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/lock.svg" class="icon-xs" /> This review is locked</span>
                        </c:when>
                        <c:otherwise>
                            <button id="submitReviewButton" disabled class="btn btn-default"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/check-circle.svg" class="icon-btn icon-white" /> Submit comment(s)</button>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="tooltip" class="hidden">
    <div id="tooltipDescription"></div>
    <div id="tooltipAuthor"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/person.svg" class="icon-sm icon-white" /> <span id="tooltipAuthorName"></span></div>
</div>

<div class="modal fade" id="commentModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-md">
        <div id="commentModalContent" class="modal-content">
            <div class="modal-body">
                <div>
                    <textarea class="form-control" rows="5" id="commentDescription"></textarea>
                </div>

                <div id="commentModalButtons">
                </div>

                <div id="commentModalAuthor">
                    <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/person.svg" class="icon-sm icon-white" />
                    <c:choose>
                        <c:when test="${not empty reviewer}">
                            ${reviewer}
                        </c:when>
                        <c:otherwise>
                            Anonymous
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="small centered" style="margin-top: 20px;">
    <c:if test="${not review.locked}">
    Click on a diagram to add a comment. Comments can be moved by dragging, and edited by clicking on them.
    To delete a comment, just remove its text.
    <br />
    <b>Click the "Submit comment(s)" button above to submit your comments.</b>
    Once submitted, comments cannot be modified.
    <br /><br />
    </c:if>

    <c:choose>
    <c:when test="${empty review.workspaceId}">
    <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/unlock.svg" class="icon-xs" /> Public review |
    </c:when>
    <c:otherwise>
    <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/lock.svg" class="icon-xs" /> Private review |
    </c:otherwise>
    </c:choose>

    <c:choose>
    <c:when test="${review.type == 'General'}">
    <a href="https://c4model.com/review/" target="_blank">Software architecture diagram review checklist</a>
    </c:when>
        <c:when test="${review.type == 'Risk'}">
            <a href="https://riskstorming.com" target="_blank">Risk-storming</a>
        </c:when>
        <c:when test="${review.type == 'STRIDE'}">
            <a href="https://martinfowler.com/articles/agile-threat-modelling.html#UseStrideToHelp" target="_blank">STRIDE</a>: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
        </c:when>
    </c:choose>
</div>

<div id="diagrams">
</div>

<div id="floatingControls"></div>

<script nonce="${scriptNonce}">
    var jsonAsString = '${reviewAsJson}';
    var json;

    if (jsonAsString.length > 0) {
        json = JSON.parse(decodeBase64(jsonAsString));
    }

    var review = new structurizr.Review(json, '${reviewer}', json.locked === false);

    $(window).on("beforeunload", function() {
        if (review.isUnsavedChanges()) {
            return "There are unsaved changes.";
        }
    });

    function decodeBase64(str) {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
</script>