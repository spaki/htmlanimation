var slideDurationId = null;

function getSlides() {
    var elements = document.querySelectorAll("#player > [data-transition-name]");
    return elements;
}

function reset(elements, defaultStyle) {
    if(slideDurationId)
        clearInterval(slideDurationId);

    for (i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.style = defaultStyle;
    }                  
}

function getDuration(element, transition) {
    var duration = element.dataset.slideDuration;
    var defaultValue = 3; // default value
    
    if(isNullOrEmpty(duration)) {
        var videoElement = element.querySelector("* video");
        
        if(!isNullOrEmpty(videoElement))
            duration = videoElement.duration;
    }

    if(isNullOrEmpty(duration))  
        duration = defaultValue; 

    duration = (duration * 1000) - transition;

    if(duration <= 0)
        duration = defaultValue * 1000;

    return duration;
}

function getTransitionTime(element) {
    var transition = element.dataset.transitionTime;
    
    if(isNullOrEmpty(transition)) 
        transition = 1; // default value

    return transition * 1000;
}

function playElement(element) {
    var videoElement = element.querySelector("video");
        
    if(!isNullOrEmpty(videoElement)){
        videoElement.play();
    }

    var elementsWithEffects = element.querySelectorAll("[data-effect]");

    if(!isNullOrEmpty(elementsWithEffects)){
        for (i = 0; i < elementsWithEffects.length; i++) {
            var element = elementsWithEffects[i];
            var effects = JSON.parse(element.dataset.effect);
            var waitTime = 0;

            for (j = 0; j < effects.length; j++) {
                var effect = effects[j];
                
                var effectFunction = getEffectFunction(effect.name);
                effectFunction(element, effect, waitTime);
                waitTime += effect.duration;
            }
        }
    }
}

function getEffectFunction(effectName) {
    if(effectName == "fade")
        return doFadeEffect;

    if(effectName == "blink")
        return doBlinkEffect;

    return doSlidyEffect;
}

function getTransictionFunction(element) {
    var transitionName = element.dataset.transitionName;

    if(transitionName == "fade")
        return doFadeTransition;

    return doSlidyTransition;
}

function getTransictionOptions(element) {
    var result = element.dataset.transitionOptions;
    return result;
}

function playTransition(elementA, elementB) {
    var time = getTransitionTime(elementB);
    var duration = getDuration(elementB, time);
    var transictionFunction = getTransictionFunction(elementB);

    playElement(elementB);
    transictionFunction(elementA, elementB, time);
    
    return duration;
}

function playPlaylist(){
    var slides = getSlides();

    if(isNullOrEmpty(slides))
        return;

    reset(slides, "");

    var duration = playTransition(null, slides[0]);
    var a = 0;
    var b = 1;

    var waitForDuration = function () {
        duration = playTransition(slides[a], slides[b]);
        a = b;
        b++;

        if(slides.length == b)
            b = 0;

        slideDurationId = setTimeout(waitForDuration, duration);
    };

    slideDurationId = setTimeout(waitForDuration, duration);
}


function getFadeStyle(opacity, interval) {
    var result = "display: block; opacity: " + opacity + "; transition: opacity " + interval + "ms ease;";
    return result;
}

function doFadeTransition(elementA, elementB, transitionTime) {
    if(!isNullOrEmpty(elementA)) {
        setTimeout(function() { elementA.style = getFadeStyle(1, 0); }, 0);
        setTimeout(function() { elementA.style = getFadeStyle(0, transitionTime); }, transitionTime);
    }

    if(!isNullOrEmpty(elementB)) {
        setTimeout(function() { elementB.style = getFadeStyle(0, 0); }, 0);
        setTimeout(function() { elementB.style = getFadeStyle(1, transitionTime); }, transitionTime);
    }
}


function getSlidyStyle(direction, sideValue, interval) {
    var result = "display: block; " + direction + ": " + sideValue + "; transition: " + direction + " " + interval + "ms ease;";
    return result;
}

