var PayScaleExtension = {
    ServiceURL: "//www.payscale.com",
    bubbleWidth: "400",
    bubbleHeight: "330",
    textColor: "#ffffff",
    backgroundColor: "#9a0000",
    borderColor: "#9acddf",
    chartBgColor: "#f0f9fa",
    chartFgColor: "#61adc0",
    campaignId: "",
    affiliateId: "",
    srcId: "wizzyBubble",
    cmPageId: "/syndication/?syndicated_joblisting_calculator",
    jobListing: false,

    // Make the logo slide up off the screen.
    slideLogo: function (loc) {
        if (loc > -100) {
            PayScaleExtension.picture.style.top = loc + "px";
            loc -= 1;
            setTimeout('PayScaleExtension.slideLogo(' + loc + ')', 20);
        }
    },

    showLogo: function () {
        PayScaleExtension.picture = document.body.appendChild(document.createElement("div"));
        PayScaleExtension.picture.id = "toplogo";
        PayScaleExtension.picture.style['position'] = "absolute";
        PayScaleExtension.picture.style['top'] = "0";
        PayScaleExtension.picture.style['right'] = "0";
        PayScaleExtension.picture.style['z-index'] = "auto";
        PayScaleExtension.picture.innerHTML = '<img src="' + PayScaleExtension.ServiceURL + '/images/topcorner.png" />';

        setTimeout('PayScaleExtension.slideLogo(0)', 3000);
    },

    addEvent: function (node, strEvent, func) {
        if (node.addEventListener) {
            node.addEventListener(strEvent, func, false);
        }
        else {
            if (node.attachEvent) {
                node.attachEvent("on" + strEvent, func);
            }
        }
    },

    removeEvent: function (node, strEvent, func) {
        if (node.removeEventListener) {
            node.removeEventListener(strEvent, func, false);
        }
        else {
            if (node.detachEvent) {
                node.detachEvent("on" + strEvent, func);
            }
        }
    },

    init: function () {
        // Mouse click listener (helps position window on spawn)
        PayScaleExtension.addEvent(document, "mousedown", PayScaleExtension.cleanup);
        PayScaleExtension.addEvent(document, "mousedown", PayScaleExtension.getMouseXY);
        PayScaleExtension.addEvent(window, "resize", PayScaleExtension.cleanup);
    },

    debug: function (e) {
        document.getElementById("debug").innerHTML = "mousedown" + e.clientX
    },

    displayChart: function (job, city, state, country) {
        // set size
        PayScaleExtension.bubbleWidth = 400;
        PayScaleExtension.bubbleHeight = 330;

        // set the location of the popup based on the mouse click and the bubble size
        PayScaleExtension.setBubbleLocation();

        // URL Encoded vars
        PayScaleExtension.processedJob = encodeURIComponent(job);
        PayScaleExtension.processedCity = encodeURIComponent(city);
        PayScaleExtension.processedState = encodeURIComponent(state);
        PayScaleExtension.processedCountry = encodeURIComponent(country);

        PayScaleExtension.baseFrameLoc = PayScaleExtension.ServiceURL + "/bookmarkletQuote.aspx?job=" + PayScaleExtension.processedJob + "&city=" + PayScaleExtension.processedCity + "&state=" + PayScaleExtension.processedState + "&country=" + PayScaleExtension.processedCountry;
        if (PayScaleExtension.affiliateId.length == 0) {
            PayScaleExtension.frameLoc = PayScaleExtension.baseFrameLoc;
        }
        else {
            // Set the affiliate id and src if they are needed
            PayScaleExtension.srcId = PayScaleExtension.affiliateId + "wizbub";
            PayScaleExtension.frameLoc = PayScaleExtension.baseFrameLoc + "&af=" + PayScaleExtension.affiliateId + "&src=" + PayScaleExtension.srcId;
        }
        PayScaleExtension.html = '<div id="wizzySquare"><div style="position:relative;font-family:Verdana,sans-serif;font-size:10pt;width:auto;padding:3px;background-color:#2e5c8a;color:#fff;"><div id="titleBarText">PayScale Salary Evaluator</div><img style="position:absolute;top:4px;right:3px;float:right;" onClick="PayScaleExtension.cleanup()" src="' + PayScaleExtension.ServiceURL + '/images/wizzy_close.png" alt="Close Window" /></div>';
        PayScaleExtension.html = PayScaleExtension.html + '<div id="wizzyMeat"><iframe src="' + PayScaleExtension.ServiceURL + '/bookmarkletLoading.htm" id="innerFrame" scrolling="NO" frameborder="0" style="padding:5px;"></iframe></div></div>';

        // Only one per page, thank you.
        if (document.getElementById("wizzyContainer")) {
            document.body.removeChild(document.getElementById("wizzyContainer"));
        }

        // Set our window location
        PayScaleExtension.StartY = PayScaleExtension.y;
        PayScaleExtension.StartX = PayScaleExtension.x;

        PayScaleExtension.container = document.body.appendChild(document.createElement("div"));
        PayScaleExtension.container.id = "wizzyContainer";
        PayScaleExtension.container.style['position'] = "absolute";
        PayScaleExtension.container.style['top'] = PayScaleExtension.StartY + "px";
        PayScaleExtension.container.style['left'] = PayScaleExtension.StartX + "px";
        PayScaleExtension.container.style['margin'] = "0";
        PayScaleExtension.container.style['padding'] = "0";
        PayScaleExtension.container.style.zIndex = "1000";

        // Add content to our snazzy lil wizzy
        PayScaleExtension.container.innerHTML = PayScaleExtension.html;
        PayScaleExtension.buttonClose = document.getElementById("wizzyClose");
        PayScaleExtension.innerFrame = document.getElementById("innerFrame");

        // Staticly set our size (Iframes dynamic width/height have cross site scripting problems)
        // We need to get element dimensions from payscale.com - but xxx.com will not allow it as it
        // is incompatible with DOM security model.
        PayScaleExtension.innerFrame.style['width'] = PayScaleExtension.bubbleWidth + "px";
        PayScaleExtension.innerFrame.style['height'] = PayScaleExtension.bubbleHeight + "px";

        // Load the chart page
        setTimeout("PayScaleExtension.innerFrame.src = '" + PayScaleExtension.frameLoc + "'", 300);

        // Let's style us some elements!
        PayScaleExtension.wizzySquare = document.getElementById("wizzySquare");
        PayScaleExtension.wizzySquare.id = "wizzySquare";
        PayScaleExtension.wizzySquare.style['position'] = "relative";
        PayScaleExtension.wizzySquare.style['border'] = "1px solid #2e5c8a";
        PayScaleExtension.wizzySquare.style['backgroundColor'] = "#fff";

        PayScaleExtension.titleBarText = document.getElementById("titleBarText");
        PayScaleExtension.titleBarText.style['font-family'] = "Verdana, sans-serif";
        PayScaleExtension.titleBarText.id = "titleBarText";
        PayScaleExtension.titleBarText.style['marginLeft'] = "5px";
        PayScaleExtension.titleBarText.style['position'] = "relative";

        PayScaleExtension.wizzyMeat = document.getElementById("wizzyMeat");
        PayScaleExtension.wizzyMeat.id = "wizzyMeat";
        PayScaleExtension.wizzyMeat.style['position'] = "relative";
    },

    displaySalaryCalculator: function (job, city, state, country, textcolor, backgroundcolor, location, joblisting) {
        // set default colors
        if (null == textcolor) textcolor = PayScaleExtension.textColor;
        if (null == backgroundcolor) backgroundcolor = PayScaleExtension.backgroundColor;
        if (null != joblisting) PayScaleExtension.jobListing = joblisting;

        if (null == job) job = '';
        if (null == city) city = '';
        if (null == state) state = '';
        if (null == country) country = 'United States';

        // set size
        PayScaleExtension.bubbleWidth = 300;
        PayScaleExtension.bubbleHeight = 250;

        // set the location of the popup based on the mouse click and the bubble size  
        var showWindowClose = true;

        if (null != location && '' != location) {
            var node = document.getElementById(location)
            if (null != node) {
                showWindowClose = false;
                PayScaleExtension.x = PayScaleExtension.findPosX(node);
                PayScaleExtension.y = PayScaleExtension.findPosY(node);
            }
        }
        else {
            PayScaleExtension.setBubbleLocation();
        }

        // URL Encoded vars
        PayScaleExtension.processedJob = encodeURIComponent(job);
        PayScaleExtension.processedCity = encodeURIComponent(city);
        PayScaleExtension.processedState = encodeURIComponent(state);
        PayScaleExtension.processedCountry = encodeURIComponent(country);
        PayScaleExtension.cmPageId = encodeURIComponent(PayScaleExtension.cmPageId);

        PayScaleExtension.baseFrameLoc = PayScaleExtension.ServiceURL + "/syndication/calculator_large.aspx?jobTitle=" + PayScaleExtension.processedJob + "&city=" + PayScaleExtension.processedCity + "&state=" + PayScaleExtension.processedState + "&country=" + PayScaleExtension.processedCountry + "&af=" + PayScaleExtension.affiliateId + "&src=" + PayScaleExtension.srcId + "&t=" + new Date().getTime() + "&cmPageId=" + PayScaleExtension.cmPageId;

        if (PayScaleExtension.jobListing) {
            PayScaleExtension.baseFrameLoc = PayScaleExtension.baseFrameLoc + "&joblistings=true";
        }

        PayScaleExtension.frameLoc = PayScaleExtension.baseFrameLoc;

        PayScaleExtension.html = '<div id="wizzySquare" style="width: 300px; height: 250px; border: 1px solid ' + backgroundcolor + '; overflow: hidden; font-family: Verdana; font-size: 12px">'
        PayScaleExtension.html = PayScaleExtension.html + '<div style="width: 300px; height: 24px;background-color: ' + backgroundcolor + '; font-family: Verdana; font-size: 14px;"><div style="padding: 2px; padding-left: 10px"><span style="color: ' + textcolor + ';font-family: Verdana; font-size: 14px;">Salary Calculator</span></div>';

        if (showWindowClose) {
            PayScaleExtension.html = PayScaleExtension.html + '<span style="color: ' + textcolor + ';font-family: Verdana; font-size: 14px;cursor:pointer;position:absolute;top:2px;right:5px;float:right;" onClick="PayScaleExtension.cleanup()">x</span>';
        }
        PayScaleExtension.html = PayScaleExtension.html + '</div>';
        PayScaleExtension.html = PayScaleExtension.html + '<iframe src="' + PayScaleExtension.ServiceURL + '/syndication/loading.htm" id="innerFrame" scrolling="NO" frameborder="0" style="padding: 0; margin: 0px"></iframe></div>';

        // Only one per page, thank you.
        if (document.getElementById("wizzyContainer")) {
            PayScaleExtension.container = document.getElementById("wizzyContainer");
            //document.body.removeChild(document.getElementById("wizzyContainer"));
        }
        else {
            PayScaleExtension.container = document.body.appendChild(document.createElement("div"));
            PayScaleExtension.container.id = "wizzyContainer";
        }

        // Set our window location
        PayScaleExtension.StartY = PayScaleExtension.y;
        PayScaleExtension.StartX = PayScaleExtension.x;


        PayScaleExtension.container.style['position'] = "absolute";
        PayScaleExtension.container.style['top'] = PayScaleExtension.StartY + "px";
        PayScaleExtension.container.style['left'] = PayScaleExtension.StartX + "px";
        PayScaleExtension.container.style['margin'] = "0";
        PayScaleExtension.container.style['padding'] = "0";
        PayScaleExtension.container.style.zIndex = "1000";


        // Add content to our snazzy lil wizzy
        PayScaleExtension.container.innerHTML = PayScaleExtension.html;
        PayScaleExtension.buttonClose = document.getElementById("wizzyClose");
        PayScaleExtension.innerFrame = document.getElementById("innerFrame");

        // Staticly set our size (Iframes dynamic width/height have cross site scripting problems)
        // We need to get element dimensions from payscale.com - but xxx.com will not allow it as it
        // is incompatible with DOM security model.
        PayScaleExtension.innerFrame.style['width'] = PayScaleExtension.bubbleWidth + "px";
        PayScaleExtension.innerFrame.style['height'] = PayScaleExtension.bubbleHeight + "px";
        PayScaleExtension.innerFrame.style['font-family'] = "Verdana";

        // Load the chart page
        setTimeout("PayScaleExtension.innerFrame.src = '" + PayScaleExtension.frameLoc + "'", 300);

        // Let's style us some elements!
        PayScaleExtension.wizzySquare = document.getElementById("wizzySquare");
        PayScaleExtension.wizzySquare.id = "wizzySquare";
        PayScaleExtension.wizzySquare.style['position'] = "relative";
        PayScaleExtension.wizzySquare.style['backgroundColor'] = "#fff";


    },

    displaySalaryCalculatorV3R: function (job, city, state, country, textcolor, backgroundcolor, locationContent, joblisting, locationResults, spanReset) {
        // set default colors
        if (null == textcolor) textcolor = PayScaleExtension.textColor;
        if (null == backgroundcolor) backgroundcolor = PayScaleExtension.backgroundColor;
        if (null != joblisting) PayScaleExtension.jobListing = joblisting;

        if (null == job) job = '';
        if (null == city) city = '';
        if (null == state) state = '';
        if (null == country) country = 'United States';

        var nodeContent = document.getElementById(locationContent);
        var nodeResults = document.getElementById(locationResults);

        PayScaleExtension.processedJob = encodeURIComponent(job);
        PayScaleExtension.processedCity = encodeURIComponent(city);
        PayScaleExtension.processedState = encodeURIComponent(state);
        PayScaleExtension.processedCountry = encodeURIComponent(country);
        PayScaleExtension.cmPageId = encodeURIComponent(PayScaleExtension.cmPageId);

        if (null != nodeContent && null != nodeResults) {
            var widthContainer = nodeContent.offsetWidth;
            var heightContainer = nodeContent.offsetHeight;
            var charWidth = widthContainer - 20;
            nodeContent.style.display = "none";
            nodeResults.style.display = "block";
            nodeResults.innerHTML = '<iframe id="PayscaleSalaryCalculatorInnerFrame" frameborder="0" scrolling="no" style="padding: 0; margin: 0;" width=' + widthContainer + ' height=' + heightContainer + ' src="' + PayScaleExtension.ServiceURL + '/syndication/loading.htm"' + '></iframe>';
            var nodeReset = document.getElementById(spanReset);
            if (null != nodeReset) {
                nodeReset.style.display = "inline";
            }

            var iframeElement = document.getElementById("PayscaleSalaryCalculatorInnerFrame");
            var iframeUrl = PayScaleExtension.ServiceURL + "/syndication/total_pay_chart.aspx?job=" + PayScaleExtension.processedJob + "&title=1&city=" + PayScaleExtension.processedCity + "&state=" + PayScaleExtension.processedState + "&country=" + PayScaleExtension.processedCountry + "&af=" + PayScaleExtension.affiliateId + "&src=" + PayScaleExtension.srcId + "&t=" + new Date().getTime() + "&cmPageId=" + PayScaleExtension.cmPageId + "&width=" + charWidth + "px&shownext=true";
            setTimeout(function () { iframeElement.src = iframeUrl; }, 300);
        }
    },

    resetSalaryCalculatorV3R: function (locationContent, locationResults, spanReset) {
        var nodeReset = document.getElementById(spanReset);
        if (null != nodeReset) {
            nodeReset.style.display = "none";
        }
        var nodeContent = document.getElementById(locationContent);
        var nodeResults = document.getElementById(locationResults);
        if (null != nodeContent && null != nodeResults) {
            nodeContent.style.display = "block";
            nodeResults.style.display = "none";
        }
    },

    displaySalaryCalculatorV3: function (job, city, state, country, textcolor, backgroundcolor, location, joblisting) {
        // set default colors
        if (null == textcolor) textcolor = PayScaleExtension.textColor;
        if (null == backgroundcolor) backgroundcolor = PayScaleExtension.backgroundColor;
        if (null != joblisting) PayScaleExtension.jobListing = joblisting;

        if (null == job) job = '';
        if (null == city) city = '';
        if (null == state) state = '';
        if (null == country) country = 'United States';

        // set size
        PayScaleExtension.bubbleWidth = 300;
        PayScaleExtension.bubbleHeight = 230;

        if (null != location && '' != location) {
            var node = document.getElementById(location)
            if (null != node) {
                PayScaleExtension.x = PayScaleExtension.findPosX(node);
                PayScaleExtension.y = PayScaleExtension.findPosY(node);
            }
        }
        else {
            PayScaleExtension.setBubbleLocation();
        }

        // URL Encoded vars
        PayScaleExtension.processedJob = encodeURIComponent(job);
        PayScaleExtension.processedCity = encodeURIComponent(city);
        PayScaleExtension.processedState = encodeURIComponent(state);
        PayScaleExtension.processedCountry = encodeURIComponent(country);
        PayScaleExtension.cmPageId = encodeURIComponent(PayScaleExtension.cmPageId);

        PayScaleExtension.baseFrameLoc = PayScaleExtension.ServiceURL + "/syndication/total_pay_chart.aspx?job=" + PayScaleExtension.processedJob + "&title=1&city=" + PayScaleExtension.processedCity + "&state=" + PayScaleExtension.processedState + "&country=" + PayScaleExtension.processedCountry + "&af=" + PayScaleExtension.affiliateId + "&src=" + PayScaleExtension.srcId + "&t=" + new Date().getTime() + "&cmPageId=" + PayScaleExtension.cmPageId + "&width=290px&height=220px&shownext=true";

        if (PayScaleExtension.jobListing) {
            PayScaleExtension.baseFrameLoc = PayScaleExtension.baseFrameLoc + "&joblistings=true";
        }

        PayScaleExtension.frameLoc = PayScaleExtension.baseFrameLoc;

        PayScaleExtension.html = '<div id="wizzySquare" style="width: 300px; height: 43px; border-bottom: 1px solid #cecece; overflow: hidden; font-family: \'Open Sans\', sans-serif; font-size: 12px">';
        PayScaleExtension.html = PayScaleExtension.html + '<div style="width: 190px; float: left; background-color: #ffffff; color: ' + textcolor + '; font-family: \'Open Sans\', sans-serif; font-size: 18px; font-weight: bold; line-height: 43px; margin-left: 15px; text-transform: uppercase;"><span style="cursor: pointer">&laquo;</span> Salary Research</div>';
        PayScaleExtension.html = PayScaleExtension.html + '<div style="width: 90px; float: right; margin-top: 5px;"><a href="' + PayScaleExtension.ServiceURL + '" target="_blank"><img src="' + PayScaleExtension.ServiceURL + '/images/powered-by-payscale.png" alt="PayScale" style="border: 0" width="82" height="28" /></a></div>';
        PayScaleExtension.html = PayScaleExtension.html + '</div>';
        PayScaleExtension.html = PayScaleExtension.html + '<iframe src="' + PayScaleExtension.ServiceURL + '/syndication/loading.htm" id="innerFrame" scrolling="NO" frameborder="0" style="padding: 0; margin: 0px"></iframe></div>';

        // Only one per page, thank you.
        if (document.getElementById("wizzyContainer")) {
            PayScaleExtension.container = document.getElementById("wizzyContainer");
        }
        else {
            PayScaleExtension.container = document.body.appendChild(document.createElement("div"));
            PayScaleExtension.container.id = "wizzyContainer";
        }

        // Set our window location
        PayScaleExtension.StartY = PayScaleExtension.y;
        PayScaleExtension.StartX = PayScaleExtension.x;


        PayScaleExtension.container.style['position'] = "absolute";
        PayScaleExtension.container.style['top'] = PayScaleExtension.StartY + "px";
        PayScaleExtension.container.style['left'] = PayScaleExtension.StartX + "px";
        PayScaleExtension.container.style['margin'] = "0";
        PayScaleExtension.container.style['padding'] = "0";
        PayScaleExtension.container.style.zIndex = "1000";
        PayScaleExtension.container.style['background-color'] = '#fff';

        // Add content to our snazzy lil wizzy
        PayScaleExtension.container.innerHTML = PayScaleExtension.html;
        PayScaleExtension.buttonClose = document.getElementById("wizzyClose");
        PayScaleExtension.innerFrame = document.getElementById("innerFrame");

        // Staticly set our size (Iframes dynamic width/height have cross site scripting problems)
        // We need to get element dimensions from payscale.com - but xxx.com will not allow it as it
        // is incompatible with DOM security model.
        PayScaleExtension.innerFrame.style['width'] = PayScaleExtension.bubbleWidth + "px";
        PayScaleExtension.innerFrame.style['height'] = PayScaleExtension.bubbleHeight + "px";
        PayScaleExtension.innerFrame.style['font-family'] = "'Open Sans',sans-serif";

        // Load the chart page
        setTimeout("PayScaleExtension.innerFrame.src = '" + PayScaleExtension.frameLoc + "'", 300);

        // Let's style us some elements!
        PayScaleExtension.wizzySquare = document.getElementById("wizzySquare");
        PayScaleExtension.wizzySquare.id = "wizzySquare";
        PayScaleExtension.wizzySquare.style['position'] = "relative";
    },

    displayMarketRateCalculator: function (job, city, state, country, bordercolor, chartBgColor, chartFgColor, location) {
        // set default colors
        //        PayScaleExtension.borderColor = '#9acddf';
        //        PayScaleExtension.chartBgColor = '#f0f9fa';
        //        PayScaleExtension.chartFgColor = '#61adc0';
        //        PayScaleExtension.textColor = '#000';
        PayScaleExtension.cmPageId = "market_rate_calculator";

        if (null == bordercolor) bordercolor = PayScaleExtension.borderColor;
        if (null == chartBgColor) chartBgColor = PayScaleExtension.chartBgColor;
        if (null == chartFgColor) chartFgColor = PayScaleExtension.chartFgColor;

        if (null == job) job = '';
        if (null == city) city = '';
        if (null == state) state = '';
        if (null == country) country = 'United States';

        // set size
        PayScaleExtension.bubbleWidth = 700;
        PayScaleExtension.bubbleHeight = 300;

        // set the location of the popup based on the mouse click and the bubble size  
        var showWindowClose = true;

        if (null != location && '' != location) {
            var node = document.getElementById(location)
            if (null != node) {
                showWindowClose = false;
                PayScaleExtension.x = PayScaleExtension.findPosX(node);
                PayScaleExtension.y = PayScaleExtension.findPosY(node);
            }
        }
        else {
            PayScaleExtension.setBubbleLocation();
        }

        // URL Encoded vars
        PayScaleExtension.processedJob = encodeURIComponent(job);
        PayScaleExtension.processedCity = encodeURIComponent(city);
        PayScaleExtension.processedState = encodeURIComponent(state);
        PayScaleExtension.processedCountry = encodeURIComponent(country);
        PayScaleExtension.cmPageId = encodeURIComponent(PayScaleExtension.cmPageId);

        PayScaleExtension.baseFrameLoc = PayScaleExtension.ServiceURL + "/syndication/market_rate_calculator.aspx?jobTitle=" + PayScaleExtension.processedJob
                                            + "&city=" + PayScaleExtension.processedCity
                                            + "&state=" + PayScaleExtension.processedState
                                            + "&country=" + PayScaleExtension.processedCountry
                                            + "&af=" + PayScaleExtension.affiliateId
                                            + "&cmpid=" + PayScaleExtension.campaignId
                                            + "&chartbg=" + chartBgColor.replace('#', '')
                                            + "&chartfg=" + chartFgColor.replace('#', '')
                                            + "&src=" + PayScaleExtension.srcId
                                            + "&t=" + new Date().getTime()
                                            + "&cmPageId=" + PayScaleExtension.cmPageId;

        if (PayScaleExtension.jobListing) {
            PayScaleExtension.baseFrameLoc = PayScaleExtension.baseFrameLoc + "&joblistings=true";
        }

        PayScaleExtension.frameLoc = PayScaleExtension.baseFrameLoc;

        PayScaleExtension.html = '<div id="wizzySquare" style="width: ' + PayScaleExtension.bubbleWidth + 'px; height: ' + PayScaleExtension.bubbleHeight + 'px; border: 5px solid ' + bordercolor + '; overflow: hidden; font-family: Verdana; font-size: 12px;">'
        PayScaleExtension.html = PayScaleExtension.html + '<div style="width: ' + PayScaleExtension.bubbleWidth + 'px; height: 30px;background-color: #fff; font-family: Verdana; font-size: 15px;"><img src=\"' + PayScaleExtension.ServiceURL + '/images/payscale_logo_90x32.gif\" height=32px width=90px style=\"float:left; margin-left:10px; margin-top:5px;\"/><div style="padding: 14px 20px 10px 10px;"><span style="margin-left:3px;color: #999;font-family: Verdana; font-size: 15px;font-weight:bold;">MarketRate Summary</span></div>';

        if (showWindowClose) {
            PayScaleExtension.html = PayScaleExtension.html + '<span style="color: #000;font-family: Verdana; font-weight:bold; font-size: 11px;cursor:pointer;position:absolute;top:10px;right:15px;float:right;" onClick="PayScaleExtension.cleanup()">Close Window [X]</span>';
        }
        PayScaleExtension.html = PayScaleExtension.html + '</div>';
        PayScaleExtension.html = PayScaleExtension.html + '<iframe src="' + PayScaleExtension.ServiceURL + '/syndication/loading.htm" id="innerFrame" scrolling="NO" frameborder="0" style="padding: 0; margin: 0px"></iframe></div>';

        // Only one per page, thank you.
        if (document.getElementById("wizzyContainer")) {
            PayScaleExtension.container = document.getElementById("wizzyContainer");
            //document.body.removeChild(document.getElementById("wizzyContainer"));
        }
        else {
            PayScaleExtension.container = document.body.appendChild(document.createElement("div"));
            PayScaleExtension.container.id = "wizzyContainer";
        }

        // Set our window location
        PayScaleExtension.StartY = PayScaleExtension.y;
        PayScaleExtension.StartX = PayScaleExtension.x;


        PayScaleExtension.container.style['position'] = "absolute";
        PayScaleExtension.container.style['top'] = PayScaleExtension.StartY + "px";
        PayScaleExtension.container.style['left'] = PayScaleExtension.StartX + "px";
        PayScaleExtension.container.style['margin'] = "0";
        PayScaleExtension.container.style['padding'] = "0";
        PayScaleExtension.container.style['z-index'] = "1000";


        // Add content to our snazzy lil wizzy
        PayScaleExtension.container.innerHTML = PayScaleExtension.html;
        PayScaleExtension.buttonClose = document.getElementById("wizzyClose");
        PayScaleExtension.innerFrame = document.getElementById("innerFrame");

        // Staticly set our size (Iframes dynamic width/height have cross site scripting problems)
        // We need to get element dimensions from payscale.com - but xxx.com will not allow it as it
        // is incompatible with DOM security model.
        PayScaleExtension.innerFrame.style['width'] = PayScaleExtension.bubbleWidth + "px";
        PayScaleExtension.innerFrame.style['height'] = PayScaleExtension.bubbleHeight + "px";
        PayScaleExtension.innerFrame.style['font-family'] = "Verdana";

        // Load the chart page
        setTimeout("PayScaleExtension.innerFrame.src = '" + PayScaleExtension.frameLoc + "'", 300);

        // Let's style us some elements!
        PayScaleExtension.wizzySquare = document.getElementById("wizzySquare");
        PayScaleExtension.wizzySquare.id = "wizzySquare";
        PayScaleExtension.wizzySquare.style['position'] = "relative";
        PayScaleExtension.wizzySquare.style['backgroundColor'] = "#fff";


    },

    getMouseXY: function (e) {
        PayScaleExtension.IE = document.all ? true : false
        if (PayScaleExtension.IE) {
            PayScaleExtension.x = event.clientX
            PayScaleExtension.y = event.clientY
        } else {
            PayScaleExtension.x = e.pageX
            PayScaleExtension.y = e.pageY
        }

        // catch possible negative values
        if (PayScaleExtension.x < 0) {
            PayScaleExtension.x = 0
        }
        if (PayScaleExtension.y < 0) {
            PayScaleExtension.y = 0
        }

        return true;
    },

    setBubbleLocation: function () {

        // get the window dimensions
        var myWidth = 0, myHeight = 0;
        if (typeof (window.innerWidth) == 'number') {
            //Non-IE
            myWidth = window.innerWidth;
            myHeight = window.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            myWidth = document.documentElement.clientWidth;
            myHeight = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible
            myWidth = document.body.clientWidth;
            myHeight = document.body.clientHeight;
        }

        // get the scroll amount
        var scrOfX = 0, scrOfY = 0;
        if (typeof (window.pageYOffset) == 'number') {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
        }


        //document.getElementById("debug").innerHTML = "myHeight: " + myHeight + " scrOfY: " + scrOfY + " y: " + PayScaleExtension.y

        // Don't let the bubble drop off the bottom of the page.        
        if (PayScaleExtension.IE) {
            if ((myHeight - PayScaleExtension.y) < PayScaleExtension.bubbleHeight) {
                PayScaleExtension.y = PayScaleExtension.y + scrOfY - PayScaleExtension.bubbleHeight;
            }
            else {
                PayScaleExtension.y = PayScaleExtension.y + scrOfY;
            }
        }
        else {
            if (((myHeight + scrOfY) - PayScaleExtension.y) < PayScaleExtension.bubbleHeight) {
                PayScaleExtension.y = PayScaleExtension.y - PayScaleExtension.bubbleHeight;
            }
        }

        // Don't let the bubble drop off the side of the page.
        if ((myWidth - PayScaleExtension.x) < PayScaleExtension.bubbleWidth) {
            PayScaleExtension.x = PayScaleExtension.x - PayScaleExtension.bubbleWidth;
        }

        //ensure that the bubble is not pushed off the left or top of browser
        if (PayScaleExtension.x < 0) { PayScaleExtension.x = 0; }
        if (PayScaleExtension.y < 0) { PayScaleExtension.y = 0; }


        return true;
    },


    fillFrame: function (fillFrame) {
        fillFrame.src = ps.frameLoc;
    },

    cleanup: function () {
        if (null != document.getElementById("wizzyContainer")) {
            document.body.removeChild(document.getElementById("wizzyContainer"));
        }
    },

    findPosX: function (obj) {
        var curleft = 0;
        if (obj.offsetParent) {
            while (obj.offsetParent) {
                curleft += obj.offsetLeft
                obj = obj.offsetParent;
            }
        }
        else if (obj.x)
            curleft += obj.x;
        return curleft;
    },

    findPosY: function (obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            while (obj.offsetParent) {
                curtop += obj.offsetTop
                obj = obj.offsetParent;
            }
        }
        else if (obj.y)
            curtop += obj.y;
        return curtop;
    }

}
