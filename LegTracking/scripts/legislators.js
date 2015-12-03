var legislatorsDataSource = null;
var legislatorUid;
var legislatorModel;
var initiativeSurveysReference = null;

function legislatorsListViewDataInit(e) 
{
    e.view.element.find("#legislatorsListView")
        .kendoMobileListView
        (
            { 
                dataSource: legislatorsDataSource,
                template: $("#legislatorsListViewTemplate").html(),
                filterable: 
                {
                    field: "FullName",
                    operator: "contains"
                },
                endlessScroll: true,
                pullToRefresh: true
            }
        )
        .kendoTouch
        (
            {
                filter: ">li",
                enableSwipe: true,
                touchstart: legislatorsTouchStart,
                tap: legislatorsNavigate,
                swipe: legislatorsSwipe
            }
        );

    $("#legislatorsForm input").keyup
    (
        function (e)
        {   //inputs on login view should call authenticateUser() method on 'enter'
            if (e.keyCode === 13)
            {
                $(this).blur(); //iOS likes to keep the keyboard open ... so remove focus to close it
            }
        }
    );
}

function legislatorsListViewDataShow(e)
{
    var legislatorsListView = $("#legislatorsListView").data("kendoMobileListView");
    //legislatorsListView.dataSource.page(0); //request the first page
    legislatorsListView.scroller().reset(); //reset the scroller

    setLegislatorsDataSource();

    legislatorsListView.setDataSource(legislatorsDataSource);
}

function legislatorsNavigate(e) 
{
    // Close the keyboard.
    $('input[type="search"]').blur();

    var uid = $(e.touch.currentTarget).data("uid");

    app.navigate("views/legislator.html?uid=" + uid);
}

function legislatorsSwipe(e) 
{
    if (e.direction === "left")
    {
        var detailbutton = $(e.touch.currentTarget).find("[data-role=detailbutton]");
        var tabstrip = kendo.fx($(e.touch.currentTarget).find("div.swipeButtons"));
        
        detailbutton.hide();
        tabstrip.expand().duration(200).play();
    }
}

function legislatorsTouchStart(e) 
{
    var target = $(e.touch.initialTouch)
    var listview = $("#legislatorsListView").data("kendoMobileListView")
    var model = legislatorsDataSource.getByUid($(e.touch.target).attr("data-uid"));
    var detailbutton = $(e.touch.target).find("[data-role=detailbutton]")
    var tabstrip = $(e.touch.target).find("div.swipeButtons:visible");

    if (target.closest("div.swipeButtons")[0]) 
    {
        var button = target.closest("[data-role=button]")[0];
        var buttonIcon = button.attributes["data-icon"].value;
        var legislatorId = model.LegislatorId;

        switch(buttonIcon)
        {
            case "add":
                //detailbutton.show();
                //tabstrip.hide();
                app.navigate("views/meeting.html?isAdd=Y&legislatorId=" + legislatorId);

                break;

            case "meeting-e":
                //detailbutton.show();
                //tabstrip.hide();

                app.navigate("views/meetings.html?reference=legislator&legislatorId=" + legislatorId);

                break;

            default:
                // Do nothing...

        }

        //prevent `swipe`
        this.events.cancel();
        e.event.stopPropagation();
    } 
    else if (tabstrip[0]) 
    {
        tabstrip.hide();
        detailbutton.show();

        //prevent `swipe`
        this.events.cancel();
    } 
    else 
    {
        listview.items().find("[data-role=detailbutton]").show();
        listview.items().find("div.swipeButtons:visible").hide();
    }
}

function setLegislatorsDataSource()
{
    legislatorsDataSource = null;

    legislatorsDataSource = new kendo.data.DataSource
    (
        {
            transport:
            {
                read:
                {
                    url: apiBaseServiceUrl + "legislatorfilter",
                    type: "get",
                    dataType: "json",
                    beforeSend: function (xhr)
                    {
                        xhr.setRequestHeader("Authorization", token);
                    },
                    error: function (xhr, ajaxOptions, thrownError)
                    {
                        alert("error " + xhr.responseText);
                    }
                },
                parameterMap: function (options)
                {
                    return {
                        filter: options.filter ? options.filter.filters[0].value : '',
                        page: options.page,
                        pageSize: options.pageSize
                    };
                }
            },
            schema:
            {
                model:
                {
                    id: "LegislatorId",
                    fields:
                    {
                        LegislatorId: "LegislatorId",
                        BioguideId: "BioguideId",
                        Birthdate: "Birthdate",
                        Chamber: "Chamber",
                        FullName: "FullName",
                        CrpId: "CrpId",
                        District: "District",
                        FacebookId: "FacebookId",
                        Fax: "Fax",
                        FirstName: "FirstName",
                        LastName: "LastName",
                        MiddleName: "MiddleName",
                        NameSuffix: "NameSuffix",
                        Nickname: "Nickname",
                        Gender: "Gender",
                        GovtrackId: "GovtrackId",
                        IcpsrId: "IcpsrId",
                        InOffice: "InOffice",
                        OcEmail: "OcEmail",
                        OcdId: "OcdId",
                        Office: "Office",
                        Party: "Party",
                        Phone: "Phone",
                        State: "State",
                        StateName: "StateName",
                        StateRank: "StateRank",
                        TermStart: "TermStart",
                        TermEnd: "TermEnd",
                        ThomasId: "ThomasId",
                        Title: "Title",
                        TwitterId: "TwitterId",
                        VotesmartId: "VotesmartId",
                        Website: "Website",
                        YouTubeUrl: "YouTubeUrl",
                        Bio: "Bio",
                        ImageUrl: "PictureUrl",
                        Description: "Description"
                    }
                },
                parse: function (data)
                {
                    // assign top level array to property
                    data.data = data;
                    // assign the count off one of the fields to a new total field
                    data.total = data.data[0].Total;

                    return data;
                },
                total: function (data)
                {
                    return data.total;
                }
            },
            serverPaging: true,
            serverFiltering: true,
            pageSize: 50
        }
    );
}