function doSlidyTransition(elementA, elementB, transitionTime) {
    var direction = getTransictionOptions(elementB);

    if(isNullOrEmpty(direction)) 
        direction = "left";

    if(!isNullOrEmpty(elementA)) {
        setTimeout(function() { elementA.style = getSlidyStyle(direction, "0", 0); }, 0);
        setTimeout(function() { elementA.style = getSlidyStyle(direction, "-100%", transitionTime); }, transitionTime);
    }

    setTimeout(function() { elementB.style = getSlidyStyle(direction, "100%", 0); }, 0);
    setTimeout(function() { elementB.style = getSlidyStyle(direction, "0", transitionTime); }, transitionTime);
}


function getSlidyEffect(direction, sideValue, duration) {
    var result = direction + ": " + sideValue + "; transition: " + direction + " " + duration + "ms ease;";
    return result;
}

function doSlidyEffect(element, effect, delay) {
    setTimeout(function() { element.style = getSlidyEffect(effect.direction, effect.from, 0); }, delay);
    setTimeout(function() { element.style = getSlidyEffect(effect.direction, effect.to, effect.duration); }, effect.delay + delay);
}


function getFadeEffect(opacity, duration) {
    var result = "opacity: " + opacity + "; transition: opacity " + duration + "ms ease;";
    return result;
}

function doFadeEffect(element) {
    var duration = element.dataset.effectDuration * 1000;
    var delay = element.dataset.effectDelay * 1000;

    if(delay < 100)
        delay = 100;

    element.style = getFadeEffect(0, 0); 
    setTimeout(function() { element.style = getFadeEffect(1, duration); }, delay);
}


function getBlinkEffect(duration, times) {
    var result = "animation: blinker " + duration + "ms linear " + times + ";";
    return result;
}

function doBlinkEffect(element) {
    var duration = element.dataset.effectDuration * 1000;
    var delay = element.dataset.effectDelay * 1000;

    if(delay < 100)
        delay = 100;

    element.style = "opacity: 0;"; 
    setTimeout(function() { element.style = getBlinkEffect(duration, element.dataset.effectOptions); }, delay);
}


function isNullOrEmpty(value){
    return typeof value === "undefined" || value == null || value == "" || (typeof value === "string" && value.trim() == "") || (Array.isArray(value) && value.length < 1);
}


document.addEventListener("DOMContentLoaded", function(){
    playPlaylist();
    buildPlaylistSettings();
});


function buildPlaylistSettings() {
    var slides = getSlides();
    var container = document.getElementById("playlistContainer");
    var template = "<div>" + document.getElementById("playlistItemTemplate").innerHTML + "<div>";
    var html = "";

    for (i = 0; i < slides.length; i++) {
        html += template.replace(/\[i\]/g, i);
    }

    container.innerHTML = html;
}


function setValues() {
    var slides = getSlides();

    for (i = 0; i < slides.length; i++) {
        var transitionTime = document.getElementById("transitionTime_"+i).value;
        var slideDuration = document.getElementById("slideDuration_"+i).value;
        var transitionType = document.getElementById("transitionType_"+i);
        var transitionOption = document.getElementById("transitionOption_"+i);

        var slide = slides[i];
        slide.dataset.transitionTime = transitionTime;
        slide.dataset.slideDuration = slideDuration;
        slide.dataset.transitionName = transitionType.options[transitionType.selectedIndex].text;
        slide.dataset.transitionOptions = transitionOption.options[transitionOption.selectedIndex].text;
    }

    playPlaylist();  
}

function fullScreen(){
    var i = document.getElementById("player");

    if (i.requestFullscreen) {
        i
    } else if (i.webkitRequestFullscreen) {
        i.webkitRequestFullscreen();
    } else if (i.mozRequestFullScreen) {
        i.mozRequestFullScreen();
    } else if (i.msRequestFullscreen) {
        i.msRequestFullscreen();
    }
}