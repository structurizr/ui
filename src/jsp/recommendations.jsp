<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>
<%@ include file="/WEB-INF/fragments/progress-message.jspf" %>

<style>
    .recommendationRowHighPriority {
        border-top: #EA2805 solid 1px;
        border-right: #EA2805 solid 1px;
        border-bottom: #EA2805 solid 1px;
        border-left: #EA2805 solid 20px;
    }

    .recommendationRowMediumPriority {
        border-top: #EA8205 solid 1px;
        border-right: #EA8205 solid 1px;
        border-bottom: #EA8205 solid 1px;
        border-left: #EA8205 solid 20px;
    }

    .recommendationRowLowPriority {
        border-top: #058CEA solid 1px;
        border-right: #058CEA solid 1px;
        border-bottom: #058CEA solid 1px;
        border-left: #058CEA solid 20px;
    }

    .table>tbody>tr>td {
        border: none;
        padding: 20px;
    }
</style>

<div class="section">
    <div class="container centered">
        <h1>Recommendations (<span>${numberOfRecommendations}</span>)</h1>
        <p>
            <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/exclamation-triangle.svg" class="icon-sm" /> High: <span>${numberOfHighPriorityRecommendations}</span> |
            <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/exclamation-circle.svg" class="icon-sm" /> Medium: <span>${numberOfMediumPriorityRecommendations}</span> |
            <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/info-square.svg" class="icon-sm" /> Low: <span>${numberOfLowPriorityRecommendations}</span> |
            <a href="https://docs.structurizr.com/workspaces#recommendations" target="_blank">Help</a>
        </p>

        <br />

        <c:if test="${not empty error}">
        <c:out value="${error}" />
        </c:if>

        <div style="text-align: left; font-size: 16px">
            <table class="table">
                <tbody>
                <c:forEach var="recommendation" items="${recommendations}">
                    <c:choose>
                        <c:when test="${recommendation.priority eq 'High'}">
                    <tr class="recommendationRowHighPriority">
                        <td style="width: 150px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/exclamation-triangle.svg" class="icon-sm" /> High</td>
                        </c:when>
                        <c:when test="${recommendation.priority eq 'Medium'}">
                    <tr class="recommendationRowMediumPriority">
                        <td style="width: 150px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/exclamation-circle.svg" class="icon-sm" /> Medium</td>
                        </c:when>
                        <c:otherwise>
                    <tr class="recommendationRowLowPriority">
                        <td style="width: 150px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/info-square.svg" class="icon-sm" /> Low</td>
                        </c:otherwise>
                    </c:choose>
                        <td>
                            <c:out value="${recommendation.description}" />
                            <div class="smaller" style="margin-top: 10px"><c:out value="${recommendation.type}" /></div>
                        </td>
                    </tr>
                    <tr style="height: 10px"><td colspan="3"></td></tr>
                </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>

<c:if test="${structurizrConfiguration.type eq 'lite'}">
    <%@ include file="/WEB-INF/fragments/workspace/auto-refresh.jspf" %>
</c:if>