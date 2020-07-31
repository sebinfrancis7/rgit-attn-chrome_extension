var list = [];
var done = false;

function getPeople() {
    for (let name of document.querySelectorAll("[data-sort-key]")) {
        if (
            !list.includes(name.getAttribute("data-sort-key").split(" spaces/")[0])
        ) {
            list.push(name.getAttribute("data-sort-key").split(" spaces/")[0]);
        }
    }
    console.log(list);
}

function scrollList(element) {
    element.scrollTop = element.scrollHeight;
    var num = element.scrollTop;

    function scroll(n) {
        element.scrollTop = n;
        num = n - 100;
        if (element.scrollTop > 0) {
            var sl = setTimeout(function () {
                getPeople();
                scroll(num);
            }, 200);    
        }
        else done = true;
    }

    if (element.scrollTop > 0) {
        var sl = setTimeout(function () {
            scroll(num);
        }, 200);
    } else {
        getPeople();
        done = true;
    }
}

function collectinfo(callback) {
    // idk found this on stack overflow, checks if an element is visible on the screen
    function isHidden(el) {
        return el.offsetParent === null;
    }

    // check if people's list is already open
    if (document.querySelector('[aria-label*="participants."]') == null) {
        var plist = document.querySelector('[data-tooltip="Show everyone"]');
        // open list if its not open.
        plist.click();
    }
    // keep checking if the list is visible yet(i dont think this works)
    var checkExist = setInterval(function () {
        if (!isHidden(document.querySelector('[role="tabpanel"]'))) {
            console.log("Visible!");
            clearInterval(checkExist);
            callback();
        }
    }, 1000);
    // added wait cz the above interval thing doesnt work
    // await new Promise((r) => setTimeout(r, 2000));
}

//add a listener to start attendance reading code when we get a message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.action === 'getAttendance') {
        
        collectinfo(function () {
            // get the element to perform autoscroll in
            var list = document.querySelector('[role="tabpanel"]');
            //scroll list of people
            scrollList(list);
        });
        var Id = setInterval(() => {
            if(done) {
                clearInterval(Id);
                sendResponse({list}); 
            }
        }, 1000);
        return true;
    }
    
});
